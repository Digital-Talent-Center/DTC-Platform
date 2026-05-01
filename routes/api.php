<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PostController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\AchievementController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\ProfileExtensionController;
use App\Http\Controllers\GuideController;

// All API routes require authentication via session (shared web middleware)
Route::middleware('auth')->group(function () {

    // Posts Routes
    Route::prefix('posts')->group(function () {
        Route::get('/', [PostController::class, 'index']);
        Route::post('/', [PostController::class, 'store']);
        Route::get('{post}', [PostController::class, 'show']);
        Route::put('{post}', [PostController::class, 'update']);
        Route::delete('{post}', [PostController::class, 'destroy']);
        Route::post('{post}/like', [PostController::class, 'toggleLike']);
    });

    // Comments Routes
    Route::prefix('posts/{post}/comments')->group(function () {
        Route::get('/', [CommentController::class, 'index']);
        Route::post('/', [CommentController::class, 'store']);
        Route::put('{comment}', [CommentController::class, 'update']);
        Route::delete('{comment}', [CommentController::class, 'destroy']);
        Route::post('{comment}/like', [CommentController::class, 'toggleLike']);
    });

    // Achievements Routes — static routes BEFORE {achievement} parameter
    Route::prefix('achievements')->group(function () {
        Route::get('/', [AchievementController::class, 'index']);
        Route::post('/', [AchievementController::class, 'store']);
        Route::get('statistics', [AchievementController::class, 'statistics']);
        Route::get('{achievement}', [AchievementController::class, 'show']);
        Route::put('{achievement}', [AchievementController::class, 'update']);
        Route::delete('{achievement}', [AchievementController::class, 'destroy']);
    });

    // Activities Routes — static routes BEFORE {activity} parameter
    Route::prefix('activities')->group(function () {
        Route::get('/', [ActivityController::class, 'index']);
        Route::post('/', [ActivityController::class, 'store']);
        Route::get('statistics', [ActivityController::class, 'statistics']);
        Route::get('{activity}', [ActivityController::class, 'show']);
        Route::put('{activity}', [ActivityController::class, 'update']);
        Route::delete('{activity}', [ActivityController::class, 'destroy']);
    });

    // Notifications Routes — static routes BEFORE {notification} parameter
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::post('/', [NotificationController::class, 'store']);
        Route::get('unread-count', [NotificationController::class, 'unreadCount']);
        Route::put('mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::get('{notification}', [NotificationController::class, 'show']);
        Route::put('{notification}/read', [NotificationController::class, 'markAsRead']);
        Route::put('{notification}/unread', [NotificationController::class, 'markAsUnread']);
        Route::delete('{notification}', [NotificationController::class, 'destroy']);
    });

    // Documents Routes — static routes BEFORE {document} parameter
    Route::prefix('documents')->group(function () {
        Route::get('/', [DocumentController::class, 'index']);
        Route::post('/', [DocumentController::class, 'store']);
        Route::get('my-documents', [DocumentController::class, 'myDocuments']);
        Route::get('filter-options', [DocumentController::class, 'filterOptions']);
        Route::get('{document}', [DocumentController::class, 'show']);
        Route::put('{document}', [DocumentController::class, 'update']);
        Route::delete('{document}', [DocumentController::class, 'destroy']);
        Route::post('{document}/download', [DocumentController::class, 'download']);
        Route::patch('{activity}', [ActivityController::class, 'update']);
    });

    // Profile Extension Routes
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileExtensionController::class, 'show']);
        Route::put('/', [ProfileExtensionController::class, 'update']);
        Route::put('mark-complete', [ProfileExtensionController::class, 'markComplete']);
        Route::get('user/{userId}', [ProfileExtensionController::class, 'showUser']);
    });

    // Guides Routes
    Route::prefix('guides')->group(function () {
        Route::get('/', [GuideController::class, 'index']);
        Route::post('/', [GuideController::class, 'store']);
        Route::get('{guide}', [GuideController::class, 'show']);
        Route::put('{guide}', [GuideController::class, 'update']);
        Route::delete('{guide}', [GuideController::class, 'destroy']);
        Route::post('{guide}/download', [GuideController::class, 'download']);
    });
});
