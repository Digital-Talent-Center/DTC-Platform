<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Like;
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
     * Delete post
     */
    public function destroy(Post $post)
    {
        // Authorize user
        if ($post->user_id !== Auth::id()) {
            return $this->messageResponse('Unauthorized', 403);
        }

        $post->delete();

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

        return response()->json([
            'isLiked' => $isLiked,
            'likesCount' => $post->refresh()->likes_count,
        ]);
    }
}
