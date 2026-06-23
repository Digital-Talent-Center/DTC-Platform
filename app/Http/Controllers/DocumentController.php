<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DocumentController extends Controller
{
    use ApiResponseHelper;

    /**
     * Admin: render Co-Library management page (Inertia)
     */
    public function adminIndex()
    {
        $documents = Document::with('tags')->latest()->paginate(24);

        $mapped = $documents->getCollection()->map(function ($document) {
            return [
                'id'              => $document->id,
                'title'           => $document->title,
                'description'     => $document->description,
                'type'            => $document->type,
                'category'        => $document->category,
                'competition'     => $document->competition,
                'level'           => $document->level,
                'year'            => $document->year,
                'file_path'       => $document->file_path,
                'tags'            => $document->relationLoaded('tags')
                    ? $document->getRelation('tags')->pluck('name')->all()
                    : [],
                'views_count'     => $document->views_count,
                'downloads_count' => $document->downloads_count,
                'created_at'      => $document->created_at?->toISOString(),
            ];
        });

        return Inertia::render('admin/CoLibrary-Management', [
            'initialDocuments' => $mapped,
            'total'            => $documents->total(),
        ]);
    }

    /**
     * Admin: store a new document with PDF upload (Inertia)
     */
    public function adminStore(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'type'        => 'nullable|string|max:100',
            'category'    => 'required|in:Belmawa,Mandiri',
            'competition' => 'nullable|string|max:100',
            'level'       => 'nullable|in:Universitas,Regional,Nasional,Internasional',
            'year'        => 'nullable|integer|min:1900|max:' . now()->year,
            'tags'        => 'nullable|string|max:255',
            'file'        => 'required|file|mimes:pdf|max:10240',
        ]);

        $path = $request->file('file')->store('documents', 'public');

        $document = Document::create([
            'user_id'     => Auth::id(),
            'title'       => $validated['title'],
            'description' => $validated['description'] ?? null,
            'type'        => $validated['type'] ?? 'resource',
            'category'    => $validated['category'],
            'competition' => $validated['competition'] ?? null,
            'level'       => $validated['level'] ?? null,
            'year'        => $validated['year'] ?? null,
            'file_path'   => Storage::url($path),
            'file_icon'   => 'pdf',
            'is_public'   => true,
        ]);

        // Attach tags (comma-separated)
        $tagNames = collect(explode(',', $request->input('tags', '')))
            ->map(fn ($t) => trim($t))
            ->filter();

        if ($tagNames->isNotEmpty()) {
            $tagIds = $tagNames->map(function ($tagName) {
                return Tag::firstOrCreate(
                    ['slug' => \Illuminate\Support\Str::slug($tagName)],
                    ['name' => $tagName]
                )->id;
            })->all();
            $document->tags()->attach($tagIds);
        }

        return back();
    }

    /**
     * Admin: delete a document and its uploaded file (Inertia)
     */
    public function adminDestroy(Document $document): \Illuminate\Http\RedirectResponse
    {
        if ($document->file_path) {
            $internalPath = parse_url($document->file_path, PHP_URL_PATH) ?? $document->file_path;
            if (str_starts_with($internalPath, '/storage/')) {
                Storage::disk('public')->delete(substr($internalPath, 9));
            }
        }

        $document->delete();

        return back();
    }

    /**
     * Get all documents with filtering
     */
    public function index(Request $request)
    {
        $documents = Document::with('user', 'tags')
            ->where('is_public', true)
            ->when($request->category, function ($query) use ($request) {
                $query->category($request->category);
            })
            ->when($request->type, function ($query) use ($request) {
                $query->type($request->type);
            })
            ->when($request->competition, function ($query) use ($request) {
                $query->competition($request->competition);
            })
            ->when($request->level, function ($query) use ($request) {
                $query->level($request->level);
            })
            ->when($request->year, function ($query) use ($request) {
                $query->year($request->year);
            })
            ->when($request->search, function ($query) use ($request) {
                $query->where('title', 'ilike', '%' . $request->search . '%')
                    ->orWhere('description', 'ilike', '%' . $request->search . '%');
            })
            ->orderByDesc('created_at')
            ->paginate(12);

        return $this->paginatedResponse($documents);
    }

    /**
     * Get user's documents
     */
    public function myDocuments(Request $request)
    {
        $user = Auth::user();

        $documents = $user->documents()
            ->with('tags')
            ->when($request->category, function ($query) use ($request) {
                $query->category($request->category);
            })
            ->orderByDesc('created_at')
            ->paginate(12);

        return $this->paginatedResponse($documents);
    }

    /**
     * Get document by ID
     */
    public function show(Document $document)
    {
        // Allow public documents or own documents
        if (!$document->is_public && $document->user_id !== Auth::id()) {
            return $this->messageResponse('Unauthorized', 403);
        }

        $document->increment('views_count');
        $document->load('user', 'tags');

        return $this->apiResponse($document);
    }

    /**
     * Create new document
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255|min:1',
            'description' => 'nullable|string|max:5000',
            'type' => 'required|string|max:100|min:1',
            'category' => 'required|string|max:100|min:1',
            'competition' => 'nullable|string|max:100',
            'level' => 'nullable|in:beginner,intermediate,advanced',
            'year' => 'nullable|integer|min:1900|max:' . now()->year,
            'file_path' => 'nullable|string|max:500',
            'file_icon' => 'nullable|string|max:50',
            'tags' => 'nullable|array|max:10',
            'tags.*' => 'string|max:50|min:1',
            'is_public' => 'boolean',
        ]);

        $document = Document::create([
            'user_id' => Auth::id(),
            ...$validated,
        ]);

        // Attach tags
        if (!empty($validated['tags'])) {
            $tagIds = [];
            foreach ($validated['tags'] as $tagName) {
                $tag = Tag::firstOrCreate(
                    ['slug' => \Illuminate\Support\Str::slug($tagName)],
                    ['name' => $tagName]
                );
                $tagIds[] = $tag->id;
            }
            $document->tags()->attach($tagIds);
        }

        return $this->apiResponse($document->load('tags'), 'Document created successfully', 201);
    }

    /**
     * Update document
     */
    public function update(Request $request, Document $document)
    {
        if ($document->user_id !== Auth::id()) {
            return $this->messageResponse('Unauthorized', 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|required|string|max:100',
            'category' => 'sometimes|required|string|max:100',
            'competition' => 'nullable|string|max:100',
            'level' => 'nullable|in:beginner,intermediate,advanced',
            'year' => 'nullable|integer|min:1900|max:' . now()->year,
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'is_public' => 'boolean',
        ]);

        $document->update($validated);

        // Update tags
        if (isset($validated['tags'])) {
            $tagIds = [];
            foreach ($validated['tags'] as $tagName) {
                $tag = Tag::firstOrCreate(
                    ['slug' => \Illuminate\Support\Str::slug($tagName)],
                    ['name' => $tagName]
                );
                $tagIds[] = $tag->id;
            }
            $document->tags()->sync($tagIds);
        }

        return $this->apiResponse($document->load('tags'), 'Document updated successfully');
    }

    /**
     * Delete document
     */
    public function destroy(Document $document)
    {
        if ($document->user_id !== Auth::id()) {
            return $this->messageResponse('Unauthorized', 403);
        }

        // Delete file if it exists
        if ($document->file_path) {
            $internalPath = parse_url($document->file_path, PHP_URL_PATH) ?? $document->file_path;
            if (str_starts_with($internalPath, '/storage/')) {
                Storage::disk('public')->delete(substr($internalPath, 9));
            }
        }

        $document->delete();

        return $this->messageResponse('Document deleted successfully');
    }

    /**
     * Download document
     */
    public function download(Document $document)
    {
        // Allow public documents or own documents
        if (!$document->is_public && $document->user_id !== Auth::id()) {
            return $this->messageResponse('Unauthorized', 403);
        }

        $internalPath = null;
        if ($document->file_path) {
            $path = parse_url($document->file_path, PHP_URL_PATH) ?? $document->file_path;
            $internalPath = str_starts_with($path, '/storage/') ? substr($path, 9) : $path;
        }

        if (!$internalPath || !Storage::disk('public')->exists($internalPath)) {
            return $this->messageResponse('File not found', 404);
        }

        $document->increment('downloads_count');

        return Storage::disk('public')->download($internalPath);
    }

    /**
     * Get filters options (competitions, levels, types, etc)
     * Fix #7: Wrapped in 'data' key to match FE ApiResponse<FilterOptions>
     */
    public function filterOptions()
    {
        return response()->json([
            'data' => [
                'competitions' => Document::distinct()->pluck('competition')->filter()->values(),
                'levels' => ['beginner', 'intermediate', 'advanced'],
                'types' => Document::distinct()->pluck('type')->filter()->values(),
                'categories' => Document::distinct()->pluck('category')->filter()->values(),
            ],
        ]);
    }
}
