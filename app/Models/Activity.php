<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Activity extends Model
{

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'description',
        'status',
        'relatable_id',
        'relatable_type',
        'activity_date',
    ];

    protected $casts = [
        'activity_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that has this activity
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope: Filter by type
     */
    public function scopeType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope: Filter by status
     */
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope: Get recent activities
     */
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('activity_date', '>=', now()->subDays($days));
    }

    /**
     * Get the relatable model
     */
    public function relatable()
    {
        return match ($this->relatable_type) {
            'Post' => $this->belongsTo(Post::class, 'relatable_id'),
            'Achievement' => $this->belongsTo(Achievement::class, 'relatable_id'),
            default => null,
        };
    }
}
