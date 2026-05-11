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

        $activities = Activity::query()
            ->where('user_id', $userId)
            ->when($request->filled('type'), fn ($q) =>
                $q->where('type', $request->type)
            )
            ->when($request->filled('status'), fn ($q) =>
                $q->where('status', $request->status)
            )
            ->when($request->filled('days'), function ($q) use ($request) {
                $q->where('activity_date', '>=', now()->subDays($request->days));
            }, function ($q) {
                $q->where('activity_date', '>=', now()->subDays(30));
            })
            ->latest('activity_date')
            ->paginate(15);

        // Format response with clean date/time strings
        $formatted = $activities->through(function ($item) {
            return [
                'id' => $item->id,
                'type' => $item->type,
                'title' => $item->title,
                'description' => $item->description,
                'status' => $item->status,
                'activity_date' => $item->activity_date ? $item->activity_date->format('Y-m-d') : null,
                'deadline' => $item->deadline ? $item->deadline->format('Y-m-d') : null,
                'start_time' => $item->start_time ? substr($item->start_time, 0, 5) : null,
                'end_time' => $item->end_time ? substr($item->end_time, 0, 5) : null,
                'location' => $item->location,
                'created_at' => $item->created_at?->toISOString(),
                'updated_at' => $item->updated_at?->toISOString(),
            ];
        });

        return $this->paginatedResponse($formatted);
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
        try {
            $validated = $request->validate([
                'type' => 'required|in:event,task',
                'title' => 'required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'status' => 'required|in:pending,in_progress,completed,cancelled',
                'activity_date' => 'required|date',
                'deadline' => 'nullable|date',
                'location' => 'nullable|string|max:255',
                'start_time' => 'nullable|date_format:H:i',
                'end_time' => 'nullable|date_format:H:i',
            ]);

            $activity = Activity::create([
                'user_id' => auth()->id(),
                'type' => $validated['type'],
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'status' => $validated['status'] ?? 'pending',
                'activity_date' => $validated['activity_date'],
                'deadline' => $validated['deadline'] ?? null,
                'location' => $validated['location'] ?? null,
                'start_time' => $validated['start_time'] ?? null,
                'end_time' => $validated['end_time'] ?? null,
            ]);

            // Reload to get proper casts
            $activity->refresh();

            return response()->json([
                'message' => 'Activity created',
                'data' => [
                    'id' => $activity->id,
                    'type' => $activity->type,
                    'title' => $activity->title,
                    'description' => $activity->description,
                    'status' => $activity->status,
                    'activity_date' => $activity->activity_date ? $activity->activity_date->format('Y-m-d') : null,
                    'deadline' => $activity->deadline ? $activity->deadline->format('Y-m-d') : null,
                    'start_time' => $activity->start_time ? substr($activity->start_time, 0, 5) : null,
                    'end_time' => $activity->end_time ? substr($activity->end_time, 0, 5) : null,
                    'location' => $activity->location,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
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
            'status' => 'sometimes|required|in:pending,in_progress,completed,cancelled,overdue',
            'activity_date' => 'sometimes|required|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'location' => 'nullable|string|max:255',
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
            'upcoming' => $user->activities()->recent($days)->status('upcoming')->count(),
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
        $userId = Auth::id();
        
        $activities = Activity::query()
            ->where('user_id', $userId)
            ->latest('activity_date')
            ->paginate(15)
            ->through(function ($item) {
                return [
                    'id' => $item->id,
                    'type' => $item->type,
                    'title' => $item->title,
                    'description' => $item->description,
                    'status' => $item->status,
                    'activity_date' => $item->activity_date?->format('Y-m-d'),
                    'deadline' => $item->deadline?->format('Y-m-d'),
                    'start_time' => $item->start_time ? substr($item->start_time, 0, 5) : null,
                    'end_time' => $item->end_time ? substr($item->end_time, 0, 5) : null,
                    'location' => $item->location,
                ];
            });

        return Inertia::render('activities', [
            'activities' => $activities
        ]);
    }

    /**
     * Get upcoming activities for current user
     */
    public function upcoming(Request $request)
    {
        $userId = Auth::id();

        $activities = Activity::query()
            ->where('user_id', $userId)
            ->upcoming()
            ->when($request->filled('type'), fn ($q) =>
                $q->where('type', $request->type)
            )
            ->paginate(15);

        $formatted = $activities->through(function ($item) {
            return [
                'id' => $item->id,
                'type' => $item->type,
                'title' => $item->title,
                'description' => $item->description,
                'status' => $item->status,
                'activity_date' => $item->activity_date?->format('Y-m-d'),
                'deadline' => $item->deadline?->format('Y-m-d'),
                'start_time' => $item->start_time ? substr($item->start_time, 0, 5) : null,
                'end_time' => $item->end_time ? substr($item->end_time, 0, 5) : null,
                'location' => $item->location,
                'created_at' => $item->created_at?->toISOString(),
            ];
        });

        return $this->paginatedResponse($formatted);
    }

    /**
     * Get completed activities for current user
     */
    public function completed(Request $request)
    {
        $userId = Auth::id();

        $activities = Activity::query()
            ->where('user_id', $userId)
            ->completed()
            ->when($request->filled('type'), fn ($q) =>
                $q->where('type', $request->type)
            )
            ->latest('updated_at')
            ->paginate(15);

        $formatted = $activities->through(function ($item) {
            return [
                'id' => $item->id,
                'type' => $item->type,
                'title' => $item->title,
                'description' => $item->description,
                'status' => $item->status,
                'activity_date' => $item->activity_date?->format('Y-m-d'),
                'deadline' => $item->deadline?->format('Y-m-d'),
                'start_time' => $item->start_time ? substr($item->start_time, 0, 5) : null,
                'end_time' => $item->end_time ? substr($item->end_time, 0, 5) : null,
                'location' => $item->location,
                'completed_at' => $item->updated_at?->toISOString(),
            ];
        });

        return $this->paginatedResponse($formatted);
    }

    /**
     * Get overdue activities for current user
     */
    public function overdue(Request $request)
    {
        $userId = Auth::id();

        $activities = Activity::query()
            ->where('user_id', $userId)
            ->overdue()
            ->when($request->filled('type'), fn ($q) =>
                $q->where('type', $request->type)
            )
            ->latest('activity_date')
            ->paginate(15);

        $formatted = $activities->through(function ($item) {
            return [
                'id' => $item->id,
                'type' => $item->type,
                'title' => $item->title,
                'description' => $item->description,
                'status' => $item->status,
                'activity_date' => $item->activity_date?->format('Y-m-d'),
                'deadline' => $item->deadline?->format('Y-m-d'),
                'start_time' => $item->start_time ? substr($item->start_time, 0, 5) : null,
                'end_time' => $item->end_time ? substr($item->end_time, 0, 5) : null,
                'location' => $item->location,
                'is_overdue' => $item->isPastDeadline(),
            ];
        });

        return $this->paginatedResponse($formatted);
    }

    /**
     * Update activity status
     */
    public function updateStatus(Request $request, Activity $activity)
    {
        if ($activity->user_id !== Auth::id()) {
            return $this->messageResponse('Unauthorized', 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,completed,cancelled,overdue',
        ]);

        try {
            $activity->update(['status' => $validated['status']]);

            return $this->apiResponse([
                'id' => $activity->id,
                'status' => $activity->status,
                'updated_at' => $activity->updated_at->toISOString(),
            ], 'Activity status updated successfully');

        } catch (\Exception $e) {
            return $this->messageResponse($e->getMessage(), 500);
        }
    }
}

