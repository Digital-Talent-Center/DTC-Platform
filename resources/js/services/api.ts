import type {
  Post,
  Comment,
  Achievement,
  Activity,
  Notification,
  Document,
  DocumentFilters,
  FilterOptions,
  ProfileExtension,
  PaginatedResponse,
  ApiResponse,
  PremiumTransaction,
} from '@/types';

const API_BASE = '/api';

/**
 * Get CSRF token from XSRF-TOKEN cookie (set by Laravel).
 * Use this in all fetch() calls that mutate state (POST/PUT/PATCH/DELETE).
 * Send as header: 'X-XSRF-TOKEN': getCsrfToken()
 */
export function getCsrfToken(): string {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

/**
 * API Error handler
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch options builder
 */
function buildFetchOptions(method: string, body?: any): RequestInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Add CSRF token for state-changing requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
    const token = getCsrfToken();
    if (token) {
      headers['X-XSRF-TOKEN'] = token;
    }
  }

  const options: RequestInit = {
    method,
    headers,
    credentials: 'include', // Include cookies for Sanctum
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  return options;
}

/**
 * Query string builder
 */
function buildQueryString(params?: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) return '';
  
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      query.append(key, String(value));
    }
  });
  
  return query.toString() ? `?${query.toString()}` : '';
}

/**
 * API Service
 */
export const api = {
  /**
   * Posts API
   */
  posts: {
    /**
     * Get all posts with pagination
     */
    list: async (page = 1, perPage = 10, filters?: { user_id?: number }): Promise<PaginatedResponse<Post>> => {
      const query = buildQueryString({ page, per_page: perPage, ...filters });
      return fetch(`${API_BASE}/posts${query}`, buildFetchOptions('GET'))
        .then(r => handleResponse<PaginatedResponse<Post>>(r));
    },

    /**
     * Get single post
     */
    get: async (id: number): Promise<ApiResponse<Post>> => {
      return fetch(`${API_BASE}/posts/${id}`, buildFetchOptions('GET'))
        .then(r => handleResponse<ApiResponse<Post>>(r));
    },

    /**
     * Create new post
     */
    create: async (data: { content: string; imageUrl?: string; caption?: string; tag?: string }): Promise<ApiResponse<Post>> => {
      return fetch(`${API_BASE}/posts`, buildFetchOptions('POST', data))
        .then(r => handleResponse<ApiResponse<Post>>(r));
    },

    /**
     * Create new post with file upload
     */
    createWithFile: async (formData: FormData): Promise<ApiResponse<Post>> => {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      const token = getCsrfToken();
      if (token) headers['X-XSRF-TOKEN'] = token;

      return fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: formData,
      }).then(r => handleResponse<ApiResponse<Post>>(r));
    },

    /**
     * Upload media file (photo/video) for a post.
     * Returns the public URL to be saved as image_url in the post.
     */
    uploadMedia: async (file: File): Promise<{ url: string; path: string }> => {
      const formData = new FormData();
      formData.append('file', file);

      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      const token = getCsrfToken();
      if (token) headers['X-XSRF-TOKEN'] = token;

      return fetch(`${API_BASE}/posts/upload-media`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: formData,
      }).then(r => handleResponse<{ url: string; path: string }>(r));
    },

    /**
     * Update post
     */
    update: async (id: number, data: Partial<Post>): Promise<ApiResponse<Post>> => {
      return fetch(`${API_BASE}/posts/${id}`, buildFetchOptions('PUT', data))
        .then(r => handleResponse<ApiResponse<Post>>(r));
    },

    /**
     * Delete post
     */
    delete: async (id: number): Promise<ApiResponse<null>> => {
      return fetch(`${API_BASE}/posts/${id}`, buildFetchOptions('DELETE'))
        .then(r => handleResponse<ApiResponse<null>>(r));
    },

    /**
     * Like/unlike post
     */
    like: async (id: number): Promise<{ isLiked: boolean; likesCount: number }> => {
      return fetch(`${API_BASE}/posts/${id}/like`, buildFetchOptions('POST'))
        .then(r => handleResponse<{ isLiked: boolean; likesCount: number }>(r));
    },
  },

  /**
   * Reports API
   */
  reports: {
    /**
     * Create a new report for a post
     */
    create: async (data: { post_id: number; reason: string; description?: string }): Promise<ApiResponse<any>> => {
      return fetch(`${API_BASE}/reports`, buildFetchOptions('POST', data))
        .then(r => handleResponse<ApiResponse<any>>(r));
    },
  },

  /**
   * Comments API
   */
  comments: {
    /**
     * Get all comments for a post
     */
    list: async (postId: number, page = 1, perPage = 20): Promise<PaginatedResponse<Comment>> => {
      const query = buildQueryString({ page, per_page: perPage });
      return fetch(`${API_BASE}/posts/${postId}/comments${query}`, buildFetchOptions('GET'))
        .then(r => handleResponse<PaginatedResponse<Comment>>(r));
    },

    /**
     * Create comment on a post
     */
    create: async (postId: number, data: { content: string }): Promise<ApiResponse<Comment>> => {
      return fetch(`${API_BASE}/posts/${postId}/comments`, buildFetchOptions('POST', data))
        .then(r => handleResponse<ApiResponse<Comment>>(r));
    },

    /**
     * Update comment
     */
    update: async (postId: number, commentId: number, data: { content: string }): Promise<ApiResponse<Comment>> => {
      return fetch(`${API_BASE}/posts/${postId}/comments/${commentId}`, buildFetchOptions('PUT', data))
        .then(r => handleResponse<ApiResponse<Comment>>(r));
    },

    /**
     * Delete comment
     */
    delete: async (postId: number, commentId: number): Promise<ApiResponse<null>> => {
      return fetch(`${API_BASE}/posts/${postId}/comments/${commentId}`, buildFetchOptions('DELETE'))
        .then(r => handleResponse<ApiResponse<null>>(r));
    },

    /**
     * Like/unlike comment
     */
    like: async (postId: number, commentId: number): Promise<{ isLiked: boolean; likesCount: number }> => {
      return fetch(`${API_BASE}/posts/${postId}/comments/${commentId}/like`, buildFetchOptions('POST'))
        .then(r => handleResponse<{ isLiked: boolean; likesCount: number }>(r));
    },
  },

  /**
   * Achievements API
   */
  achievements: {
    /**
     * Get all achievements for current user
     */
    list: async (filters?: { status?: string; category?: string; page?: number; user_id?: string | number }): Promise<PaginatedResponse<Achievement>> => {
      const query = buildQueryString(filters);
      return fetch(`${API_BASE}/achievements${query}`, buildFetchOptions('GET'))
        .then(r => handleResponse<PaginatedResponse<Achievement>>(r));
    },

    /**
     * Get single achievement
     */
    get: async (id: number): Promise<ApiResponse<Achievement>> => {
      return fetch(`${API_BASE}/achievements/${id}`, buildFetchOptions('GET'))
        .then(r => handleResponse<ApiResponse<Achievement>>(r));
    },

    /**
     * Create achievement
     */
    create: async (data: Partial<Achievement>): Promise<ApiResponse<Achievement>> => {
      return fetch(`${API_BASE}/achievements`, buildFetchOptions('POST', data))
        .then(r => handleResponse<ApiResponse<Achievement>>(r));
    },

    /**
     * Update achievement
     */
    update: async (id: number, data: Partial<Achievement>): Promise<ApiResponse<Achievement>> => {
      return fetch(`${API_BASE}/achievements/${id}`, buildFetchOptions('PUT', data))
        .then(r => handleResponse<ApiResponse<Achievement>>(r));
    },

    /**
     * Delete achievement
     */
    delete: async (id: number): Promise<ApiResponse<null>> => {
      return fetch(`${API_BASE}/achievements/${id}`, buildFetchOptions('DELETE'))
        .then(r => handleResponse<ApiResponse<null>>(r));
    },

    /**
     * Get achievement statistics
     */
    statistics: async (): Promise<ApiResponse<any>> => {
      return fetch(`${API_BASE}/achievements/statistics`, buildFetchOptions('GET'))
        .then(r => handleResponse<ApiResponse<any>>(r));
    },
  },

  /**
   * Activities API
   */
  activities: {
    /**
     * Get all activities for current user
     */
    list: async (filters?: { type?: string; status?: string; days?: number; page?: number }): Promise<PaginatedResponse<Activity>> => {
      const query = buildQueryString(filters);
      return fetch(`${API_BASE}/activities${query}`, buildFetchOptions('GET'))
        .then(r => handleResponse<PaginatedResponse<Activity>>(r));
    },

    /**
     * Get single activity
     */
    get: async (id: number): Promise<ApiResponse<Activity>> => {
      return fetch(`${API_BASE}/activities/${id}`, buildFetchOptions('GET'))
        .then(r => handleResponse<ApiResponse<Activity>>(r));
    },

    /**
     * Create activity
     */
    create: async (data: Partial<Activity>): Promise<ApiResponse<Activity>> => {
      return fetch(`${API_BASE}/activities`, buildFetchOptions('POST', data))
        .then(r => handleResponse<ApiResponse<Activity>>(r));
    },

    /**
     * Update activity
     */
    update: async (id: number, data: Partial<Activity>): Promise<ApiResponse<Activity>> => {
      return fetch(`${API_BASE}/activities/${id}`, buildFetchOptions('PUT', data))
        .then(r => handleResponse<ApiResponse<Activity>>(r));
    },

    /**
     * Delete activity
     */
    delete: async (id: number): Promise<ApiResponse<null>> => {
      return fetch(`${API_BASE}/activities/${id}`, buildFetchOptions('DELETE'))
        .then(r => handleResponse<ApiResponse<null>>(r));
    },

    /**
     * Get activity statistics
     */
    statistics: async (days = 30): Promise<ApiResponse<any>> => {
      return fetch(`${API_BASE}/activities/statistics?days=${days}`, buildFetchOptions('GET'))
        .then(r => handleResponse<ApiResponse<any>>(r));
    },
  },

  /**
   * Notifications API
   */
  notifications: {
    /**
     * Get all notifications for current user
     */
    list: async (filters?: { category?: string; unread?: boolean; page?: number }): Promise<PaginatedResponse<Notification>> => {
      const query = buildQueryString(filters);
      return fetch(`${API_BASE}/notifications${query}`, buildFetchOptions('GET'))
        .then(r => handleResponse<PaginatedResponse<Notification>>(r));
    },

    /**
     * Get single notification
     */
    get: async (id: number): Promise<ApiResponse<Notification>> => {
      return fetch(`${API_BASE}/notifications/${id}`, buildFetchOptions('GET'))
        .then(r => handleResponse<ApiResponse<Notification>>(r));
    },

    /**
     * Get unread count
     */
    unreadCount: async (): Promise<{ count: number }> => {
      return fetch(`${API_BASE}/notifications/unread-count`, buildFetchOptions('GET'))
        .then(r => handleResponse<{ count: number }>(r));
    },

    /**
     * Mark as read
     */
    markAsRead: async (id: number): Promise<ApiResponse<Notification>> => {
      return fetch(`${API_BASE}/notifications/${id}/read`, buildFetchOptions('PUT'))
        .then(r => handleResponse<ApiResponse<Notification>>(r));
    },

    /**
     * Mark as unread
     */
    markAsUnread: async (id: number): Promise<ApiResponse<Notification>> => {
      return fetch(`${API_BASE}/notifications/${id}/unread`, buildFetchOptions('PUT'))
        .then(r => handleResponse<ApiResponse<Notification>>(r));
    },

    /**
     * Mark all as read
     */
    markAllAsRead: async (): Promise<ApiResponse<null>> => {
      return fetch(`${API_BASE}/notifications/mark-all-read`, buildFetchOptions('PUT'))
        .then(r => handleResponse<ApiResponse<null>>(r));
    },

    /**
     * Delete notification
     */
    delete: async (id: number): Promise<ApiResponse<null>> => {
      return fetch(`${API_BASE}/notifications/${id}`, buildFetchOptions('DELETE'))
        .then(r => handleResponse<ApiResponse<null>>(r));
    },
  },

  /**
   * Documents API
   */
  documents: {
    /**
     * Get all public documents with filtering
     */
    list: async (filters?: DocumentFilters): Promise<PaginatedResponse<Document>> => {
      const query = buildQueryString(filters);
      return fetch(`${API_BASE}/documents${query}`, buildFetchOptions('GET'))
        .then(r => handleResponse<PaginatedResponse<Document>>(r));
    },

    /**
     * Get user's documents
     */
    myDocuments: async (filters?: { category?: string; page?: number }): Promise<PaginatedResponse<Document>> => {
      const query = buildQueryString(filters);
      return fetch(`${API_BASE}/documents/my-documents${query}`, buildFetchOptions('GET'))
        .then(r => handleResponse<PaginatedResponse<Document>>(r));
    },

    /**
     * Get single document
     */
    get: async (id: number): Promise<ApiResponse<Document>> => {
      return fetch(`${API_BASE}/documents/${id}`, buildFetchOptions('GET'))
        .then(r => handleResponse<ApiResponse<Document>>(r));
    },

    /**
     * Create document
     */
    create: async (data: Partial<Document>): Promise<ApiResponse<Document>> => {
      return fetch(`${API_BASE}/documents`, buildFetchOptions('POST', data))
        .then(r => handleResponse<ApiResponse<Document>>(r));
    },

    /**
     * Update document
     */
    update: async (id: number, data: Partial<Document>): Promise<ApiResponse<Document>> => {
      return fetch(`${API_BASE}/documents/${id}`, buildFetchOptions('PUT', data))
        .then(r => handleResponse<ApiResponse<Document>>(r));
    },

    /**
     * Delete document
     */
    delete: async (id: number): Promise<ApiResponse<null>> => {
      return fetch(`${API_BASE}/documents/${id}`, buildFetchOptions('DELETE'))
        .then(r => handleResponse<ApiResponse<null>>(r));
    },

    /**
     * Download document
     */
    download: async (id: number): Promise<void> => {
      return fetch(`${API_BASE}/documents/${id}/download`, buildFetchOptions('POST'))
        .then(async r => {
          if (!r.ok) throw new Error('Download failed');
          const blob = await r.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `document-${id}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        });
    },

    /**
     * Get filter options
     */
    filterOptions: async (): Promise<ApiResponse<FilterOptions>> => {
      return fetch(`${API_BASE}/documents/filter-options`, buildFetchOptions('GET'))
        .then(r => handleResponse<ApiResponse<FilterOptions>>(r));
    },
  },

  /**
   * Profile API
   */
  profile: {
    /**
     * Get current user's profile
     */
    get: async (): Promise<ApiResponse<ProfileExtension>> => {
      return fetch(`${API_BASE}/profile`, buildFetchOptions('GET'))
        .then(r => handleResponse<ApiResponse<ProfileExtension>>(r));
    },

    /**
     * Get other user's profile
     */
    getUser: async (userId: number): Promise<ApiResponse<ProfileExtension>> => {
      return fetch(`${API_BASE}/profile/user/${userId}`, buildFetchOptions('GET'))
        .then(r => handleResponse<ApiResponse<ProfileExtension>>(r));
    },

    /**
     * Update current user's profile
     */
    update: async (data: Partial<ProfileExtension>): Promise<ApiResponse<ProfileExtension>> => {
      return fetch(`${API_BASE}/profile`, buildFetchOptions('PUT', data))
        .then(r => handleResponse<ApiResponse<ProfileExtension>>(r));
    },

    /**
     * Mark profile as complete
     */
    markComplete: async (): Promise<ApiResponse<ProfileExtension>> => {
      return fetch(`${API_BASE}/profile/mark-complete`, buildFetchOptions('PUT'))
        .then(r => handleResponse<ApiResponse<ProfileExtension>>(r));
    },

    /**
     * Upload avatar
     */
    uploadAvatar: async (file: File): Promise<ApiResponse<{ avatarUrl: string }>> => {
      const formData = new FormData();
      formData.append('avatar', file);

      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };

      const token = getCsrfToken();
      if (token) {
        headers['X-XSRF-TOKEN'] = token;
      }

      return fetch(`${API_BASE}/profile/avatar`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: formData,
      }).then(r => handleResponse<ApiResponse<{ avatarUrl: string }>>(r));
    },

    /**
     * Delete avatar
     */
    deleteAvatar: async (): Promise<ApiResponse<null>> => {
      return fetch(`${API_BASE}/profile/avatar`, buildFetchOptions('DELETE'))
        .then(r => handleResponse<ApiResponse<null>>(r));
    },
  },

  /**
   * Premium Transactions API
   */
  premiumTransactions: {
    /**
     * Ambil daftar Premium Post yang sudah berhasil dibayar (status = 'paid').
     * Digunakan oleh section "Premium Highlights" di halaman dashboard.
     * Mengembalikan maksimal 4 item terbaru.
     */
    highlights: async (): Promise<{ data: PremiumTransaction[] }> => {
      return fetch(`${API_BASE}/premium-transactions/highlights`, buildFetchOptions('GET'))
        .then(r => handleResponse<{ data: PremiumTransaction[] }>(r));
    },
    delete: async (id: number): Promise<{ message: string }> => {
      return fetch(`${API_BASE}/premium-transactions/${id}`, buildFetchOptions('DELETE'))
        .then(r => handleResponse<{ message: string }>(r));
    },
  },
};

/**
 * Export types for use in components
 */
export type * from '@/types';
