<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Tag extends Model
{

    protected $fillable = [
        'name',
        'slug',
    ];

    /**
     * Get all documents with this tag
     */
    public function documents(): BelongsToMany
    {
        return $this->belongsToMany(Document::class, 'document_tag');
    }

    /**
     * Generate slug from name
     */
    public static function generateSlug($name)
    {
        return Str::slug($name);
    }

    /**
     * Boot method to auto-generate slug
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($tag) {
            if (!$tag->slug) {
                $tag->slug = static::generateSlug($tag->name);
            }
        });
    }
}
