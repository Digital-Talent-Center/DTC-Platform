<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Activity;

class ActivityPolicy
{
    /**
     * Determine if the user can view the model.
     */
    public function view(User $user, Activity $activity): bool
    {
        return $user->id === $activity->user_id;
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
    public function update(User $user, Activity $activity): bool
    {
        return $user->id === $activity->user_id;
    }

    /**
     * Determine if the user can delete the model.
     */
    public function delete(User $user, Activity $activity): bool
    {
        return $user->id === $activity->user_id;
    }
}
