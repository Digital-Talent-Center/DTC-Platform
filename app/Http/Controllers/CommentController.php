<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Comment;
use App\Models\Like;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    use ApiResponseHelper;

    /**
     * Get all comments for a post
     */
    public function index(Post $post)
    {
        $comments = $post->comments()
            ->with(['user.profileExtension', 'likes'])
            ->paginate(20);

        return $this->paginatedResponse($comments);
    }

    /**
     * Create new comment on a post
     */
    public function store(Request $request, Post $post)
    {
        $validated = $request->validate([
            'content' => 'required|string|min:1|max:1000',
        ]);

        $comment = Comment::create([
            'post_id' => $post->id,
            'user_id' => Auth::id(),
            ...$validated,
        ]);

        $post->updateCommentsCount();

        return $this->apiResponse($comment->load('user.profileExtension'), 'Comment created successfully', 201);
    }

    /**
     * Update comment
     */
    public function update(Request $request, Post $post, Comment $comment)
    {
        // Authorize user
        if ($comment->user_id !== Auth::id()) {
            return $this->messageResponse('Unauthorized', 403);
        }
        
        // Verify comment belongs to post
        if ($comment->post_id !== $post->id) {
            return $this->messageResponse('Comment does not belong to this post', 404);
        }

        $validated = $request->validate([
            'content' => 'required|string|min:1|max:1000',
        ]);

        $comment->update($validated);

        return $this->apiResponse($comment, 'Comment updated successfully');
    }

    /**
     * Delete comment
     */
    public function destroy(Post $post, Comment $comment)
    {
        // Verify comment belongs to post
        if ($comment->post_id !== $post->id) {
            return $this->messageResponse('Comment does not belong to this post', 404);
        }

        // Authorize user (comment owner or post owner)
        if ($comment->user_id !== Auth::id() && $post->user_id !== Auth::id()) {
            return $this->messageResponse('Unauthorized', 403);
        }

        $comment->delete();
        $post->updateCommentsCount();

        return $this->messageResponse('Comment deleted successfully');
    }

    /**
     * Like/unlike a comment
     */
    public function toggleLike(Post $post, Comment $comment)
    {
        $userId = Auth::id();

        $like = Like::where('user_id', $userId)
            ->where('likeable_id', $comment->id)
            ->where('likeable_type', 'Comment')
            ->first();

        if ($like) {
            $like->delete();
            $isLiked = false;
        } else {
            Like::create([
                'user_id' => $userId,
                'likeable_id' => $comment->id,
                'likeable_type' => 'Comment',
            ]);
            $isLiked = true;
        }

        $comment->updateLikesCount();

        return response()->json([
            'isLiked' => $isLiked,
            'likesCount' => $comment->refresh()->likes_count,
        ]);
    }
}
