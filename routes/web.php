<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('profile', function () {
        return Inertia::render('profile');
    })->name('profile');

    Route::get('profile/edit', function () {
        return Inertia::render('profile-edit');
    })->name('profile.edit');

    Route::get('dashboard/activities', function () {
        return Inertia::render('activities');
    })->name('dashboard.activities');

    Route::get('dashboard/achievements', function () {
        return Inertia::render('achievements');
    })->name('dashboard.achievements');

    Route::get('dashboard/achievements/new', function () {
        // For now, render achievements as placeholder
        return Inertia::render('achievements');
    })->name('dashboard.achievements.new');

    Route::get('dashboard/co-guide', function () {
        return Inertia::render('co-guide');
    })->name('dashboard.co-guide');

    Route::get('timeline', function () {
        return Inertia::render('Timeline/Index');
    })->name('timeline');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
