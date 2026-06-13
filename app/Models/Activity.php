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
        'deadline' => 'datetime',
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
     * Scope: Get upcoming activities
     */
    public function scopeUpcoming($query)
    {
        return $query->where('status', 'pending')
            ->where('activity_date', '>=', now()->toDateString())
            ->orderBy('activity_date', 'asc')
            ->orderBy('start_time', 'asc');
    }

    /**
     * Scope: Get completed activities
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope: Get overdue activities
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', 'pending')
            ->where(function ($q) {
                $q->where(function ($q2) {
                    // Tasks: check deadline datetime
                    $q2->where('type', 'task')
                       ->whereNotNull('deadline')
                       ->where('deadline', '<', now());
                })->orWhere(function ($q2) {
                    // Events: check activity_date (date-only, so compare by date)
                    $q2->where('type', 'event')
                       ->where('activity_date', '<', now()->toDateString());
                });
            });
    }

    /**
     * Scope: Filter by type event
     */
    public function scopeEvents($query)
    {
        return $query->where('type', 'event');
    }

    /**
     * Scope: Filter by type task
     */
    public function scopeTasks($query)
    {
        return $query->where('type', 'task');
    }

    /**
     * Scope: Filter by deadline
     */
    public function scopeByDeadline($query, $deadline)
    {
        return $query->where('deadline', $deadline);
    }

    /**
     * Scope: Filter by location
     */
    public function scopeByLocation($query, $location)
    {
        return $query->where('location', $location);
    }

    /**
     * Get the relatable model
     */
    public function relatable()
    {
        return $this->morphTo();
    }

    /**
     * Mark activity as completed
     */
    public function markCompleted()
    {
        $this->update(['status' => 'completed']);
    }

    /**
     * Mark activity as in progress
     */
    public function markInProgress()
    {
        $this->update(['status' => 'in_progress']);
    }

    /**
     * Mark activity as cancelled
     */
    public function markCancelled()
    {
        $this->update(['status' => 'cancelled']);
    }

    /**
     * Check if activity is past deadline
     */
    public function isPastDeadline(): bool
    {
        return $this->deadline && $this->deadline->isPast();
    }

    /**
     * Check if activity is today
     */
    public function isToday(): bool
    {
        return $this->activity_date->isToday();
    }

    /**
     * Check if activity is upcoming
     */
    public function isUpcoming(): bool
    {
        return $this->status === 'pending' && $this->activity_date->isFuture();
    }

    /**
     * Get activity status badge
     */
    public function getStatusBadge(): string
    {
        return match($this->status) {
            'completed' => 'bg-green-100 text-green-800',
            'in_progress' => 'bg-blue-100 text-blue-800',
            'pending' => 'bg-yellow-100 text-yellow-800',
            'overdue' => 'bg-red-100 text-red-800',
            'cancelled' => 'bg-gray-100 text-gray-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    public function isOverdue(): bool
    {
        if ($this->type !== 'task') return false;

        return $this->deadline
            && $this->status !== 'completed'
            && now()->greaterThan($this->deadline);
    }

    public function isEventPast(): bool
    {
        if ($this->type !== 'event') return false;

        return $this->activity_date < now()->toDateString()
            && $this->status !== 'cancelled'
            && $this->status !== 'completed';
    }
}
