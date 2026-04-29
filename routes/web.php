<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ActivityController;

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

    Route::get('dashboard/co-guide', function () {
        return Inertia::render('co-guide');
    })->name('dashboard.co-guide');

    Route::get('dashboard/co-library', function () {
        return Inertia::render('co-library');
    })->name('dashboard.co-library');

    Route::get('notifications', function () {
        return Inertia::render('notifications');
    })->name('notifications');

    Route::get('timeline', function () {
        return Inertia::render('Timeline/Index');
    })->name('timeline');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';