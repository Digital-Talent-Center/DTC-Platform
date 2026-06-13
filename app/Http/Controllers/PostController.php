<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Like;
use App\Services\FcmService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PostController extends Controller
{
    use ApiResponseHelper;

    /**
     * Get all posts with pagination
     */
    public function index(Request $request)
    {
        $perPage = $request->per_page ?? 10;

        $posts = Post::with(['user', 'comments.user', 'likes'])
            ->when($request->user_id, function ($query) use ($request) {
                $query->where('user_id', $request->user_id);
            })
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return $this->paginatedResponse($posts);
    }

    /**
     * Get single post
     */
    public function show(Post $post)
    {
        $post->load(['user', 'comments.user.profileExtension', 'likes']);

        return $this->apiResponse($post);
    }

    /**
     * Create new post
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'content' => 'required|string|min:1|max:5000',
            'image_url' => 'nullable|string|max:500',
            'caption' => 'nullable|string|max:500',
            'tag' => 'nullable|string|max:100',
        ]);

        $post = Post::create([
            'user_id' => Auth::id(),
            ...$validated,
        ]);

        return $this->apiResponse($post->load('user'), 'Post created successfully', 201);
    }

    /**
     * Upload media (foto/video) untuk sebuah post.
     * Dipakai klien mobile yang mengunggah berkas asli (web memakai mekanisme
     * localStorage di browser). Mengembalikan URL publik untuk disimpan ke
     * kolom image_url post.
     */
    public function uploadMedia(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimetypes:image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm,video/ogg|max:20480',
        ]);

        $path = $request->file('file')->store('post-media', 'public');

        return response()->json([
            'url'  => '/storage/' . $path,
            'path' => $path,
        ]);
    }

    /**
     * Update post
     */
    public function update(Request $request, Post $post)
    {
        // Authorize user
        if ($post->user_id !== Auth::id()) {
            return $this->messageResponse('Unauthorized', 403);
        }

        $validated = $request->validate([
            'content' => 'sometimes|required|string|min:1|max:5000',
            'caption' => 'nullable|string|max:500',
            'tag' => 'nullable|string|max:100',
        ]);

        $post->update($validated);

        return $this->apiResponse($post, 'Post updated successfully');
    }

    /**
     * Delete post — pemilik post ATAU admin boleh menghapus.
     * Jika admin yang menghapus, kirim notifikasi ke pemilik post.
     */
    public function destroy(Request $request, Post $post)
    {
        $authUser = Auth::user();
        $isOwner  = $post->user_id === $authUser->id;
        $isAdmin  = $authUser->isAdmin();

        if (!$isOwner && !$isAdmin) {
            return $this->messageResponse('Unauthorized', 403);
        }

        // Simpan data yang diperlukan sebelum post dihapus.
        $postOwner = $post->user;
        $reason    = $request->input('reason', 'Melanggar aturan komunitas');

        $post->delete();

        // Kirim notifikasi FCM ke pemilik post jika dihapus oleh admin.
        if ($isAdmin && !$isOwner && $postOwner) {
            try {
                $fcm = new FcmService();
                $fcm->sendToUser(
                    $postOwner,
                    'Postingan dihapus',
                    "Postingan kamu dihapus karena {$reason}.",
                    [
                        'type'   => 'POST_DELETED_BY_ADMIN',
                        'reason' => $reason,
                    ],
                    'SYSTEM',
                );
            } catch (\Throwable $e) {
                // Jangan gagalkan response jika notifikasi gagal dikirim.
                \Illuminate\Support\Facades\Log::warning('[FCM] destroy notification error: ' . $e->getMessage());
            }
        }

        return $this->messageResponse('Post deleted successfully');
    }

    /**
     * Like/unlike a post
     */
    public function toggleLike(Post $post)
    {
        $userId = Auth::id();

        $like = Like::where('user_id', $userId)
            ->where('likeable_id', $post->id)
            ->where('likeable_type', 'Post')
            ->first();

        if ($like) {
            $like->delete();
            $isLiked = false;
        } else {
            Like::create([
                'user_id' => $userId,
                'likeable_id' => $post->id,
                'likeable_type' => 'Post',
            ]);
            $isLiked = true;
        }

        $post->updateLikesCount();

        // Kirim notifikasi FCM saat like (bukan unlike) dan bukan like sendiri.
        if ($isLiked && $post->user_id !== $userId) {
            try {
                $postOwner = $post->user;
                $actorName = Auth::user()->name ?? 'Seseorang';
                $fcm = new FcmService();
                $fcm->sendToUser(
                    $postOwner,
                    'Postingan kamu disukai',
                    "{$actorName} menyukai postingan kamu.",
                    [
                        'type'       => 'POST_LIKED',
                        'post_id'    => (string) $post->id,
                        'actor_name' => $actorName,
                    ],
                    'SYSTEM',
                );
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('[FCM] toggleLike notification error: ' . $e->getMessage());
            }
        }

        return response()->json([
            'isLiked' => $isLiked,
            'likesCount' => $post->refresh()->likes_count,
        ]);
    }
}
