<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    use ApiResponseHelper;

    /**
     * Get all notifications for current user
     */
    public function index(Request $request)
    {
        $userId = Auth::id();

        $notifications = Notification::where('user_id', $userId)
            ->when($request->category, function ($query) use ($request) {
                $query->where('category', $request->category);
            })
            ->when($request->unread, function ($query) {
                $query->where('is_read', false);
            })
            ->orderByDesc('created_at')
            ->paginate(20);

        return $this->paginatedResponse($notifications);
    }

    /**
     * Get notification by ID
     */
    public function show(Notification $notification)
    {
        if ($notification->user_id !== Auth::id()) {
            return $this->messageResponse('Unauthorized', 403);
        }

        return $this->apiResponse($notification);
    }

    /**
     * Create new notification (admin only)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'category' => 'required|string|max:100|min:1',
            'title' => 'required|string|max:255|min:1',
            'message' => 'required|string|min:1|max:5000',
            'notifiable_id' => 'nullable|integer|min:1',
            'notifiable_type' => 'nullable|string|max:100',
            'action_url' => 'nullable|string|max:500',
        ]);

        $notification = Notification::create($validated);

        return $this->apiResponse($notification, 'Notification created successfully', 201);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Notification $notification)
    {
        if ($notification->user_id !== Auth::id()) {
            return $this->messageResponse('Unauthorized', 403);
        }

        $notification->markAsRead();

        return $this->apiResponse($notification, 'Notification marked as read');
    }

    /**
     * Mark notification as unread
     */
    public function markAsUnread(Notification $notification)
    {
        if ($notification->user_id !== Auth::id()) {
            return $this->messageResponse('Unauthorized', 403);
        }

        $notification->markAsUnread();

        return $this->apiResponse($notification, 'Notification marked as unread');
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        $user = Auth::user();
        // Use customNotifications() to avoid Notifiable trait conflict
        $user->customNotifications()->unread()->update(['is_read' => true]);

        return $this->messageResponse('All notifications marked as read');
    }

    /**
     * Delete notification
     */
    public function destroy(Notification $notification)
    {
        if ($notification->user_id !== Auth::id()) {
            return $this->messageResponse('Unauthorized', 403);
        }

        $notification->delete();

        return $this->messageResponse('Notification deleted successfully');
    }

    /**
     * Get unread count
     */
    public function unreadCount()
    {
        // Use customNotifications() to avoid Notifiable trait conflict
        $count = Auth::user()->customNotifications()->unread()->count();

        return response()->json([
            'count' => $count,
        ]);
    }
}
