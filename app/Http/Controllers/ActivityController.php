<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ActivityController extends Controller
{
    use ApiResponseHelper;

    /**
     * Get all activities for current user
     */
    public function index(Request $request)
    {
        $userId = Auth::id();

        $activities = Activity::where('user_id', $userId)
            ->when($request->type, function ($query) use ($request) {
                $query->where('type', $request->type);
            })
            ->when($request->status, function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            ->when($request->days, function ($query) use ($request) {
                $query->where('created_at', '>=', now()->subDays($request->days));
            }, function ($query) {
                $query->where('created_at', '>=', now()->subDays(30)); // Default: last 30 days
            })
            ->orderByDesc('created_at')
            ->paginate(15);

        return $this->paginatedResponse($activities);
    }

    /**
     * Get activity by ID
     */
    public function show(Activity $activity)
    {
        if ($activity->user_id !== Auth::id()) {
            return $this->messageResponse('Unauthorized', 403);
        }

        return $this->apiResponse($activity);
    }

    /**
     * Create new activity
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string|max:100',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'status' => 'required|in:pending,in_progress,completed,cancelled',
            'activity_date' => 'required|date',
        ]);

        $activity = Activity::create([
            'user_id' => Auth::id(),
            ...$validated,
        ]);

        return response()->json([
            'message' => 'Activity created',
            'data' => $activity
        ]);
    }

    /**
     * Update activity
     */
    public function update(Request $request, Activity $activity)
    {
        if ($activity->user_id !== Auth::id()) {
            return $this->messageResponse('Unauthorized', 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|required|in:pending,in_progress,completed,cancelled',
            'activity_date' => 'sometimes|required|date',
        ]);

        $activity->update($validated);

        return $this->apiResponse($activity, 'Activity updated successfully');
    }

    /**
     * Delete activity
     */
    public function destroy(Activity $activity)
    {
        if ($activity->user_id !== Auth::id()) {
            return $this->messageResponse('Unauthorized', 403);
        }

        $activity->delete();

        return $this->messageResponse('Activity deleted successfully');
    }

    /**
     * Get activity statistics
     */
    public function statistics(Request $request)
    {
        $user = Auth::user();
        $days = $request->days ?? 30;

        $stats = [
            'total' => $user->activities()->recent($days)->count(),
            'completed' => $user->activities()->recent($days)->status('completed')->count(),
            'inProgress' => $user->activities()->recent($days)->status('in_progress')->count(),
            'pending' => $user->activities()->recent($days)->status('pending')->count(),
            'byType' => $user->activities()->recent($days)
                ->selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->get()
                ->map(fn ($item) => [
                    'type' => $item->type,
                    'count' => $item->count,
                ])
                ->values()
                ->all(),
        ];

        return response()->json([
            'data' => $stats,
        ]);
    }

    public function page(Request $request)
{
    $activities = Activity::where('user_id', Auth::id())
        ->orderByDesc('activity_date')
        ->get()
        ->map(function ($item) {
            return [
                'id' => $item->id,
                'type' => $item->type,
                'title' => $item->title,
                'description' => $item->description,
                'status' => $item->status,
                'activity_date' => $item->activity_date->toDateString(),
            ];
        });

    return Inertia::render('activities', [
        'activities' => $activities
    ]);
}
}
