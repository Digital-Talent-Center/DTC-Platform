<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Achievement;
use App\Models\Report;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index()
    {
        // Total Mahasiswa (excluding admins)
        $totalStudents = User::where('role', '!=', 'admin')->count();

        // Total Achievement Baru (Approved)
        $totalApprovedAchievements = Achievement::where('status', 'approved')->count();

        // Total Laporan Aktif (pending + under_review)
        $totalActiveReports = Report::whereIn('status', ['pending', 'under_review'])->count();

        // 5 Recent Users
        $usersData = User::with('profileExtension')
            ->where('role', '!=', 'admin')
            ->latest()
            ->take(5)
            ->get();

        $recentUsers = $usersData->map(function ($user) {
            return [
                'id'    => $user->id,
                'name'  => $user->name,
                'major' => $user->profileExtension?->major ?? 'N/A',
                'nim'   => $user->profileExtension?->nim ?? 'N/A',
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
                'id'    => $achievement->id,
                'title' => $achievement->title,
                'by'    => $achievement->user->name ?? 'Unknown',
                'icon'  => '🏆',
            ];
        });

        // 3 Laporan terbaru (pending / under_review) untuk preview dashboard
        $recentReportsData = Report::with('reporter')
            ->whereIn('status', ['pending', 'under_review'])
            ->latest()
            ->take(3)
            ->get();

        $recentReports = $recentReportsData->map(function ($report) {
            $initials = collect(explode(' ', $report->reporter->name ?? 'U K'))
                ->map(fn($word) => strtoupper(substr($word, 0, 1)))
                ->take(2)
                ->join('');

            return [
                'id'      => $report->id,
                'user'    => $report->reporter->name ?? 'Unknown',
                'avatar'  => $initials,
                'reason'  => strtoupper(str_replace('_', ' ', $report->reason)),
                'content' => $report->description ?? 'Tidak ada deskripsi laporan.',
            ];
        });

        return Inertia::render('admin/dashboard', [
            'totalStudents'            => $totalStudents,
            'totalApprovedAchievements'=> $totalApprovedAchievements,
            'totalActiveReports'       => $totalActiveReports,
            'recentUsers'              => $recentUsers,
            'recentAchievements'       => $recentAchievements,
            'recentReports'            => $recentReports,
        ]);
    }
}
