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
 * @property string|null $post_description Deskripsi detail kegiatan
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
        'post_description',
        'attachment_path',
        'status',
        'midtrans_transaction_id',
        'payment_type',
        'paid_at',
    ];

    protected $casts = [
        'amount'  => 'integer',
        'paid_at' => 'datetime',
    ];

    protected $appends = ['imageUrl'];

    /**
     * Relasi ke user pemilik transaksi
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Accessor: konversi attachment_path menjadi URL publik
     * Jika attachment bukan gambar, return null
     */
    public function getImageUrlAttribute(): ?string
    {
        if (!$this->attachment_path) {
            return null;
        }

        $path = $this->attachment_path;
        
        // Periksa apakah file adalah gambar (bukan PDF atau file lain)
        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        
        if (!in_array($ext, $imageExtensions)) {
            return null;
        }

        // Gunakan path relatif agar URL benar di semua host/port (localhost, 127.0.0.1:8000, dll)
        return '/storage/' . $path;
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

    /**
     * Accessor: hitung tanggal expired berdasarkan durasi
     */
    public function getExpiredAtAttribute()
    {
        $start = $this->paid_at ?? $this->created_at;
        $expired = $start ? clone $start : now();
        
        switch ($this->duration) {
            case '7-hari': $expired->addDays(7); break;
            case '1-minggu': $expired->addWeeks(1); break;
            case '1-bulan': $expired->addMonths(1); break;
            case '3-bulan': $expired->addMonths(3); break;
            case '6-bulan': $expired->addMonths(6); break;
            case '1-tahun': $expired->addYears(1); break;
            default: $expired->addMonths(1); break;
        }
        return $expired;
    }
}
