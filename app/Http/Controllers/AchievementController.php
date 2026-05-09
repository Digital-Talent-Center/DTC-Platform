<?php

namespace App\Http\Controllers;

use App\Models\Achievement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AchievementController extends Controller
{
    use ApiResponseHelper;

    /**
     * Get all achievements for current user
     */
    public function index(Request $request)
    {
        $userId = Auth::id();

        $achievements = Achievement::where('user_id', $userId)
            ->when($request->status, function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            ->when($request->category, function ($query) use ($request) {
                $query->where('category', $request->category);
            })
            ->orderByDesc('created_at')
            ->paginate(10);

        return $this->paginatedResponse($achievements);
    }

    /**
     * Get achievement by ID
     */
    public function show(Achievement $achievement)
    {
        return $this->apiResponse($achievement);
    }

    /**
     * Create new achievement
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255|min:1',
            'description' => 'nullable|string|max:1000',
            'category' => 'required|string|max:100|min:1',
            'year' => 'nullable|integer|min:1900|max:' . now()->year,
            'badge_icon' => 'nullable|string|max:255',
        ]);

        $achievement = Achievement::create([
            'user_id' => Auth::id(),
            ...$validated,
        ]);

        return $this->apiResponse($achievement, 'Achievement created successfully', 201);
    }

    /**
     * Update achievement
     */
    public function update(Request $request, Achievement $achievement)
    {
        if ($achievement->user_id !== Auth::id()) {
            return $this->messageResponse('Unauthorized', 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'sometimes|required|string|max:100',
            'status' => 'sometimes|required|in:pending,approved,rejected',
            'year' => 'nullable|integer|min:1900|max:' . now()->year,
            'badge_icon' => 'nullable|string|max:255',
        ]);

        $achievement->update($validated);

        return $this->apiResponse($achievement, 'Achievement updated successfully');
    }

    /**
     * Delete achievement
     */
    public function destroy(Achievement $achievement)
    {
        if ($achievement->user_id !== Auth::id()) {
            return $this->messageResponse('Unauthorized', 403);
        }

        $achievement->delete();

        return $this->messageResponse('Achievement deleted successfully');
    }

    /**
     * Get achievements statistics
     */
    public function statistics(Request $request)
    {
        $user = Auth::user();

        $stats = [
            'total' => $user->achievements()->count(),
            'approved' => $user->achievements()->approved()->count(),
            'pending' => $user->achievements()->pending()->count(),
            'rejected' => $user->achievements()->status('rejected')->count(),
            'byCategory' => $user->achievements()
                ->selectRaw('category, COUNT(*) as count')
                ->groupBy('category')
                ->get()
                ->map(fn ($item) => [
                    'category' => $item->category,
                    'count' => $item->count,
                ])
                ->values()
                ->all(),
        ];

        return response()->json([
            'data' => $stats,
        ]);
    }

    /**
     * Get all pending achievements for Admin Dashboard
     */
    public function adminIndex()
    {
        // Mengambil semua achievement yang statusnya pending beserta relasi user dan profilnya
        $achievementsData = Achievement::with(['user.profileExtension'])
            ->where('status', 'pending')
            ->latest()
            ->get();

        $achievements = $achievementsData->map(function ($achievement) {
            return [
                'id' => $achievement->id,
                'title' => $achievement->title,
                'user' => $achievement->user->name ?? 'Unknown',
                'major' => $achievement->user->profileExtension->major ?? 'N/A',
                'file' => $achievement->badge_icon ?? 'No File',
                'fileSize' => 'N/A',
                'uploadedAt' => $achievement->created_at->diffForHumans(),
            ];
        });

        $pendingCount = Achievement::where('status', 'pending')->count();
        $approvedCount = Achievement::where('status', 'approved')->count();

        return Inertia::render('admin/Achievement-Management', [
            'initialAchievements' => $achievements,
            'initialPendingCount' => $pendingCount,
            'initialApprovedCount' => $approvedCount,
        ]);
    }
}
