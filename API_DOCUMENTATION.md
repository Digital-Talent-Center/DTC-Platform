# API Documentation - DTC Platform

> Complete REST API reference for DTC Platform

## Base URL

```
http://localhost:8000/api
```

## Authentication

All endpoints require authentication via Laravel Sanctum. Include the authentication token in request headers:

```
Authorization: Bearer {token}
```

## Response Format

All responses are JSON formatted:

```json
{
  "data": { /* resource data */ },
  "message": "Success message (optional)",
  "pagination": { /* pagination info if applicable */ }
}
```

---

## Posts API

### List Posts

```http
GET /api/posts?page=1&per_page=10
```

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `per_page` (int): Items per page (default: 10)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "content": "Post content",
      "imageUrl": "https://...",
      "caption": "Image caption",
      "tag": "tag-name",
      "likesCount": 5,
      "commentsCount": 2,
      "createdAt": "2026-04-27T10:00:00Z",
      "updatedAt": "2026-04-27T10:00:00Z",
      "user": { /* User object */ }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "perPage": 10,
    "total": 50,
    "lastPage": 5
  }
}
```

### Get Single Post

```http
GET /api/posts/{postId}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "content": "Post content",
    "comments": [ /* comments array */ ],
    "likes": [ /* likes array */ ]
  }
}
```

### Create Post

```http
POST /api/posts
Content-Type: application/json

{
  "content": "This is my post content",
  "imageUrl": "https://example.com/image.jpg",
  "caption": "Image caption",
  "tag": "my-tag"
}
```

**Required Fields:**
- `content` (string): Post message (min: 1, max: 5000)

**Optional Fields:**
- `imageUrl` (string): Image URL
- `caption` (string): Image caption (max: 500)
- `tag` (string): Topic tag (max: 100)

**Response:** Returns created post object with 201 status

### Update Post

```http
PUT /api/posts/{postId}
Content-Type: application/json

{
  "content": "Updated content",
  "caption": "Updated caption",
  "tag": "updated-tag"
}
```

**Requires:** User must be post owner

### Delete Post

```http
DELETE /api/posts/{postId}
```

**Requires:** User must be post owner

### Like/Unlike Post

```http
POST /api/posts/{postId}/like
```

**Response:**
```json
{
  "isLiked": true,
  "likesCount": 6
}
```

---

## Comments API

### List Post Comments

```http
GET /api/posts/{postId}/comments?page=1&per_page=20
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "postId": "uuid",
      "userId": "uuid",
      "content": "Comment text",
      "likesCount": 2,
      "createdAt": "2026-04-27T10:00:00Z",
      "user": { /* User object */ }
    }
  ],
  "pagination": { /* pagination info */ }
}
```

### Create Comment

```http
POST /api/posts/{postId}/comments
Content-Type: application/json

{
  "content": "This is a great post!"
}
```

**Required Fields:**
- `content` (string): Comment text (min: 1, max: 1000)

**Response:** Returns created comment object with 201 status

### Update Comment

```http
PUT /api/posts/{postId}/comments/{commentId}
Content-Type: application/json

{
  "content": "Updated comment"
}
```

**Requires:** User must be comment owner

### Delete Comment

```http
DELETE /api/posts/{postId}/comments/{commentId}
```

**Requires:** User must be comment owner

### Like/Unlike Comment

```http
POST /api/posts/{postId}/comments/{commentId}/like
```

**Response:**
```json
{
  "isLiked": true,
  "likesCount": 3
}
```

---

## Achievements API

### List Achievements

```http
GET /api/achievements?status=approved&category=competition&page=1
```

**Query Parameters:**
- `status` (string): Filter by status (pending, approved, rejected)
- `category` (string): Filter by category
- `page` (int): Page number

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "title": "Achievement Title",
      "description": "Description",
      "category": "competition",
      "status": "approved",
      "badgeIcon": "🏆",
      "year": 2024,
      "createdAt": "2026-04-27T10:00:00Z"
    }
  ],
  "pagination": { /* pagination info */ }
}
```

### Get Achievement

```http
GET /api/achievements/{achievementId}
```

### Create Achievement

```http
POST /api/achievements
Content-Type: application/json

{
  "title": "Competition Winner",
  "description": "Won ICPC 2024",
  "category": "competition",
  "year": 2024,
  "badgeIcon": "🏆"
}
```

**Required Fields:**
- `title` (string): Achievement name (max: 255)
- `category` (string): Category name (max: 100)

**Optional Fields:**
- `description` (string): Description
- `year` (integer): Year (1900 - current year)
- `badgeIcon` (string): Icon/emoji (max: 255)

**Response:** Returns created achievement object with 201 status

### Update Achievement

```http
PUT /api/achievements/{achievementId}
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "approved"
}
```

**Requires:** User must be achievement owner or admin

### Delete Achievement

```http
DELETE /api/achievements/{achievementId}
```

**Requires:** User must be achievement owner or admin

### Get Achievement Statistics

```http
GET /api/achievements/statistics
```

**Response:**
```json
{
  "data": {
    "total": 10,
    "approved": 7,
    "pending": 2,
    "rejected": 1,
    "byCategory": [
      { "category": "competition", "count": 5 },
      { "category": "publication", "count": 2 }
    ]
  }
}
```

---

## Activities API

### List Activities

```http
GET /api/activities?type=login&status=completed&days=30&page=1
```

**Query Parameters:**
- `type` (string): Filter by activity type
- `status` (string): Filter by status (pending, in_progress, completed, cancelled)
- `days` (int): Filter by last N days (default: 30)
- `page` (int): Page number

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "type": "post_created",
      "title": "Created a new post",
      "description": "Posted on timeline",
      "status": "completed",
      "activityDate": "2026-04-27T10:00:00Z",
      "createdAt": "2026-04-27T10:00:00Z"
    }
  ],
  "pagination": { /* pagination info */ }
}
```

### Create Activity

```http
POST /api/activities
Content-Type: application/json

{
  "type": "competition_joined",
  "title": "Joined ICPC 2024",
  "status": "in_progress",
  "activityDate": "2026-04-27T10:00:00Z"
}
```

**Required Fields:**
- `type` (string): Activity type
- `title` (string): Activity title (max: 255)
- `status` (enum): pending, in_progress, completed, cancelled
- `activityDate` (timestamp): When activity occurred

### Update Activity

```http
PUT /api/activities/{activityId}
Content-Type: application/json

{
  "status": "completed"
}
```

### Get Activity Statistics

```http
GET /api/activities/statistics?days=30
```

---

## Notifications API

### List Notifications

```http
GET /api/notifications?category=system&unread=true&page=1
```

**Query Parameters:**
- `category` (string): Filter by category
- `unread` (boolean): Only unread notifications
- `page` (int): Page number

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "category": "social",
      "title": "New Comment",
      "message": "Someone commented on your post",
      "isRead": false,
      "actionUrl": "/posts/123",
      "createdAt": "2026-04-27T10:00:00Z"
    }
  ],
  "pagination": { /* pagination info */ }
}
```

### Get Unread Count

```http
GET /api/notifications/unread-count
```

**Response:**
```json
{
  "count": 5
}
```

### Mark as Read

```http
PUT /api/notifications/{notificationId}/read
```

### Mark as Unread

```http
PUT /api/notifications/{notificationId}/unread
```

### Mark All as Read

```http
PUT /api/notifications/mark-all-read
```

### Delete Notification

```http
DELETE /api/notifications/{notificationId}
```

---

## Documents API

### List Documents

```http
GET /api/documents?category=co-guide&type=pdf&competition=ICPC&level=beginner&year=2024&search=programming&page=1
```

**Query Parameters:**
- `category` (string): Filter by category
- `type` (string): Filter by document type
- `competition` (string): Filter by competition
- `level` (enum): Filter by level (beginner, intermediate, advanced)
- `year` (int): Filter by year
- `search` (string): Search in title/description
- `page` (int): Page number

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "title": "C++ Programming Guide",
      "description": "Complete guide to C++",
      "type": "guide",
      "category": "co-guide",
      "competition": "ICPC",
      "level": "beginner",
      "year": 2024,
      "filePath": "/storage/documents/...",
      "fileIcon": "📄",
      "viewsCount": 150,
      "downloadsCount": 45,
      "isPublic": true,
      "tags": [ { "id": "uuid", "name": "programming" } ],
      "createdAt": "2026-04-27T10:00:00Z"
    }
  ],
  "pagination": { /* pagination info */ }
}
```

### Get User's Documents

```http
GET /api/documents/my-documents?category=co-guide
```

### Get Single Document

```http
GET /api/documents/{documentId}
```

**Note:** Automatically increments view count

### Get Filter Options

```http
GET /api/documents/filter-options
```

**Response:**
```json
{
  "competitions": ["ICPC", "CTF", "Hackathon"],
  "levels": ["beginner", "intermediate", "advanced"],
  "types": ["pdf", "guide", "resource", "template"],
  "categories": ["co-guide", "co-library", "tutorial"]
}
```

### Create Document

```http
POST /api/documents
Content-Type: application/json

{
  "title": "Programming Tutorial",
  "description": "Learn programming basics",
  "type": "guide",
  "category": "co-guide",
  "competition": "General",
  "level": "beginner",
  "year": 2024,
  "filePath": "/storage/documents/tutorial.pdf",
  "fileIcon": "📄",
  "tags": ["programming", "tutorial"],
  "isPublic": true
}
```

**Required Fields:**
- `title` (string): Document title
- `type` (string): Document type
- `category` (string): Category

**Optional Fields:**
- `description` (string): Description
- `competition` (string): Competition name
- `level` (enum): beginner, intermediate, advanced
- `year` (int): Year
- `filePath` (string): File path
- `fileIcon` (string): Icon emoji
- `tags` (array): Tag names
- `isPublic` (boolean): Public/private (default: true)

### Update Document

```http
PUT /api/documents/{documentId}
Content-Type: application/json

{
  "title": "Updated Title",
  "level": "intermediate"
}
```

### Delete Document

```http
DELETE /api/documents/{documentId}
```

### Download Document

```http
POST /api/documents/{documentId}/download
```

**Note:** Automatically increments download count

---

## Profile API

### Get My Profile

```http
GET /api/profile
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "nim": "2024001",
    "faculty": "Faculty of Computer Science",
    "major": "Computer Science",
    "phone": "+62812345678",
    "avatarUrl": "https://...",
    "about": "I love programming",
    "role": "student",
    "socialLinks": {
      "github": "https://github.com/username",
      "linkedin": "https://linkedin.com/in/username",
      "twitter": "https://twitter.com/username",
      "portfolio": "https://example.com"
    },
    "profileCompletedAt": "2026-04-27T10:00:00Z"
  }
}
```

### Get User Profile

```http
GET /api/profile/user/{userId}
```

### Update My Profile

```http
PUT /api/profile
Content-Type: application/json

{
  "nim": "2024001",
  "faculty": "Faculty of Computer Science",
  "major": "Computer Science",
  "phone": "+62812345678",
  "avatarUrl": "https://...",
  "about": "I love programming",
  "role": "student",
  "socialLinks": {
    "github": "https://github.com/username",
    "linkedin": "https://linkedin.com/in/username"
  }
}
```

**Optional Fields:**
- `nim` (string): Student ID (max: 20, unique)
- `faculty` (string): Faculty name
- `major` (string): Major
- `phone` (string): Phone number
- `avatarUrl` (string): Avatar URL
- `about` (string): Bio (max: 1000)
- `role` (string): Role
- `socialLinks` (object): Social media links

### Mark Profile as Complete

```http
PUT /api/profile/mark-complete
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error",
  "errors": {
    "email": ["Email must be unique"],
    "title": ["Title is required"]
  }
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "message": "This action is unauthorized"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 422 Unprocessable Entity
```json
{
  "message": "The given data was invalid",
  "errors": { /* validation errors */ }
}
```

### 500 Server Error
```json
{
  "message": "Server error occurred"
}
```

---

## Rate Limiting

Currently no rate limiting implemented. Consider adding in production:

```php
// app/Http/Middleware/ThrottleRequests.php
Route::middleware('throttle:60,1')->group(function () {
    Route::apiResource('posts', PostController::class);
});
```

---

## HTTP Status Codes

- `200 OK` - Successful GET/PUT/DELETE
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE with no response body
- `400 Bad Request` - Invalid parameters
- `401 Unauthorized` - Missing authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation errors
- `500 Internal Server Error` - Server error

---

## Example cURL Requests

### Create a Post
```bash
curl -X POST http://localhost:8000/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello world!",
    "tag": "greeting"
  }'
```

### List Posts
```bash
curl -X GET "http://localhost:8000/api/posts?page=1&per_page=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Like a Post
```bash
curl -X POST http://localhost:8000/api/posts/{postId}/like \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Additional Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Sanctum Authentication](https://laravel.com/docs/sanctum)
- [RESTful API Best Practices](https://restfulapi.net)

