<?php

namespace App\Http\Controllers;

use App\Models\Guide;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GuideController extends Controller
{
    use ApiResponseHelper;

    /**
     * Get all public guides with filtering
     */
    public function index(Request $request)
    {
        $guides = Guide::query()
            ->where('is_public', true)
            ->when($request->category, function ($query) use ($request) {
                $query->category($request->category);
            })
            ->when($request->level, function ($query) use ($request) {
                $query->level($request->level);
            })
            ->when($request->year, function ($query) use ($request) {
                $query->year($request->year);
            })
            ->when($request->search, function ($query) use ($request) {
                $query->where(function ($q) use ($request) {
                    $q->where('title', 'like', '%' . $request->search . '%')
                      ->orWhere('description', 'like', '%' . $request->search . '%');
                });
            })
            ->orderByDesc('created_at')
            ->paginate(12);

        // Format response
        $formatted = $guides->through(function ($item) {
            return [
                'id' => $item->id,
                'user_id' => $item->user_id,
                'title' => $item->title,
                'description' => $item->description,
                'category' => $item->category,
                'level' => $item->level,
                'year' => $item->year,
                'file_path' => $item->file_path,
                'file_icon' => $item->file_icon,
                'tags' => $item->tags ?? [],
                'views_count' => $item->views_count,
                'downloads_count' => $item->downloads_count,
                'is_public' => $item->is_public,
                'created_at' => $item->created_at?->toISOString(),
            ];
        });

        return $this->paginatedResponse($formatted);
    }

    /**
     * Get a single guide
     */
    public function show(Guide $guide)
    {
        if (!$guide->is_public && $guide->user_id !== Auth::id()) {
            return $this->messageResponse('Unauthorized', 403);
        }

        $guide->incrementViews();

        return $this->apiResponse($guide);
    }

    /**
     * Create a new guide
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'category' => 'nullable|string|max:100',
            'level' => 'nullable|in:beginner,intermediate,advanced',
            'year' => 'nullable|integer|min:1900|max:' . now()->year,
            'file_path' => 'nullable|string|max:500',
            'file_icon' => 'nullable|string|max:50',
            'tags' => 'nullable|array|max:10',
            'tags.*' => 'string|max:50',
            'is_public' => 'boolean',
        ]);

        $guide = Guide::create([
            'user_id' => Auth::id(),
            ...$validated,
        ]);

        return $this->apiResponse($guide, 'Guide created successfully', 201);
    }

    /**
     * Update a guide
     */
    public function update(Request $request, Guide $guide)
    {
        if ($guide->user_id !== Auth::id()) {
            return $this->messageResponse('Unauthorized', 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'category' => 'nullable|string|max:100',
            'level' => 'nullable|in:beginner,intermediate,advanced',
            'year' => 'nullable|integer|min:1900|max:' . now()->year,
            'file_path' => 'nullable|string|max:500',
            'file_icon' => 'nullable|string|max:50',
            'tags' => 'nullable|array|max:10',
            'tags.*' => 'string|max:50',
            'is_public' => 'boolean',
        ]);

        $guide->update($validated);

        return $this->apiResponse($guide, 'Guide updated successfully');
    }

    /**
     * Delete a guide
     */
    public function destroy(Guide $guide)
    {
        if ($guide->user_id !== Auth::id()) {
            return $this->messageResponse('Unauthorized', 403);
        }

        $guide->delete();

        return $this->messageResponse('Guide deleted successfully');
    }

    /**
     * Download a guide (increment download count)
     */
    public function download(Guide $guide)
    {
        if (!$guide->is_public && $guide->user_id !== Auth::id()) {
            return $this->messageResponse('Unauthorized', 403);
        }

        $guide->incrementDownloads();

        if (!$guide->file_path || !\Illuminate\Support\Facades\Storage::exists($guide->file_path)) {
            return $this->messageResponse('File not found', 404);
        }

        return \Illuminate\Support\Facades\Storage::download($guide->file_path);
    }
}
