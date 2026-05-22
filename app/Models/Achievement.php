<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Achievement extends Model
{

    protected $fillable = [
        'user_id',
        'nim',
        'nama_lengkap',
        'tahun_ajaran',
        'tanggal_mulai',
        'tanggal_selesai',
        'title',
        'description',
        'category',
        'jenis',
        'tingkat',
        'keikutsertaan',
        'status',
        'badge_icon',
        'year',
        'link_sertifikat',
        'bukti_path',
    ];

    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
        'year' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that has this achievement
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope: Filter by status
     */
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope: Filter by category
     */
    public function scopeCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope: Get approved achievements
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope: Get pending achievements
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
