<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\ProfileExtension;
use App\Models\Post;
use App\Models\Achievement;
use App\Models\Activity;
use App\Models\Report;
use App\Models\Notification;
use App\Models\Document;
use App\Models\Tag;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create a demo user
        $user = User::create([
            'name' => 'Akun Demo',
            'email' => 'demo@example.com',
            'password' => bcrypt('ipalGemink123'),
            'email_verified_at' => now(),
            'role' => 'student',
        ]);

        // Create an admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('admin1234'),
            'email_verified_at' => now(),
            'role' => 'admin',
        ]);

        // Create profile extension
        ProfileExtension::create([
            'user_id' => $user->id,
            'nim' => '2024001',
            'faculty' => 'Faculty of Computer Science',
            'major' => 'Computer Science',
            'phone' => '+62812345678',
            'about' => 'Demo user for testing the DTC Platform',
            'role' => 'student',
        ]);

        // Create demo posts
        $post = Post::create([
            'user_id' => $user->id,
            'content' => 'Hello, this is my first post on DTC Platform! Excited to join this community. 🚀',
            'caption' => 'First Post',
            'tag' => 'introduction',
        ]);

        Post::create([
            'user_id' => $user->id,
            'content' => 'Just completed my first programming challenge! The experience was incredible and I learned a lot about algorithms.',
            'caption' => 'Programming Challenge',
            'tag' => 'achievement',
        ]);

        // Create demo achievements
        Achievement::create([
            'user_id' => $user->id,
            'title' => 'First Place Programming Competition',
            'description' => 'Won first place in the regional programming competition 2024',
            'category' => 'competition',
            'status' => 'approved',
            'year' => 2024,
        ]);

        Achievement::create([
            'user_id' => $user->id,
            'title' => 'Web Development Certificate',
            'description' => 'Completed advanced web development certification',
            'category' => 'certification',
            'status' => 'approved',
            'year' => 2024,
        ]);

        Achievement::create([
            'user_id' => $user->id,
            'title' => 'Research Paper Publication',
            'description' => 'Published research paper on machine learning',
            'category' => 'publication',
            'status' => 'pending',
            'year' => 2025,
        ]);

        // Create demo activities
        Activity::create([
            'user_id' => $user->id,
            'type' => 'competition',
            'title' => 'ICPC Regional',
            'description' => 'Participating in ICPC Regional Competition',
            'status' => 'completed',
            'activity_date' => now()->subDays(5),
        ]);

        Activity::create([
            'user_id' => $user->id,
            'type' => 'workshop',
            'title' => 'AI Workshop',
            'description' => 'Attending AI/ML workshop',
            'status' => 'in_progress',
            'activity_date' => now(),
        ]);

        // Create demo report
        Report::create([
            'post_id'     => $post->id,
            'user_id'     => $user->id,
            'reason'      => 'inappropriate_content',
            'description' => 'Postingan ini diduga mengandung konten yang tidak pantas dan perlu ditinjau oleh admin.',
            'status'      => 'pending',
        ]);

        // Create demo notifications
        Notification::create([
            'user_id' => $user->id,
            'category' => 'achievement',
            'title' => 'Achievement Approved',
            'message' => 'Your achievement "First Place Programming Competition" has been approved!',
            'is_read' => false,
        ]);

        Notification::create([
            'user_id' => $user->id,
            'category' => 'system',
            'title' => 'Welcome to DTC Platform',
            'message' => 'Welcome to Digital Talent Centre! Start by completing your profile.',
            'is_read' => true,
        ]);

        // Create demo documents
        $document = Document::create([
            'user_id' => $user->id,
            'title' => 'Programming Guide for Beginners',
            'description' => 'A comprehensive guide to get started with programming competitions.',
            'type' => 'guide',
            'category' => 'co-guide',
            'level' => 'beginner',
            'year' => 2024,
            'is_public' => true,
        ]);

        Document::create([
            'user_id' => $user->id,
            'title' => 'Algorithm Reference Sheet',
            'description' => 'Quick reference for common algorithms and data structures.',
            'type' => 'resource',
            'category' => 'co-library',
            'level' => 'intermediate',
            'year' => 2024,
            'is_public' => true,
        ]);

        // Attach tags
        $tags = [];
        foreach (['programming', 'tutorial', 'beginner', 'algorithms'] as $tagName) {
            $tags[] = Tag::firstOrCreate(
                ['slug' => \Illuminate\Support\Str::slug($tagName)],
                ['name' => $tagName]
            )->id;
        }
        $document->tags()->attach($tags);
    }
}