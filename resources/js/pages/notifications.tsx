import { useState, useEffect, ReactNode } from 'react';
import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";
import { api, type Notification } from "@/services/api";

/* ── Category config (colors, icons) ───────────────── */
const categoryConfig: Record<string, { border: string; bg: string; iconColor: string; labelColor: string; icon: ReactNode }> = {
  'ACHIEVEMENT': {
    border: 'border-l-amber-500',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    labelColor: 'text-amber-600',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a.75.75 0 000 1.5h12.75a.75.75 0 000-1.5h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.707 6.707 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.22 49.22 0 00-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 00-.657.744zm0 2.629c0 3.097 2.04 5.715 4.852 6.573a.75.75 0 01-.216.079 5.229 5.229 0 01-5.703-4.085 45.73 45.73 0 011.067-.182v-2.385zm13.668 0v2.385c.357.058.713.12 1.067.182a5.229 5.229 0 01-5.703 4.085.75.75 0 01-.216-.08 7.458 7.458 0 004.852-6.572z" clipRule="evenodd" />
      </svg>
    ),
  },
  'ACTIVITY': {
    border: 'border-l-green-500',
    bg: 'bg-green-50',
    iconColor: 'text-green-600',
    labelColor: 'text-green-600',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
      </svg>
    ),
  },
  'SYSTEM': {
    border: 'border-l-purple-500',
    bg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    labelColor: 'text-purple-600',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clipRule="evenodd" />
        <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
      </svg>
    ),
  },
  'DEFAULT': {
    border: 'border-l-gray-400',
    bg: 'bg-gray-50',
    iconColor: 'text-gray-600',
    labelColor: 'text-gray-600',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2.25 2.25a.75.75 0 000 1.5H3v10.5a3 3 0 003 3h1.21l2.298 2.298a.75.75 0 10.06 1.06H9.53l2.634 2.634A1.5 1.5 0 0115 21.75h6.75a.75.75 0 000-1.5H15a.75.75 0 01-.53-1.28l2.634-2.634h1.5a3 3 0 003-3V3.75h.75a.75.75 0 000-1.5H2.25z" />
      </svg>
    ),
  },
};

// Helper to format time
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

/* ── Notification Card ─────────────────────────────── */
function NotificationCard({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: (id: number) => void;
}) {
  const category = notification.category || 'DEFAULT';
  const config = categoryConfig[category] || categoryConfig['DEFAULT'];

  return (
    <div
      className={`relative border-l-4 ${config.border} bg-white rounded-xl px-5 py-4 sm:px-6 sm:py-5 transition-all duration-200 hover:shadow-md ${
        notification.isRead ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`w-10 h-10 rounded-xl ${config.bg} ${config.iconColor} flex items-center justify-center flex-shrink-0 mt-0.5`}
        >
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-1">
            <span className={`text-[11px] font-bold tracking-wider uppercase ${config.labelColor}`}>
              {category}
            </span>
            <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
              {formatTime(notification.createdAt)}
            </span>
          </div>
          <h3
            className={`text-sm font-semibold mb-0.5 ${
              notification.isRead ? 'text-gray-500' : 'text-gray-900'
            }`}
          >
            {notification.title}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">{notification.message}</p>
        </div>
      </div>

      {/* Unread dot */}
      {!notification.isRead && (
        <button
          onClick={() => onMarkRead(notification.id)}
          className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-amber-500 hover:bg-amber-600 transition-colors cursor-pointer"
          title="Mark as read"
        />
      )}
    </div>
  );
}

/* ── Main Notifications Page ───────────────────────── */
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const response = await api.notifications.list();
        setNotifications(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load notifications');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: number) => {
    try {
      await api.notifications.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const clearAll = async () => {
    try {
      // Delete all notifications
      for (const notif of notifications) {
        await api.notifications.delete(notif.id);
      }
      setNotifications([]);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  if (error) {
    return (
      <AppLayout>
        <Head title="Notifications" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Head title="Notifications" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Dashboard
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Notifications
            </h1>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed max-w-lg">
              Tetaplah mengikuti perkembangan terbaru terkait tugas akademik, prestasi, dan acara komunitas Anda.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              id="notifications-clear-all"
              onClick={clearAll}
              disabled={notifications.length === 0 || loading}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Clear All
            </button>
            <button
              id="notifications-mark-all-read"
              onClick={markAllAsRead}
              disabled={unreadCount === 0 || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-amber-700 rounded-lg hover:from-amber-700 hover:to-amber-800 shadow-sm shadow-amber-200/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Mark all as read
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        )}

        {/* Notification List */}
        {!loading && notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkRead={markAsRead}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>
            <p className="text-sm text-gray-400 font-medium">No notifications yet</p>
          </div>
        )}

        {/* End of list indicator */}
        {!loading && notifications.length > 0 && (
          <div className="flex flex-col items-center justify-center py-12 mt-4">
            <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>
            <p className="text-sm text-gray-400 font-medium">End of recent updates</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
