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
use App\Http\Controllers\ReportController;
use App\Http\Controllers\MidtransController;
use App\Http\Controllers\PremiumTransactionController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\FcmTokenController;
use App\Http\Middleware\AuthenticateApi;

// ── Auth mobile (Sanctum token) — publik untuk login & register ──
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware(AuthenticateApi::class)->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

// All API routes require authentication.
// AuthenticateApi menerima dua mode: session cookie (SPA) ATAU Bearer token (mobile).
Route::middleware(AuthenticateApi::class)->group(function () {

    // ── FCM Token (push notification device registration) ──
    Route::post('fcm-token', [FcmTokenController::class, 'store']);
    Route::delete('fcm-token', [FcmTokenController::class, 'destroy']);

    // Posts Routes
    Route::prefix('posts')->group(function () {
        Route::get('/', [PostController::class, 'index']);
        Route::post('/', [PostController::class, 'store']);
        Route::post('upload-media', [PostController::class, 'uploadMedia']); // sebelum {post}
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

    // Reports Routes — for reporting posts
    Route::prefix('reports')->group(function () {
        Route::get('/', [ReportController::class, 'index']); // Admin only
        Route::post('/', [ReportController::class, 'store']); // Create report
        Route::get('my-reports', [ReportController::class, 'myReports']); // User's own reports
        Route::get('statistics', [ReportController::class, 'statistics']); // Admin only
        Route::get('{report}', [ReportController::class, 'show']);
        Route::put('{report}/status', [ReportController::class, 'updateStatus']); // Admin only
        Route::get('post/{post}', [ReportController::class, 'showPostReports']); // Admin - view reports for a post
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
        Route::get('upcoming', [ActivityController::class, 'upcoming']); // Get upcoming activities
        Route::get('completed', [ActivityController::class, 'completed']); // Get completed activities
        Route::get('overdue', [ActivityController::class, 'overdue']); // Get overdue activities
        Route::get('{activity}', [ActivityController::class, 'show']);
        Route::put('{activity}', [ActivityController::class, 'update']);
        Route::delete('{activity}', [ActivityController::class, 'destroy']);
        Route::patch('{activity}/status', [ActivityController::class, 'updateStatus']); // Update status
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

    // Midtrans Routes — create transaction (auth required)
    Route::prefix('midtrans')->group(function () {
        Route::post('upload-attachment',   [MidtransController::class, 'uploadAttachment']);
        Route::post('create-transaction',  [MidtransController::class, 'createTransaction']);
        // Fallback untuk update status saat webhook tidak bisa menjangkau localhost
        Route::post('check-and-mark-paid', [MidtransController::class, 'checkAndMarkPaid']);
    });

    // Premium Transactions Routes
    Route::prefix('premium-transactions')->group(function () {
        // GET /api/premium-transactions/highlights — paid posts untuk Premium Highlights di dashboard
        Route::get('highlights', [PremiumTransactionController::class, 'highlights']);
    });
});

// Midtrans Webhook — public, no auth, no CSRF (Midtrans server yang memanggil)
Route::post('/midtrans/notification', [MidtransController::class, 'handleNotification'])
    ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class]);
