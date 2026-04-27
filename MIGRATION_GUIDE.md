# Database Migration Guide - Mock Data to PostgreSQL

> Complete step-by-step guide for migrating from mock data to permanent PostgreSQL database

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Migration](#step-by-step-migration)
4. [Frontend Integration](#frontend-integration)
5. [Testing & Verification](#testing--verification)
6. [Troubleshooting](#troubleshooting)

---

## Overview

The DTC Platform is transitioning from:
- **Current State:** Mock data hardcoded in React components + localStorage
- **Target State:** PostgreSQL database with REST API

### What Changes

| Aspect | Before | After |
|--------|--------|-------|
| **Data Storage** | React useState + local arrays | PostgreSQL database |
| **Data Persistence** | Session only (lost on refresh) | Permanent |
| **Access Method** | Direct component state | REST API endpoints |
| **Backend** | User authentication only | Full CRUD operations |
| **Frontend** | No API calls | Fetch calls to `/api/*` |

---

## Prerequisites

### Backend Setup

1. **PostgreSQL Installation**
   ```bash
   # Windows: Download from https://www.postgresql.org/download/windows/
   # Or use: choco install postgresql
   
   # Linux:
   sudo apt-get install postgresql postgresql-contrib
   
   # macOS:
   brew install postgresql
   ```

2. **Environment Configuration**
   Edit `.env` file:
   ```bash
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=dtc_platform
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   ```

3. **Create Database**
   ```bash
   # Create database
   createdb dtc_platform
   
   # Or use psql:
   psql -U postgres
   CREATE DATABASE dtc_platform;
   \q
   ```

4. **Install Dependencies**
   ```bash
   cd "d:\Semester 6\ABP\TUBES FIX\DTC-Platform"
   composer install
   php artisan key:generate
   ```

---

## Step-by-Step Migration

### Phase 1: Database Setup

#### Step 1: Run Migrations
```bash
# Create all tables
php artisan migrate

# Verify tables were created
php artisan tinker
>>> \DB::table('users')->count();
>>> \DB::table('posts')->count();
```

#### Step 2: Seed Demo Data (Optional)
Create a seeder to populate with demo data:

```bash
php artisan make:seeder DemoDataSeeder
```

Edit `database/seeders/DemoDataSeeder.php`:

```php
<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\ProfileExtension;
use App\Models\Post;
use App\Models\Achievement;
use App\Models\Activity;
use App\Models\Notification;
use App\Models\Document;
use App\Models\Tag;
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        // Create a demo user
        $user = User::create([
            'name' => 'Demo User',
            'email' => 'demo@example.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);

        // Create profile extension
        ProfileExtension::create([
            'user_id' => $user->id,
            'nim' => '2024001',
            'faculty' => 'Faculty of Computer Science',
            'major' => 'Computer Science',
            'phone' => '+62812345678',
            'about' => 'Demo user for testing',
            'role' => 'student',
        ]);

        // Create demo posts
        $post = Post::create([
            'user_id' => $user->id,
            'content' => 'Hello, this is my first post!',
            'caption' => 'First Post',
            'tag' => 'introduction',
        ]);

        // Create demo achievements
        Achievement::create([
            'user_id' => $user->id,
            'title' => 'First Achievement',
            'category' => 'competition',
            'status' => 'approved',
            'year' => 2024,
        ]);

        // Create demo documents
        $document = Document::create([
            'user_id' => $user->id,
            'title' => 'Programming Guide',
            'type' => 'guide',
            'category' => 'co-guide',
            'level' => 'beginner',
            'year' => 2024,
            'is_public' => true,
        ]);

        // Attach tags
        $tags = [];
        foreach (['programming', 'tutorial', 'beginner'] as $tagName) {
            $tags[] = Tag::firstOrCreate(
                ['slug' => \Illuminate\Support\Str::slug($tagName)],
                ['name' => $tagName]
            )->id;
        }
        $document->tags()->attach($tags);
    }
}
```

Run seeder:
```bash
php artisan db:seed --class=DemoDataSeeder
```

---

### Phase 2: Frontend Updates

#### Step 1: Remove Mock Data from Components

**Before (Existing code):**
```typescript
// resources/js/pages/dashboard.tsx
const [posts, setPosts] = useState<any[]>([
    {
        id: 1,
        user: { name: 'John Doe', avatar: '...' },
        content: 'Hello',
        // ... more mock data
    }
]);
```

**After:**
```typescript
// resources/js/pages/dashboard.tsx
const [posts, setPosts] = useState<Post[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
    fetchPosts();
}, []);

const fetchPosts = async () => {
    try {
        setLoading(true);
        const response = await fetch('/api/posts');
        const data = await response.json();
        setPosts(data.data);
    } catch (error) {
        console.error('Failed to fetch posts:', error);
    } finally {
        setLoading(false);
    }
};
```

#### Step 2: Create API Service Layer

Create `resources/js/services/api.ts`:

```typescript
const API_BASE = '/api';

export const api = {
  // Posts
  posts: {
    list: () => fetch(`${API_BASE}/posts`).then(r => r.json()),
    get: (id: string) => fetch(`${API_BASE}/posts/${id}`).then(r => r.json()),
    create: (data: any) => 
      fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => r.json()),
    update: (id: string, data: any) =>
      fetch(`${API_BASE}/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => r.json()),
    delete: (id: string) =>
      fetch(`${API_BASE}/posts/${id}`, { method: 'DELETE' }),
    like: (id: string) =>
      fetch(`${API_BASE}/posts/${id}/like`, { method: 'POST' }).then(r => r.json()),
  },

  // Comments
  comments: {
    list: (postId: string) => 
      fetch(`${API_BASE}/posts/${postId}/comments`).then(r => r.json()),
    create: (postId: string, data: any) =>
      fetch(`${API_BASE}/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => r.json()),
    delete: (postId: string, commentId: string) =>
      fetch(`${API_BASE}/posts/${postId}/comments/${commentId}`, 
        { method: 'DELETE' }),
    like: (postId: string, commentId: string) =>
      fetch(`${API_BASE}/posts/${postId}/comments/${commentId}/like`, 
        { method: 'POST' }).then(r => r.json()),
  },

  // Achievements
  achievements: {
    list: () => fetch(`${API_BASE}/achievements`).then(r => r.json()),
    create: (data: any) =>
      fetch(`${API_BASE}/achievements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => r.json()),
  },

  // Activities
  activities: {
    list: () => fetch(`${API_BASE}/activities`).then(r => r.json()),
  },

  // Notifications
  notifications: {
    list: () => fetch(`${API_BASE}/notifications`).then(r => r.json()),
    markAsRead: (id: string) =>
      fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT' }),
    markAllAsRead: () =>
      fetch(`${API_BASE}/notifications/mark-all-read`, { method: 'PUT' }),
  },

  // Documents
  documents: {
    list: (filters?: any) => {
      const params = new URLSearchParams(filters).toString();
      return fetch(`${API_BASE}/documents?${params}`).then(r => r.json());
    },
    get: (id: string) => fetch(`${API_BASE}/documents/${id}`).then(r => r.json()),
    create: (data: any) =>
      fetch(`${API_BASE}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => r.json()),
  },

  // Profile
  profile: {
    get: () => fetch(`${API_BASE}/profile`).then(r => r.json()),
    update: (data: any) =>
      fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => r.json()),
  },
};
```

#### Step 3: Update Components

**Timeline/Dashboard Component:**
```typescript
// resources/js/pages/Timeline/Index.tsx
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { Post } from '@/types';

export default function Timeline() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const result = await api.posts.list();
      setPosts(result.data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (content: string) => {
    try {
      const result = await api.posts.create({ content });
      setPosts([result.data, ...posts]);
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} onUpdate={loadPosts} />
      ))}
    </div>
  );
}
```

#### Step 4: Enable API Authentication

Add to `config/sanctum.php`:
```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,127.0.0.1:3000,'.env('APP_URL'),
    Str::after(env('APP_URL'), '://'),
))),
```

Update `.env`:
```bash
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
```

---

### Phase 3: Environment & Testing

#### Step 1: Configure Environment

```bash
# Terminal
cd "d:\Semester 6\ABP\TUBES FIX\DTC-Platform"

# Install backend dependencies
composer install

# Generate app key
php artisan key:generate

# Install frontend dependencies
npm install

# Build frontend assets
npm run build
```

#### Step 2: Start Development Server

```bash
# Terminal 1: Laravel Server
php artisan serve

# Terminal 2: Vite (Hot Module Reload)
npm run dev
```

---

## Frontend Integration

### Import Types

Update `resources/js/types/index.ts` to include new types:

```typescript
export interface Post {
  id: string;
  userId: string;
  user: User;
  content: string;
  imageUrl?: string;
  caption?: string;
  tag?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: User;
  content: string;
  likesCount: number;
  createdAt: string;
}

export interface Achievement {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  badgeIcon?: string;
  year?: number;
}

// ... other types
```

### Key Differences (camelCase vs snake_case)

The backend uses snake_case in the database, but Laravel's Eloquent ORM automatically converts to camelCase in JSON responses.

**Backend Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "likes_count": 5
}
```

**Frontend Receives (via automatic transformation):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "likesCount": 5
}
```

---

## Testing & Verification

### Manual API Testing

Use Postman or Insomnia:

```
GET /api/posts
Authorization: Bearer {token}

POST /api/posts
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Hello world",
  "tag": "greeting"
}
```

### Database Verification

```bash
# Connect to database
psql -U postgres -d dtc_platform

# View tables
\dt

# Check data
SELECT COUNT(*) FROM posts;
SELECT * FROM users;
SELECT * FROM posts LIMIT 1;
```

### Frontend Testing Checklist

- [ ] Posts load on dashboard
- [ ] Can create new post
- [ ] Can like/unlike post
- [ ] Can add comment
- [ ] Can view achievements
- [ ] Can filter documents
- [ ] Notifications appear
- [ ] Profile page shows data
- [ ] User can edit profile

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Error
```
Error: SQLSTATE[08006] could not connect to server
```
**Solution:**
- Verify PostgreSQL is running
- Check `.env` database credentials
- Ensure database exists: `createdb dtc_platform`

#### 2. CORS Errors
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Add to `config/cors.php`:
```php
'allowed_origins' => ['http://localhost:3000', 'http://localhost:8000'],
```

#### 3. 401 Unauthorized on API Requests
```
Error: 401 Unauthorized
```
**Solution:**
- Ensure user is authenticated
- Check authentication middleware
- Verify Sanctum tokens

#### 4. Migration Errors
```
Error: Table already exists
```
**Solution:**
```bash
# Rollback and retry
php artisan migrate:rollback
php artisan migrate
```

#### 5. Missing API Response
**Solution:**
```bash
# Check route exists
php artisan route:list

# Verify controller method
grep -r "public function index" app/Http/Controllers/
```

---

## Performance Optimization

### Eager Loading

```typescript
// Bad: N+1 query problem
posts.map(post => post.user.name); // Extra query per post

// Good: Eager loading
// Laravel handles this with: Post::with('user')->get()
```

### Pagination

```typescript
const response = await fetch('/api/posts?page=1&per_page=10');
const { data, pagination } = await response.json();
// { current_page, per_page, total, last_page }
```

### Caching

```typescript
// Cache posts for 5 minutes
const cacheKey = 'posts_' + new Date().getTime() / 1000 / 300;
const cachedPosts = localStorage.getItem(cacheKey);
```

---

## Rollback Plan

If you need to revert to mock data:

```bash
# Don't delete the code, just comment out API calls
// const response = await api.posts.list();
// Use mock data instead:
const mockPosts = [...];
setPosts(mockPosts);
```

---

## Next Steps

1. ✅ Run migrations to create database schema
2. ✅ Update frontend components to use API
3. ✅ Test all CRUD operations
4. ✅ Set up error handling and loading states
5. ✅ Optimize queries with pagination
6. ✅ Add real-time features (WebSockets) if needed
7. ✅ Deploy to production

---

## Support

For issues, check:
- Laravel logs: `storage/logs/laravel.log`
- Browser console: `F12 > Console`
- Network tab: `F12 > Network` to view API requests
- Database: `psql -d dtc_platform` to query directly

