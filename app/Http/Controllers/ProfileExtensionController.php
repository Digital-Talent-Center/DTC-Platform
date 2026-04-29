<?php

namespace App\Http\Controllers;

use App\Models\ProfileExtension;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProfileExtensionController extends Controller
{
    use ApiResponseHelper;

    /**
     * Get authenticated user's profile extension
     */
    public function show()
{
    $userId = Auth::id();

    $profile = ProfileExtension::with('user')
        ->where('user_id', $userId)
        ->first();

    if (!$profile) {
        $profile = ProfileExtension::create(['user_id' => $userId]);
        $profile->load('user'); // penting!
    }

    return $this->apiResponse($profile);
}

    /**
     * Get other user's profile extension
     */
    public function showUser($userId)
    {
        $profile = ProfileExtension::where('user_id', $userId)->first();

        if (!$profile) {
            return $this->messageResponse('Profile not found', 404);
        }

        return $this->apiResponse($profile);
    }

    /**
     * Update authenticated user's profile extension
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'nim' => 'nullable|string|max:20',
            'faculty' => 'nullable|string|max:255',
            'major' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'avatar_url' => 'nullable|string|max:500',
            'about' => 'nullable|string|max:1000',
            'role' => 'nullable|string|max:100',
            'social_links' => 'nullable|array',
            'social_links.github' => 'nullable|string|max:255',
            'social_links.linkedin' => 'nullable|string|max:255',
            'social_links.twitter' => 'nullable|string|max:255',
            'social_links.portfolio' => 'nullable|string|max:500',
        ]);

        $profile = $user->profileExtension;

        if (!$profile) {
            $profile = ProfileExtension::create(['user_id' => $user->id]);
        }

        $profile->update($validated);

        // Check if profile is complete
        if ($profile->isComplete() === false && $this->isProfileComplete($profile)) {
            $profile->markComplete();
        }

        return $this->apiResponse($profile, 'Profile updated successfully');
    }

    /**
     * Check if profile is complete
     */
    private function isProfileComplete(ProfileExtension $profile): bool
    {
        return !empty($profile->nim) &&
               !empty($profile->faculty) &&
               !empty($profile->about) &&
               !empty($profile->phone);
    }

    /**
     * Mark profile as complete
     */
    public function markComplete()
    {
        $user = Auth::user();
        $profile = $user->profileExtension;

        if (!$profile) {
            return $this->messageResponse('Profile not found', 404);
        }

        $profile->markComplete();

        return $this->apiResponse($profile, 'Profile marked as complete');
    }
}
