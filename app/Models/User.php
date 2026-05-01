<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the user's profile extension
     */
    public function profileExtension(): HasOne
    {
        return $this->hasOne(ProfileExtension::class);
    }

    /**
     * Get all posts created by this user
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class)->latest();
    }

    /**
     * Get all comments created by this user
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->latest();
    }

    /**
     * Get all likes created by this user
     */
    public function likes(): HasMany
    {
        return $this->hasMany(Like::class);
    }

    /**
     * Get all achievements for this user
     */
    public function achievements(): HasMany
    {
        return $this->hasMany(Achievement::class)->latest();
    }

    /**
     * Get all activities for this user
     */
    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class)->latest();
    }

    /**
     * Get all custom notifications for this user
     * Named customNotifications to avoid conflict with Notifiable trait's notifications()
     */
    public function customNotifications(): HasMany
    {
        return $this->hasMany(Notification::class)->latest();
    }

    /**
     * Get all documents uploaded by this user
     */
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class)->latest();
    }

    /**
     * Get all guides created by this user
     */
    public function guides(): HasMany
    {
        return $this->hasMany(Guide::class)->latest();
    }

    /**
     * Check if user is an admin
     */
    public function isAdmin(): bool
    {
        $profile = $this->profileExtension;
        return $profile && $profile->role === 'admin';
    }

    /**
     * Helper: Get approved achievements count
     */
    public function approvedAchievementsCount()
    {
        return $this->achievements()->approved()->count();
    }

    /**
     * Helper: Get unread notifications count
     */
    public function unreadNotificationsCount()
    {
        return $this->customNotifications()->unread()->count();
    }
}
