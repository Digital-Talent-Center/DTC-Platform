<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProfileExtension extends Model
{

    protected $fillable = [
        'user_id',
        'nim',
        'faculty',
        'major',
        'phone',
        'avatar_url',
        'about',
        'role',
        'social_links',
        'profile_completed_at',
    ];

    protected $casts = [
        'social_links' => 'array',
        'profile_completed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that has this profile extension
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if profile is complete
     */
    public function isComplete()
    {
        return $this->profile_completed_at !== null;
    }

    /**
     * Mark profile as complete
     */
    public function markComplete()
    {
        $this->update(['profile_completed_at' => now()]);
    }
}
