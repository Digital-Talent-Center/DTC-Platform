<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Achievement;

class AchievementPolicy
{
    /**
     * Determine if the user can view the model.
     */
    public function view(User $user, Achievement $achievement): bool
    {
        return true; // Anyone can view achievements
    }

    /**
     * Determine if the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine if the user can update the model.
     */
    public function update(User $user, Achievement $achievement): bool
    {
        return $user->id === $achievement->user_id || $user->isAdmin();
    }

    /**
     * Determine if the user can delete the model.
     */
    public function delete(User $user, Achievement $achievement): bool
    {
        return $user->id === $achievement->user_id || $user->isAdmin();
    }
}
