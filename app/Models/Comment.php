<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{

    protected $fillable = [
        'post_id',
        'user_id',
        'content',
        'likes_count',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the post this comment belongs to
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Get the user that created this comment
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all likes for this comment
     */
    public function likes(): HasMany
    {
        return $this->hasMany(Like::class, 'likeable_id')
            ->where('likeable_type', 'Comment');
    }

    /**
     * Check if user has liked this comment
     */
    public function isLikedBy(User $user): bool
    {
        return $this->likes()
            ->where('user_id', $user->id)
            ->exists();
    }

    /**
     * Update likes count
     */
    public function updateLikesCount(): void
    {
        $this->update([
            'likes_count' => $this->likes()->count(),
        ]);
    }
}
