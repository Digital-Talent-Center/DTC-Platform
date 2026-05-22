<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * PremiumTransaction
 *
 * Menyimpan record setiap transaksi Premium Post yang dibuat user.
 *
 * @property int         $id
 * @property int         $user_id
 * @property string      $order_id         Unique order ID yang dikirim ke Midtrans
 * @property string      $snap_token       Token Snap dari Midtrans (untuk re-open jika perlu)
 * @property int         $amount           Total nominal dalam rupiah
 * @property string      $duration         Durasi layanan: '7-hari' | '1-bulan' | '3-bulan'
 * @property string      $post_title       Judul kegiatan yang dipromosikan
 * @property string      $status           'pending' | 'paid' | 'failed' | 'cancelled'
 * @property string|null $midtrans_transaction_id  Transaction ID dari Midtrans
 * @property string|null $payment_type     Metode pembayaran dari Midtrans (e.g. gopay, bank_transfer)
 * @property string|null $paid_at          Waktu pembayaran berhasil
 */
class PremiumTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_id',
        'snap_token',
        'amount',
        'duration',
        'post_title',
        'status',
        'midtrans_transaction_id',
        'payment_type',
        'paid_at',
    ];

    protected $casts = [
        'amount'  => 'integer',
        'paid_at' => 'datetime',
    ];

    /**
     * Relasi ke user pemilik transaksi
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope: transaksi yang sudah dibayar
     */
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    /**
     * Scope: transaksi yang sedang pending
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
