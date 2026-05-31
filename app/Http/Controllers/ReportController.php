<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ReportController extends Controller
{
    use ApiResponseHelper;

    /**
     * Get all reports (admin only)
     */
    public function index(Request $request)
    {
        // This should be restricted to admin users
        $query = Report::query()
            ->with(['post.user', 'reporter', 'resolver']);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by reason
        if ($request->filled('reason')) {
            $query->where('reason', $request->reason);
        }

        // Filter by date range
        if ($request->filled('from_date')) {
            $query->where('created_at', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->where('created_at', '<=', $request->to_date . ' 23:59:59');
        }

        // Search in description
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('description', 'like', '%' . $request->search . '%')
                  ->orWhere('reason', 'like', '%' . $request->search . '%');
            });
        }

        $reports = $query->latest('created_at')->paginate(15);

        return $this->paginatedResponse($reports->through(function ($report) {
            return [
                'id' => $report->id,
                'post_id' => $report->post_id,
                'post' => [
                    'id' => $report->post->id,
                    'content' => $report->post->content,
                    'user' => [
                        'id' => $report->post->user->id,
                        'name' => $report->post->user->name,
                    ]
                ],
                'reporter' => [
                    'id' => $report->reporter->id,
                    'name' => $report->reporter->name,
                ],
                'reason' => $report->reason,
                'description' => $report->description,
                'status' => $report->status,
                'action_taken' => $report->action_taken,
                'resolved_at' => $report->resolved_at?->toISOString(),
                'created_at' => $report->created_at->toISOString(),
            ];
        }));
    }

    /**
     * Get reports for a specific post
     */
    public function showPostReports(Post $post)
    {
        $reports = Report::query()
            ->where('post_id', $post->id)
            ->with(['reporter', 'resolver'])
            ->latest('created_at')
            ->get();

        return $this->apiResponse([
            'post_id' => $post->id,
            'total_reports' => count($reports),
            'pending_count' => $reports->where('status', 'pending')->count(),
            'reports' => $reports->map(fn ($report) => [
                'id' => $report->id,
                'reporter_name' => $report->reporter->name,
                'reason' => $report->reason,
                'description' => $report->description,
                'status' => $report->status,
                'created_at' => $report->created_at->toISOString(),
            ])
        ]);
    }

    /**
     * Get reports by current user
     */
    public function myReports(Request $request)
    {
        $reports = Report::query()
            ->where('user_id', Auth::id())
            ->with(['post.user', 'resolver'])
            ->latest('created_at')
            ->paginate(15);

        return $this->paginatedResponse($reports->through(function ($report) {
            return [
                'id' => $report->id,
                'post_id' => $report->post_id,
                'post' => [
                    'id' => $report->post->id,
                    'user_name' => $report->post->user->name,
                ],
                'reason' => $report->reason,
                'description' => $report->description,
                'status' => $report->status,
                'action_taken' => $report->action_taken,
                'created_at' => $report->created_at->toISOString(),
                'resolved_at' => $report->resolved_at?->toISOString(),
            ];
        }));
    }

    /**
     * Create a new report for a post
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'post_id' => 'required|exists:posts,id',
                'reason' => 'required|in:inappropriate_content,spam,harassment,false_information,copyright_violation,other',
                'description' => 'nullable|string|max:1000',
            ]);

            // Check if user already reported this post
            $existingReport = Report::query()
                ->where('post_id', $validated['post_id'])
                ->where('user_id', Auth::id())
                ->where('status', 'pending')
                ->first();

            if ($existingReport) {
                return $this->messageResponse('You have already reported this post', 422);
            }

            $report = Report::create([
                'post_id' => $validated['post_id'],
                'user_id' => Auth::id(),
                'reason' => $validated['reason'],
                'description' => $validated['description'] ?? null,
                'status' => 'pending',
            ]);

            return $this->apiResponse([
                'id' => $report->id,
                'post_id' => $report->post_id,
                'reason' => $report->reason,
                'status' => $report->status,
                'created_at' => $report->created_at->toISOString(),
            ], 'Report submitted successfully', 201);

        } catch (\Exception $e) {
            return $this->messageResponse($e->getMessage(), 500);
        }
    }

    /**
     * Get report details
     */
    public function show(Report $report)
    {
        $report->load(['post.user', 'reporter', 'resolver']);

        return $this->apiResponse([
            'id' => $report->id,
            'post_id' => $report->post_id,
            'post' => [
                'id' => $report->post->id,
                'content' => $report->post->content,
                'user' => [
                    'id' => $report->post->user->id,
                    'name' => $report->post->user->name,
                ]
            ],
            'reporter' => [
                'id' => $report->reporter->id,
                'name' => $report->reporter->name,
            ],
            'reason' => $report->reason,
            'description' => $report->description,
            'status' => $report->status,
            'action_taken' => $report->action_taken,
            'resolved_by' => $report->resolver ? [
                'id' => $report->resolver->id,
                'name' => $report->resolver->name,
            ] : null,
            'resolved_at' => $report->resolved_at?->toISOString(),
            'created_at' => $report->created_at->toISOString(),
            'updated_at' => $report->updated_at->toISOString(),
        ]);
    }

    /**
     * Update report status (admin only)
     */
    public function updateStatus(Request $request, Report $report)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,under_review,resolved,dismissed',
            'action_taken' => 'nullable|string|max:255',
        ]);

        try {
            $report->update([
                'status' => $validated['status'],
                'action_taken' => $validated['action_taken'] ?? null,
                'resolved_by' => Auth::id(),
                'resolved_at' => now(),
            ]);

            return $this->apiResponse($report, 'Report status updated successfully');
        } catch (\Exception $e) {
            return $this->messageResponse($e->getMessage(), 500);
        }
    }

    /**
     * Render halaman Manajemen Aktivitas (admin) dengan data laporan dari DB
     */
    public function adminActivityManagement(Request $request)
    {
        $query = Report::query()
            ->with(['post', 'reporter']);

        // Filter status jika ada
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        } else {
            // Default: tampilkan yang pending & under_review
            $query->whereIn('status', ['pending', 'under_review']);
        }

        $reportsData = $query->latest('created_at')->paginate(24);

        $reports = $reportsData->through(function ($report) {
            $initials = collect(explode(' ', $report->reporter->name ?? 'U K'))
                ->map(fn($word) => strtoupper(substr($word, 0, 1)))
                ->take(2)
                ->join('');

            return [
                'id'          => $report->id,
                'user'        => $report->reporter->name ?? 'Unknown',
                'userId'      => $report->reporter->id ?? null,
                'avatar'      => $initials,
                'reason'      => strtoupper(str_replace('_', ' ', $report->reason)),
                'content'     => $report->description ?? ($report->post->content ?? 'Tidak ada deskripsi.'),
                'status'      => $report->status,
                'post_id'     => $report->post_id,
                'created_at'  => $report->created_at->toISOString(),
            ];
        });

        $pendingCount = Report::whereIn('status', ['pending', 'under_review'])->count();

        return Inertia::render('admin/Activity-Management', [
            'initialReports'  => $reports,
            'pendingCount'    => $pendingCount,
        ]);
    }

    /**
     * Delete a report (admin only)
     */
    public function destroy(Report $report)
    {
        try {
            $report->delete();
            return back()->with('success', 'Laporan berhasil dihapus.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Get reports summary/statistics (admin only)
     */
    public function statistics()
    {
        $totalReports = Report::count();
        $pendingReports = Report::where('status', 'pending')->count();
        $underReviewReports = Report::where('status', 'under_review')->count();
        $resolvedReports = Report::where('status', 'resolved')->count();
        $dismissedReports = Report::where('status', 'dismissed')->count();

        $reportsByReason = Report::selectRaw('reason, COUNT(*) as count')
            ->groupBy('reason')
            ->get()
            ->pluck('count', 'reason')
            ->toArray();

        $reportsByStatus = [
            'pending' => $pendingReports,
            'under_review' => $underReviewReports,
            'resolved' => $resolvedReports,
            'dismissed' => $dismissedReports,
        ];

        return $this->apiResponse([
            'total_reports' => $totalReports,
            'by_status' => $reportsByStatus,
            'by_reason' => $reportsByReason,
        ]);
    }
}
