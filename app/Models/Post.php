<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Post extends Model
{

    protected $fillable = [
        'user_id',
        'content',
        'image_url',
        'caption',
        'tag',
        'likes_count',
        'comments_count',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that created this post
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all comments for this post
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->latest();
    }

    /**
     * Get all likes for this post
     */
    public function likes(): HasMany
    {
        return $this->hasMany(Like::class, 'likeable_id')
            ->where('likeable_type', 'Post');
    }

    /**
     * Check if user has liked this post
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

    /**
     * Update comments count
     */
    public function updateCommentsCount(): void
    {
        $this->update([
            'comments_count' => $this->comments()->count(),
        ]);
    }
}
