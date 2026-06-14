<?php

namespace App\Http\Controllers;

use App\Models\Achievement;
use App\Services\FcmService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AchievementController extends Controller
{
    use ApiResponseHelper;

    /**
     * Get all achievements for current user
     */
    public function index(Request $request)
    {
        $userId = $request->input('user_id', Auth::id());

        $achievements = Achievement::where('user_id', $userId)
            ->when($request->status, function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            ->when($request->category, function ($query) use ($request) {
                $query->where('category', $request->category);
            })
            ->orderByDesc('created_at')
            ->paginate(10);

        return $this->paginatedResponse($achievements);
    }

    /**
     * Get achievement by ID
     */
    public function show(Achievement $achievement)
    {
        return $this->apiResponse($achievement);
    }

    /**
     * Create new achievement
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                // Student information
                'nim' => 'required|string|max:20|min:1',
                'nama_lengkap' => 'required|string|max:255|min:1',
                
                // Academic info
                'tahun_ajaran' => 'required|string|max:20|min:1',
                'tanggal_mulai' => 'required|date_format:Y-m-d',
                'tanggal_selesai' => 'required|date_format:Y-m-d|after_or_equal:tanggal_mulai',
                
                // Achievement details
                'title' => 'required|string|max:255|min:1',
                'description' => 'required|string|max:2000|min:1',
                'category' => 'required|string|max:100|min:1',
                'jenis' => 'required|string|max:255|min:1',
                'tingkat' => 'required|in:Internal Kampus,Lokal,Regional,Nasional,Internasional',
                'keikutsertaan' => 'required|in:Individu,Tim/Kelompok',
                
                // Links and files
                'link_sertifikat' => 'nullable|url|max:500',
                'bukti' => 'nullable|file|mimes:pdf,jpg,jpeg,png,gif|max:2048',
            ], [
                'tanggal_mulai.required' => 'Tanggal mulai wajib diisi',
                'tanggal_mulai.date_format' => 'Format tanggal mulai tidak valid',
                'tanggal_selesai.required' => 'Tanggal selesai wajib diisi',
                'tanggal_selesai.date_format' => 'Format tanggal selesai tidak valid',
                'tanggal_selesai.after_or_equal' => 'Tanggal selesai harus sama atau setelah tanggal mulai',
                'bukti.file' => 'Bukti harus berupa file',
                'bukti.mimes' => 'Bukti harus berupa PDF atau Gambar (JPG, PNG, GIF)',
                'bukti.max' => 'Ukuran bukti maksimal 2MB',
            ]);

            // Handle file upload
            $buktiPath = null;
            if ($request->hasFile('bukti')) {
                try {
                    $file = $request->file('bukti');
                    $fileName = 'achievement_' . Auth::id() . '_' . time() . '.' . $file->getClientOriginalExtension();
                    $buktiPath = $file->storeAs('achievements', $fileName, 'public');
                    if (!$buktiPath) {
                        throw new \Exception('Gagal menyimpan file bukti');
                    }
                } catch (\Exception $e) {
                    return response()->json([
                        'message' => 'Gagal mengunggah file: ' . $e->getMessage(),
                    ], 400);
                }
            }

            $achievement = Achievement::create([
                'user_id' => Auth::id(),
                'nim' => $validated['nim'],
                'nama_lengkap' => $validated['nama_lengkap'],
                'tahun_ajaran' => $validated['tahun_ajaran'],
                'tanggal_mulai' => $validated['tanggal_mulai'],
                'tanggal_selesai' => $validated['tanggal_selesai'],
                'title' => $validated['title'],
                'description' => $validated['description'],
                'category' => $validated['category'],
                'jenis' => $validated['jenis'],
                'tingkat' => $validated['tingkat'],
                'keikutsertaan' => $validated['keikutsertaan'],
                'link_sertifikat' => $validated['link_sertifikat'] ?? null,
                'bukti_path' => $buktiPath,
                'status' => 'pending',
            ]);

            return response()->json([
                'message' => 'Achievement submitted successfully',
                'data' => $achievement,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to submit achievement',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update achievement
     */
    public function update(Request $request, Achievement $achievement)
    {
        if ($achievement->user_id !== Auth::id()) {
            return $this->messageResponse('Unauthorized', 403);
        }

        $oldStatus = $achievement->status;

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'sometimes|required|string|max:100',
            'status' => 'sometimes|required|in:pending,approved,rejected',
            'year' => 'nullable|integer|min:1900|max:' . now()->year,
            'badge_icon' => 'nullable|string|max:255',
        ]);

        $achievement->update($validated);

        // Kirim notifikasi FCM jika status berubah ke approved/rejected.
        $newStatus = $validated['status'] ?? $oldStatus;
        if ($newStatus !== $oldStatus && in_array($newStatus, ['approved', 'rejected'])) {
            $this->sendAchievementNotification($achievement, $newStatus);
        }

        return $this->apiResponse($achievement, 'Achievement updated successfully');
    }

    /**
     * Delete achievement
     */
    public function destroy(Achievement $achievement)
    {
        if ($achievement->user_id !== Auth::id()) {
            return $this->messageResponse('Unauthorized', 403);
        }

        $achievement->delete();

        return $this->messageResponse('Achievement deleted successfully');
    }

    /**
     * Get achievements statistics
     */
    public function statistics(Request $request)
    {
        $user = Auth::user();

        $stats = [
            'total' => $user->achievements()->count(),
            'approved' => $user->achievements()->approved()->count(),
            'pending' => $user->achievements()->pending()->count(),
            'rejected' => $user->achievements()->status('rejected')->count(),
            'byCategory' => $user->achievements()
                ->selectRaw('category, COUNT(*) as count')
                ->groupBy('category')
                ->get()
                ->map(fn ($item) => [
                    'category' => $item->category,
                    'count' => $item->count,
                ])
                ->values()
                ->all(),
        ];

        return response()->json([
            'data' => $stats,
        ]);
    }

    /**
     * Update achievement status (admin only) — approve or reject
     */
    public function updateStatus(Request $request, Achievement $achievement)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'reason' => 'nullable|string|max:500',
        ]);

        try {
            $achievement->update(['status' => $validated['status']]);

            // Kirim notifikasi FCM ke pemilik achievement.
            $this->sendAchievementNotification(
                $achievement,
                $validated['status'],
                $validated['reason'] ?? null,
            );

            return back()->with('success', 'Status pencapaian berhasil diperbarui.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Kirim notifikasi FCM saat achievement di-approve atau di-reject.
     *
     * @param  Achievement $achievement
     * @param  string      $status  'approved' | 'rejected'
     * @param  string|null $reason  Alasan penolakan (opsional, untuk rejected)
     */
    private function sendAchievementNotification(Achievement $achievement, string $status, ?string $reason = null): void
    {
        try {
            $owner = $achievement->user;
            if (!$owner) return;

            if ($status === 'approved') {
                $title = 'Achievement diterima';
                $body  = 'Achievement kamu berhasil diverifikasi';
                $type  = 'achievement_approved';
                $data  = [
                    'type'           => $type,
                    'achievement_id' => (string) $achievement->id,
                ];
            } else {
                $title = 'Achievement ditolak';
                $body  = 'Achievement kamu belum memenuhi syarat';
                $type  = 'achievement_rejected';
                $data  = [
                    'type'           => $type,
                    'achievement_id' => (string) $achievement->id,
                ];
                if ($reason) {
                    $data['reason'] = $reason;
                }
            }

            $fcm = new FcmService();
            $fcm->sendToUser(
                $owner,
                $title,
                $body,
                $data,
                'ACHIEVEMENT',
            );
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('[FCM] achievement notification error: ' . $e->getMessage());
        }
    }

    /**
     * Get all pending achievements for Admin Dashboard
     */
    public function adminIndex()
    {
        // Mengambil semua achievement yang statusnya pending beserta relasi user dan profilnya
        $achievementsData = Achievement::with(['user.profileExtension'])
            ->where('status', 'pending')
            ->latest()
            ->get();

        $achievements = $achievementsData->map(function ($achievement) {
            return [
                'id' => $achievement->id,
                'title' => $achievement->title,
                'user' => $achievement->user->name ?? 'Unknown',
                'major' => $achievement->user->profileExtension->major ?? 'N/A',
                'file' => $achievement->badge_icon ?? 'No File',
                'fileSize' => 'N/A',
                'uploadedAt' => $achievement->created_at->diffForHumans(),
            ];
        });

        $pendingCount = Achievement::where('status', 'pending')->count();
        $approvedCount = Achievement::where('status', 'approved')->count();

        return Inertia::render('admin/Achievement-Management', [
            'initialAchievements' => $achievements,
            'initialPendingCount' => $pendingCount,
            'initialApprovedCount' => $approvedCount,
        ]);
    }
}
