<?php

namespace App\Http\Controllers;

use App\Models\PremiumTransaction;
use Illuminate\Support\Facades\Storage;

/**
 * PremiumTransactionController
 *
 * Menyediakan endpoint untuk data Premium Highlights di dashboard.
 */
class PremiumTransactionController extends Controller
{
    use ApiResponseHelper;

    /**
     * GET /api/premium-transactions/highlights
     *
     * Mengambil daftar Premium Post yang sudah berhasil dibayar (status = 'paid').
     * Digunakan oleh section "Premium Highlights" di halaman dashboard.
     *
     * - Hanya transaksi dengan status 'paid' yang dikembalikan.
     * - Diurutkan dari yang terbaru (berdasarkan paid_at, fallback ke created_at).
     * - Dibatasi maksimal 4 item agar sesuai layout dashboard.
     * - Menyertakan URL gambar lampiran jika ada (via model accessor).
     */
    public function highlights()
    {
        $highlights = PremiumTransaction::with('user')
            ->where('status', 'paid')
            ->orderByDesc('paid_at')
            ->orderByDesc('created_at')
            ->limit(4)
            ->get()
            ->map(function (PremiumTransaction $tx) {
                return [
                    'id'             => $tx->id,
                    'userId'         => $tx->user_id,
                    'postTitle'      => $tx->post_title,
                    'attachmentPath' => $tx->attachment_path,
                    'imageUrl'       => $tx->imageUrl, // Menggunakan accessor dari model
                    'duration'       => $tx->duration,
                    'amount'         => $tx->amount,
                    'paymentType'    => $tx->payment_type,
                    'paidAt'         => $tx->paid_at?->toISOString(),
                    'createdAt'      => $tx->created_at->toISOString(),
                    'updatedAt'      => $tx->updated_at->toISOString(),
                    'user'           => $tx->user ? [
                        'id'   => $tx->user->id,
                        'name' => $tx->user->name,
                    ] : null,
                ];
            });

        return response()->json(['data' => $highlights]);
    }
}
