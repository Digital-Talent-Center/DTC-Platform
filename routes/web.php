<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AchievementController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\GuideController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UsersController;
use App\Http\Middleware\IsAdmin;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {

    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('profile', function () {
        return Inertia::render('profile');
    })->name('profile.show');

    Route::get('profile/{hash}', function ($hash) {
        $decoded = base64_decode($hash);
        if (str_starts_with($decoded, 'user_')) {
            $id = str_replace('user_', '', $decoded);
            return Inertia::render('profile', ['userId' => $id]);
        }
        // Fallback for numeric IDs
        if (is_numeric($hash)) {
            return Inertia::render('profile', ['userId' => $hash]);
        }
        return abort(404);
    })->name('profile.show.user');

    Route::get('profile/edit', function () {
        return Inertia::render('profile-edit');
    })->name('profile.edit');

    Route::get('dashboard/activities', [ActivityController::class, 'page'])
        ->name('dashboard.activities');

    Route::post('logout', [LoginController::class, 'logout'])->name('logout');

    Route::get('/api/chat-sessions', [App\Http\Controllers\ChatSessionController::class, 'index']);
    Route::post('/api/chat-sessions', [App\Http\Controllers\ChatSessionController::class, 'store']);
    Route::delete('/api/chat-sessions/all', [App\Http\Controllers\ChatSessionController::class, 'destroyAll']);
    Route::delete('/api/chat-sessions/{chatSession}', [App\Http\Controllers\ChatSessionController::class, 'destroy']);

    Route::post('/activities', [ActivityController::class, 'store'])
        ->name('activities.store');

    Route::get('dashboard/achievements', function () {
        return Inertia::render('achievements');
    })->name('dashboard.achievements');

    Route::get('dashboard/achievements/new', function () {
        return Inertia::render('submit-achievement');
    })->name('dashboard.achievements.new');

    Route::get('dashboard/co-guide', function () {
        return Inertia::render('co-guide');
    })->name('dashboard.co-guide');

    Route::get('dashboard/co-library', function () {
        return Inertia::render('co-library');
    })->name('dashboard.co-library');

    Route::get('dashboard/premium-post', function () {
        return Inertia::render('premium-post');
    })->name('dashboard.premium-post');

    Route::get('notifications', function () {
        return Inertia::render('notifications');
    })->name('notifications');

    Route::get('timeline', function () {
        return Inertia::render('Timeline/Index');
    })->name('timeline');

    Route::get('chatbot', function () {
        return Inertia::render('chatbot');
    })->name('chatbot');

    // Admin Routes
    Route::middleware([IsAdmin::class])->group(function () {
        Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');

        Route::get('/admin/activities', [ReportController::class, 'adminActivityManagement'])->name('admin.activities');
        Route::delete('/admin/reports/{report}', [ReportController::class, 'destroy'])->name('admin.reports.destroy');

        Route::get('/admin/achievements', [AchievementController::class, 'adminIndex'])->name('admin.achievements');
        Route::patch('/admin/achievements/{achievement}/status', [AchievementController::class, 'updateStatus'])->name('admin.achievements.updateStatus');

        Route::get('/admin/students', [UsersController::class, 'index'])->name('admin.students');
        Route::post('/admin/students', [UsersController::class, 'store'])->name('admin.students.store');
        Route::put('/admin/students/{id}', [UsersController::class, 'update'])->name('admin.students.update');
        Route::delete('/admin/students/{id}', [UsersController::class, 'destroy'])->name('admin.students.destroy');

        // Co-Guide management
        Route::get('/admin/guides', [GuideController::class, 'adminIndex'])->name('admin.guides');
        Route::post('/admin/guides', [GuideController::class, 'adminStore'])->name('admin.guides.store');
        Route::delete('/admin/guides/{guide}', [GuideController::class, 'adminDestroy'])->name('admin.guides.destroy');

        // Co-Library management
        Route::get('/admin/library', [DocumentController::class, 'adminIndex'])->name('admin.library');
        Route::post('/admin/library', [DocumentController::class, 'adminStore'])->name('admin.library.store');
        Route::delete('/admin/library/{document}', [DocumentController::class, 'adminDestroy'])->name('admin.library.destroy');
    });
});

require __DIR__.'/settings.php';

require __DIR__.'/auth.php';