<?php

namespace App\Http\Controllers;

use App\Models\PremiumTransaction;
use App\Services\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * MidtransController
 *
 * Menangani:
 * 1. createTransaction → generate Snap token, simpan record pending
 * 2. handleNotification → webhook callback dari Midtrans, update status
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
     * POST /api/midtrans/create-transaction
     *
     * Membuat transaksi baru, generate Snap token, simpan ke DB.
     * Return snap_token dan client_key ke frontend.
     */
    public function createTransaction(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'duration'   => 'required|in:7-hari,1-bulan,3-bulan',
            'post_title' => 'required|string|max:255',
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
                'user_id'    => $user->id,
                'order_id'   => $orderId,
                'snap_token' => $snapToken,
                'amount'     => $total,
                'duration'   => $validated['duration'],
                'post_title' => $validated['post_title'],
                'status'     => 'pending',
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
}
