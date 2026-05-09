<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Achievement;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index()
    {
        // Total Mahasiswa (excluding admins)
        $totalStudents = User::where('role', '!=', 'admin')->count();

        // Total Achievement Baru (Approved)
        $totalApprovedAchievements = Achievement::where('status', 'approved')->count();

        // 5 Recent Users
        $usersData = User::with('profileExtension')
            ->where('role', '!=', 'admin')
            ->latest()
            ->take(5)
            ->get();

        $recentUsers = $usersData->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'major' => $user->profileExtension?->major ?? 'N/A',
                'nim' => $user->profileExtension?->nim ?? 'N/A',
                'status' => 'ACTIVE',
            ];
        });

        // 4 Recent Pending Achievements
        $achievementsData = Achievement::with('user')
            ->where('status', 'pending')
            ->latest()
            ->take(4)
            ->get();

        $recentAchievements = $achievementsData->map(function ($achievement) {
            return [
                'id' => $achievement->id,
                'title' => $achievement->title,
                'by' => $achievement->user->name ?? 'Unknown',
                'icon' => '🏆', // default icon
            ];
        });

        return Inertia::render('admin/dashboard', [
            'totalStudents' => $totalStudents,
            'totalApprovedAchievements' => $totalApprovedAchievements,
            'recentUsers' => $recentUsers,
            'recentAchievements' => $recentAchievements,
        ]);
    }
}
