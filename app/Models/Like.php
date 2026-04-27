<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Like extends Model
{

    protected $fillable = [
        'user_id',
        'likeable_id',
        'likeable_type',
    ];

    public $timestamps = true;

    /**
     * Get the user that liked the item
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the likeable model (Post or Comment)
     */
    public function likeable()
    {
        return match ($this->likeable_type) {
            'Post' => $this->belongsTo(Post::class, 'likeable_id'),
            'Comment' => $this->belongsTo(Comment::class, 'likeable_id'),
            default => null,
        };
    }
}
