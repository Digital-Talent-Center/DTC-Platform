import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

/**
 * Post/Timeline Interfaces
 */
export interface Post {
    id: number;
    userId: number;
    content: string;
    imageUrl?: string;
    caption?: string;
    tag?: string;
    likesCount: number;
    commentsCount: number;
    createdAt: string;
    updatedAt: string;
    user?: User;
    comments?: Comment[];
    isLikedByUser?: boolean;
}

export interface Comment {
    id: number;
    postId: number;
    userId: number;
    content: string;
    likesCount: number;
    createdAt: string;
    updatedAt: string;
    user?: User;
    isLikedByUser?: boolean;
}

export interface Like {
    id: number;
    userId: number;
    likeableId: number;
    likeableType: 'Post' | 'Comment';
    createdAt: string;
}

/**
 * Achievement Interfaces
 */
export interface Achievement {
    id: number;
    userId: number;
    title: string;
    description?: string;
    category: string;
    status: 'pending' | 'approved' | 'rejected';
    badgeIcon?: string;
    year?: number;
    createdAt: string;
    updatedAt: string;
    user?: User;
}

export interface AchievementStats {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    byCategory: { category: string; count: number }[];
}

/**
 * Activity Interfaces
 */
export interface Activity {
    id: number;
    userId: number;
    type: string;
    title: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    relatableId?: number;
    relatableType?: string;
    activityDate: string;
    createdAt: string;
    updatedAt: string;
    user?: User;
}

export interface ActivityStats {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    byType: { type: string; count: number }[];
}

/**
 * Notification Interfaces
 */
export interface Notification {
    id: number;
    userId: number;
    category: string;
    title: string;
    message: string;
    isRead: boolean;
    notifiableId?: number;
    notifiableType?: string;
    actionUrl?: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Document Interfaces
 */
export interface Document {
    id: number;
    userId: number;
    title: string;
    description?: string;
    type: string;
    category: string;
    competition?: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
    year?: number;
    filePath?: string;
    fileIcon?: string;
    tags?: Tag[];
    viewsCount: number;
    downloadsCount: number;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
    user?: User;
}

export interface Tag {
    id: number;
    name: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
}

export interface DocumentFilters {
    category?: string;
    type?: string;
    competition?: string;
    level?: string;
    year?: number;
    search?: string;
    page?: number;
    perPage?: number;
}

export interface FilterOptions {
    competitions: string[];
    levels: string[];
    types: string[];
    categories: string[];
}

/**
 * Profile Interfaces
 */
export interface ProfileExtension {
    id: number;
    userId: number;
    nim?: string;
    faculty?: string;
    major?: string;
    phone?: string;
    avatarUrl?: string;
    about?: string;
    role?: string;
    socialLinks?: {
        github?: string;
        linkedin?: string;
        twitter?: string;
        portfolio?: string;
    };
    profileCompletedAt?: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Pagination Interfaces
 */
export interface PaginationMeta {
    currentPage: number;
    perPage: number;
    total: number;
    lastPage: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
}
