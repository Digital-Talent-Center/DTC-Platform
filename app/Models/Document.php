<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Document extends Model
{

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'type',
        'category',
        'competition',
        'level',
        'year',
        'file_path',
        'file_icon',
        'tags',
        'views_count',
        'downloads_count',
        'is_public',
    ];

    protected $casts = [
        'year' => 'integer',
        'views_count' => 'integer',
        'downloads_count' => 'integer',
        'is_public' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that uploaded this document
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all tags for this document
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'document_tag');
    }

    /**
     * Scope: Get public documents
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope: Filter by category
     */
    public function scopeCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope: Filter by type
     */
    public function scopeType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope: Filter by competition
     */
    public function scopeCompetition($query, $competition)
    {
        return $query->where('competition', $competition);
    }

    /**
     * Scope: Filter by level
     */
    public function scopeLevel($query, $level)
    {
        return $query->where('level', $level);
    }

    /**
     * Scope: Filter by year
     */
    public function scopeYear($query, $year)
    {
        return $query->where('year', $year);
    }

    /**
     * Increment view count
     */
    public function incrementViews()
    {
        $this->increment('views_count');
    }

    /**
     * Increment download count
     */
    public function incrementDownloads()
    {
        $this->increment('downloads_count');
    }
}
