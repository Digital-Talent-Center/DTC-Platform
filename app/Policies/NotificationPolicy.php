<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Notification;

class NotificationPolicy
{
    /**
     * Determine if the user can view the model.
     */
    public function view(User $user, Notification $notification): bool
    {
        return $user->id === $notification->user_id;
    }

    /**
     * Determine if the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin(); // Only admins can create notifications
    }

    /**
     * Determine if the user can update the model.
     */
    public function update(User $user, Notification $notification): bool
    {
        return $user->id === $notification->user_id;
    }

    /**
     * Determine if the user can delete the model.
     */
    public function delete(User $user, Notification $notification): bool
    {
        return $user->id === $notification->user_id;
    }
}
