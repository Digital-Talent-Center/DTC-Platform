<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Report extends Model
{

    protected $fillable = [
        'post_id',
        'user_id',
        'reason',
        'description',
        'status',
        'action_taken',
        'resolved_by',
        'resolved_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the post that was reported
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Get the user who reported the post
     */
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the admin who resolved the report
     */
    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    /**
     * Scope: Filter by status
     */
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope: Filter by reason
     */
    public function scopeReason($query, $reason)
    {
        return $query->where('reason', $reason);
    }

    /**
     * Scope: Get pending reports
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope: Get resolved reports
     */
    public function scopeResolved($query)
    {
        return $query->where('status', 'resolved');
    }

    /**
     * Scope: Get reports under review
     */
    public function scopeUnderReview($query)
    {
        return $query->where('status', 'under_review');
    }

    /**
     * Mark report as resolved
     */
    public function markResolved($actionTaken, $resolvedBy)
    {
        $this->update([
            'status' => 'resolved',
            'action_taken' => $actionTaken,
            'resolved_by' => $resolvedBy,
            'resolved_at' => now(),
        ]);
    }

    /**
     * Mark report as under review
     */
    public function markUnderReview()
    {
        $this->update(['status' => 'under_review']);
    }

    /**
     * Dismiss a report
     */
    public function dismiss($resolvedBy)
    {
        $this->update([
            'status' => 'dismissed',
            'resolved_by' => $resolvedBy,
            'resolved_at' => now(),
        ]);
    }
}
