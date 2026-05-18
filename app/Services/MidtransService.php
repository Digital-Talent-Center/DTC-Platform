<?php

namespace App\Services;

use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Notification;

/**
 * MidtransService
 *
 * Centralized service for all Midtrans Snap API interactions.
 * Server Key hanya ada di sini — tidak pernah dikirim ke frontend.
 */
class MidtransService
{
    public function __construct()
    {
        Config::$serverKey    = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production', false);
        Config::$isSanitized  = true;
        Config::$is3ds        = true;
    }

    /**
     * Generate Snap token untuk pembayaran.
     *
     * @param  array  $params  Parameter transaksi Midtrans
     * @return string          Snap token
     * @throws \Exception
     */
    public function createSnapToken(array $params): string
    {
        return Snap::getSnapToken($params);
    }

    /**
     * Build parameter transaksi standar untuk Midtrans.
     *
     * @param  string  $orderId    Unique order ID
     * @param  int     $amount     Nominal dalam rupiah (integer)
     * @param  array   $customer   Data pelanggan [name, email, phone?]
     * @param  array   $items      Array item [{id, price, quantity, name}]
     * @return array
     */
    public function buildTransactionParams(
        string $orderId,
        int $amount,
        array $customer,
        array $items
    ): array {
        return [
            'transaction_details' => [
                'order_id'     => $orderId,
                'gross_amount' => $amount,
            ],
            'customer_details' => [
                'first_name' => $customer['name'],
                'email'      => $customer['email'],
                'phone'      => $customer['phone'] ?? '',
            ],
            'item_details' => $items,
        ];
    }

    /**
     * Parse notifikasi webhook dari Midtrans.
     * Membuat instance Notification yang sudah terverifikasi dari server Midtrans.
     *
     * @return \Midtrans\Notification
     * @throws \Exception
     */
    public function parseNotification(): Notification
    {
        return new Notification();
    }

    /**
     * Map Midtrans transaction_status + fraud_status ke status internal app.
     *
     * @param  string       $transactionStatus  Status dari Midtrans
     * @param  string|null  $fraudStatus        Fraud status dari Midtrans
     * @return string  'paid' | 'pending' | 'failed' | 'cancelled'
     */
    public function resolvePaymentStatus(string $transactionStatus, ?string $fraudStatus): string
    {
        return match (true) {
            // Settlement / Capture dengan fraud OK → sukses
            $transactionStatus === 'settlement' => 'paid',
            $transactionStatus === 'capture' && $fraudStatus === 'accept' => 'paid',

            // Masih menunggu pembayaran
            in_array($transactionStatus, ['pending', 'authorize']) => 'pending',

            // Dibatalkan user / expired
            in_array($transactionStatus, ['cancel', 'expire']) => 'cancelled',

            // Gagal / fraud
            default => 'failed',
        };
    }
}
