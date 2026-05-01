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
        'activity_date',
        'deadline',
        'location',
        'start_time',
        'end_time',
    ];

    protected $casts = [
        'activity_date' => 'date',
        'deadline' => 'date',
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
        return $this->morphTo();
    }

    public function isOverdue(): bool
{
        if ($this->type !== 'task') return false;

        return $this->deadline
            && $this->status !== 'completed'
            && now()->toDateString() > $this->deadline->toDateString();
    }

    public function isEventPast(): bool
    {
        if ($this->type !== 'event') return false;

        return $this->activity_date < now()->toDateString()
            && $this->status !== 'cancelled'
            && $this->status !== 'completed';
    }
}
