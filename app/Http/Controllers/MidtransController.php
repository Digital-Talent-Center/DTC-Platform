<?php

namespace App\Http\Controllers;

use App\Models\PremiumTransaction;
use App\Services\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * MidtransController
 *
 * Menangani:
 * 1. createTransaction     → generate Snap token, simpan record pending
 * 2. handleNotification    → webhook callback dari Midtrans, update status
 * 3. checkAndMarkPaid      → dipanggil frontend setelah onSuccess Snap,
 *                            verifikasi ke Midtrans API & update status di DB.
 *                            Diperlukan saat berjalan di localhost karena
 *                            Midtrans webhook tidak bisa menjangkau 127.0.0.1.
 *
 * Security:
 * - Server Key hanya digunakan di MidtransService (backend only)
 * - Nominal transaksi dihitung ulang di server (tidak percaya data dari frontend)
 * - Order ID divalidasi sebelum update status (idempotent safe)
 */
class MidtransController extends Controller
{
    use ApiResponseHelper;

    // Daftar harga resmi di server — frontend tidak bisa manipulasi
    private const PRICES = [
        '7-hari'  => 49000,
        '1-bulan' => 149000,
        '3-bulan' => 399000,
    ];

    private const TAX_RATE = 0.11;

    public function __construct(private readonly MidtransService $midtrans) {}

    /**
     * POST /api/midtrans/upload-attachment  (auth required)
     *
     * Upload file lampiran untuk Premium Post.
     * Mengembalikan path yang bisa disimpan ke DB dan URL publik untuk preview.
     */
    public function uploadAttachment(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,png,jpg,jpeg|max:10240',
        ]);

        $file = $request->file('file');
        $path = $file->store('premium-attachments', 'public');

        return response()->json([
            'path'     => $path,
            'url'      => Storage::disk('public')->url($path),
            'filename' => $file->getClientOriginalName(),
        ]);
    }

    /**
     * POST /api/midtrans/create-transaction
     *
     * Membuat transaksi baru, generate Snap token, simpan ke DB.
     * Return snap_token dan client_key ke frontend.
     */
    public function createTransaction(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'duration'        => 'required|in:7-hari,1-bulan,3-bulan',
            'post_title'      => 'required|string|max:255',
            'attachment_path' => 'nullable|string|max:500',
        ]);

        $user = Auth::user();

        // Hitung harga di server — aman dari manipulasi frontend
        $subtotal = self::PRICES[$validated['duration']];
        $tax      = (int) round($subtotal * self::TAX_RATE);
        $total    = $subtotal + $tax;

        // Generate unique order ID
        $orderId = 'DTC-' . strtoupper(Str::random(8)) . '-' . time();

        // Build parameter Midtrans
        $params = $this->midtrans->buildTransactionParams(
            orderId:  $orderId,
            amount:   $total,
            customer: [
                'name'  => $user->name,
                'email' => $user->email,
            ],
            items: [
                [
                    'id'       => 'premium-post-' . $validated['duration'],
                    'price'    => $subtotal,
                    'quantity' => 1,
                    'name'     => 'Premium Post (' . $validated['duration'] . ')',
                ],
                [
                    'id'       => 'ppn-11',
                    'price'    => $tax,
                    'quantity' => 1,
                    'name'     => 'PPN 11%',
                ],
            ]
        );

        try {
            $snapToken = $this->midtrans->createSnapToken($params);

            // Simpan transaksi dengan status pending
            PremiumTransaction::create([
                'user_id'         => $user->id,
                'order_id'        => $orderId,
                'snap_token'      => $snapToken,
                'amount'          => $total,
                'duration'        => $validated['duration'],
                'post_title'      => $validated['post_title'],
                'attachment_path' => $validated['attachment_path'] ?? null,
                'status'          => 'pending',
            ]);

            return response()->json([
                'snap_token' => $snapToken,
                'client_key' => config('services.midtrans.client_key'),
                'order_id'   => $orderId,
                'amount'     => $total,
            ]);

        } catch (\Exception $e) {
            Log::error('Midtrans createTransaction error', [
                'user_id' => $user->id,
                'error'   => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Gagal menghubungi payment gateway. Silakan coba lagi.',
            ], 500);
        }
    }

    /**
     * POST /api/midtrans/notification  (webhook — tidak memerlukan auth user)
     *
     * Dipanggil oleh server Midtrans untuk mengupdate status transaksi.
     * Endpoint ini harus bisa diakses tanpa sesi user (public).
     * Idempotent: update diabaikan jika status sudah 'paid'.
     */
    public function handleNotification(Request $request): JsonResponse
    {
        try {
            $notification = $this->midtrans->parseNotification();

            $orderId           = $notification->order_id;
            $transactionStatus = $notification->transaction_status;
            $fraudStatus       = $notification->fraud_status ?? null;
            $transactionId     = $notification->transaction_id ?? null;
            $paymentType       = $notification->payment_type ?? null;

            // Cari transaksi di DB
            $transaction = PremiumTransaction::where('order_id', $orderId)->first();

            if (!$transaction) {
                Log::warning('Midtrans notification: order_id not found', ['order_id' => $orderId]);
                return response()->json(['message' => 'Order not found'], 404);
            }

            // Idempotent: jika sudah paid, skip
            if ($transaction->status === 'paid') {
                return response()->json(['message' => 'Already processed']);
            }

            // Resolve status
            $newStatus = $this->midtrans->resolvePaymentStatus($transactionStatus, $fraudStatus);

            // Update transaksi
            $transaction->update([
                'status'                  => $newStatus,
                'midtrans_transaction_id' => $transactionId,
                'payment_type'            => $paymentType,
                'paid_at'                 => $newStatus === 'paid' ? now() : null,
            ]);

            Log::info('Midtrans notification processed', [
                'order_id'  => $orderId,
                'status'    => $newStatus,
                'tx_status' => $transactionStatus,
            ]);

            return response()->json(['message' => 'OK']);

        } catch (\Exception $e) {
            Log::error('Midtrans notification error', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Internal server error'], 500);
        }
    }

    /**
     * POST /api/midtrans/check-and-mark-paid  (auth required)
     *
     * Dipanggil oleh frontend setelah Midtrans Snap `onSuccess` callback.
     * Diperlukan terutama saat berjalan di localhost karena server Midtrans
     * tidak dapat menjangkau 127.0.0.1 untuk mengirim webhook.
     *
     * Flow:
     * 1. Frontend kirim order_id milik user yang sedang login
     * 2. Backend verifikasi order_id milik user tersebut (security check)
     * 3. Backend query status transaksi ke Midtrans API (server-to-server)
     * 4. Jika Midtrans konfirmasi settlement/capture → update status ke 'paid'
     * 5. Return status terbaru ke frontend
     *
     * Idempotent: aman dipanggil berkali-kali.
     */
    public function checkAndMarkPaid(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|string|max:100',
        ]);

        $user    = Auth::user();
        $orderId = $validated['order_id'];

        // Cari transaksi milik user yang sedang login — mencegah manipulasi antar user
        $transaction = PremiumTransaction::where('order_id', $orderId)
            ->where('user_id', $user->id)
            ->first();

        if (!$transaction) {
            return response()->json(['message' => 'Transaksi tidak ditemukan.'], 404);
        }

        // Idempotent: jika sudah paid, langsung return sukses
        if ($transaction->status === 'paid') {
            return response()->json(['status' => 'paid', 'message' => 'Sudah dibayar.']);
        }

        try {
            // Query status transaksi langsung ke Midtrans API (server-to-server)
            $midtransStatus = $this->midtrans->getTransactionStatus($orderId);

            $transactionStatus = $midtransStatus['transaction_status'] ?? 'pending';
            $fraudStatus       = $midtransStatus['fraud_status'] ?? null;
            $transactionId     = $midtransStatus['transaction_id'] ?? null;
            $paymentType       = $midtransStatus['payment_type'] ?? null;

            $newStatus = $this->midtrans->resolvePaymentStatus($transactionStatus, $fraudStatus);

            // Update hanya jika status berubah
            if ($newStatus !== $transaction->status) {
                $transaction->update([
                    'status'                  => $newStatus,
                    'midtrans_transaction_id' => $transactionId,
                    'payment_type'            => $paymentType,
                    'paid_at'                 => $newStatus === 'paid' ? now() : null,
                ]);

                Log::info('checkAndMarkPaid: status updated', [
                    'order_id'   => $orderId,
                    'user_id'    => $user->id,
                    'new_status' => $newStatus,
                ]);
            }

            return response()->json(['status' => $newStatus]);

        } catch (\Exception $e) {
            Log::error('checkAndMarkPaid error', [
                'order_id' => $orderId,
                'error'    => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Gagal memverifikasi status pembayaran: ' . $e->getMessage(),
            ], 500);
        }
    }
}
