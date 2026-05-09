<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AchievementController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\AdminDashboardController;
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

    Route::get('profile/edit', function () {
        return Inertia::render('profile-edit');
    })->name('profile.edit');

    // ✅ FIX: pakai controller, bukan closure
    Route::get('dashboard/activities', [ActivityController::class, 'page'])
        ->name('dashboard.activities');

    // ✅ CREATE
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

    // Admin Routes
    Route::middleware([IsAdmin::class])->group(function () {
        Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');

        Route::get('/admin/activities', function () {
            return Inertia::render('admin/Activity-Management');
        })->name('admin.activities');

        Route::get('/admin/achievements', [AchievementController::class, 'adminIndex'])->name('admin.achievements');

        Route::get('/admin/students', [UsersController::class, 'index'])->name('admin.students');
    });
});

require __DIR__.'/settings.php';

require __DIR__.'/auth.php';