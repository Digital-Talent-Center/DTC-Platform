<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Post;

class PostPolicy
{
    /**
     * Determine if the user can view the model.
     */
    public function view(User $user, Post $post): bool
    {
        return true; // Anyone can view posts
    }

    /**
     * Determine if the user can create models.
     */
    public function create(User $user): bool
    {
        return true; // Authenticated users can create posts
    }

    /**
     * Determine if the user can update the model.
     */
    public function update(User $user, Post $post): bool
    {
        return $user->id === $post->user_id;
    }

    /**
     * Determine if the user can delete the model.
     */
    public function delete(User $user, Post $post): bool
    {
        return $user->id === $post->user_id;
    }
}
