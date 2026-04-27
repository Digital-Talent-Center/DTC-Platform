<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Document;

class DocumentPolicy
{
    /**
     * Determine if the user can view the model.
     */
    public function view(User $user, Document $document): bool
    {
        return $document->is_public || $user->id === $document->user_id;
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
    public function update(User $user, Document $document): bool
    {
        return $user->id === $document->user_id;
    }

    /**
     * Determine if the user can delete the model.
     */
    public function delete(User $user, Document $document): bool
    {
        return $user->id === $document->user_id;
    }
}
