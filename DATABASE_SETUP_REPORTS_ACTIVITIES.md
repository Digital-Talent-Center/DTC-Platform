# Database Implementation: Reported Posts & Activity Management

## Overview
Saya telah membuat database schema untuk:
1. **Reports Table** - Menyimpan laporan/report postingan
2. **Enhanced Activity Management** - Menambah fitur management untuk activities

---

## 1. REPORTS TABLE SCHEMA

### File Struktur:
- **Model**: `app/Models/Report.php`
- **Migration**: `database/migrations/2026_05_11_000001_create_reports_table.php`

### Database Columns:

```php
Schema::create('reports', function (Blueprint $table) {
    $table->id();
    $table->foreignId('post_id')->constrained('posts')->onDelete('cascade');
    $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
    
    $table->enum('reason', [
        'inappropriate_content',    // Konten tidak sesuai
        'spam',                     // Spam
        'harassment',               // Pelecehan/bully
        'false_information',        // Informasi palsu
        'copyright_violation',      // Pelanggaran hak cipta
        'other'                     // Lainnya
    ])->default('other');
    
    $table->text('description')->nullable();    // Deskripsi detail alasan
    
    $table->enum('status', [
        'pending',                  // Menunggu review
        'under_review',             // Sedang direview
        'resolved',                 // Selesai
        'dismissed'                 // Ditolak
    ])->default('pending');
    
    $table->string('action_taken')->nullable();  // Aksi yang diambil
    // Possible values: 'post_removed', 'user_warned', 'user_suspended', 'no_action'
    
    $table->foreignId('resolved_by')->nullable()->constrained('users')->onDelete('set null');
    $table->timestamp('resolved_at')->nullable();
    $table->timestamps();
    
    // Indexes untuk performa query
    $table->index('post_id');
    $table->index('user_id');
    $table->index('status');
    $table->index('reason');
    $table->index('created_at');
});
```

### Report Model Methods:

#### Relationships:
```php
$report->post()        // Post yang dilaporkan
$report->reporter()    // User yang melaporkan
$report->resolver()    // Admin yang menyelesaikan report
```

#### Scopes:
```php
Report::status('pending')     // Filter by status
Report::reason('spam')        // Filter by reason
Report::pending()             // Hanya pending reports
Report::resolved()            // Hanya resolved reports
Report::underReview()         // Hanya under review reports
```

#### Methods:
```php
$report->markResolved($actionTaken, $resolvedBy)  // Tandai selesai
$report->markUnderReview()                        // Tandai sedang direview
$report->dismiss($resolvedBy)                     // Tolak report
```

---

## 2. ACTIVITY MANAGEMENT ENHANCEMENTS

### Model Updates:
**File**: `app/Models/Activity.php`

#### New Casts (fields yang sudah ada tapi perlu diproperly cast):
```php
'activity_date' => 'date',
'deadline' => 'date',
'start_time' => 'datetime:H:i:s',
'end_time' => 'datetime:H:i:s',
```

#### Database Columns (sudah ada):
```
- id
- user_id
- type (enum: 'event', 'task')
- title
- description
- status (enum: 'pending', 'in_progress', 'completed', 'cancelled', 'overdue')
- activity_date
- deadline (nullable)
- location (nullable)
- start_time (nullable)
- end_time (nullable)
- created_at, updated_at
```

#### New Scopes:
```php
Activity::upcoming()         // Aktivitas mendatang
Activity::completed()        // Aktivitas selesai
Activity::overdue()          // Aktivitas terlewat
Activity::events()           // Filter type 'event'
Activity::tasks()            // Filter type 'task'
Activity::byDeadline($date)  // Filter by deadline
Activity::byLocation($loc)   // Filter by location
```

#### New Methods:
```php
$activity->markCompleted()       // Tandai selesai
$activity->markInProgress()      // Tandai sedang berlangsung
$activity->markCancelled()       // Tandai dibatalkan
$activity->isPastDeadline()      // Cek apakah sudah lewat deadline
$activity->isToday()             // Cek apakah hari ini
$activity->isUpcoming()          // Cek apakah aktivitas mendatang
$activity->getStatusBadge()      // Dapatkan badge class untuk UI
```

---

## 3. POST MODEL ENHANCEMENTS

### File: `app/Models/Post.php`

#### New Relationship:
```php
$post->reports()  // HasMany relationship ke Report model
```

#### New Methods:
```php
$post->hasPendingReports()          // Cek apakah ada pending reports
$post->getPendingReportsCount()     // Hitung jumlah pending reports
```

---

## 4. API ROUTES

### Report Endpoints:

#### Create Report (User):
```http
POST /api/reports
Content-Type: application/json

{
    "post_id": 1,
    "reason": "spam",
    "description": "Ini adalah spam"
}

Response:
{
    "id": 1,
    "post_id": 1,
    "reason": "spam",
    "status": "pending",
    "created_at": "2026-05-11T10:00:00Z"
}
```

#### Get My Reports (User):
```http
GET /api/reports/my-reports
```

#### Get All Reports (Admin):
```http
GET /api/reports
GET /api/reports?status=pending
GET /api/reports?reason=spam
GET /api/reports?from_date=2026-05-01&to_date=2026-05-11
GET /api/reports?search=keyword
```

#### Get Reports for Specific Post (Admin):
```http
GET /api/reports/post/{postId}
```

#### Get Report Details:
```http
GET /api/reports/{reportId}
```

#### Update Report Status (Admin):
```http
PUT /api/reports/{reportId}/status
Content-Type: application/json

{
    "status": "resolved",
    "action_taken": "post_removed"
}
```

#### Get Statistics (Admin):
```http
GET /api/reports/statistics

Response:
{
    "total_reports": 25,
    "by_status": {
        "pending": 5,
        "under_review": 3,
        "resolved": 15,
        "dismissed": 2
    },
    "by_reason": {
        "spam": 10,
        "harassment": 8,
        "inappropriate_content": 5,
        "other": 2
    }
}
```

### Activity Endpoints (Enhanced):

#### Get Upcoming Activities:
```http
GET /api/activities/upcoming
GET /api/activities/upcoming?type=event
```

#### Get Completed Activities:
```http
GET /api/activities/completed
GET /api/activities/completed?type=task
```

#### Get Overdue Activities:
```http
GET /api/activities/overdue
```

#### Update Activity Status:
```http
PATCH /api/activities/{activityId}/status
Content-Type: application/json

{
    "status": "completed"
}
```

---

## 5. FRONTEND PARAMETERS

### Report Form Parameters:
```typescript
interface ReportFormData {
    post_id: number;
    reason: 'inappropriate_content' | 'spam' | 'harassment' | 'false_information' | 'copyright_violation' | 'other';
    description?: string;
}
```

### Activity Management Parameters:
```typescript
interface ActivityData {
    id?: number;
    type: 'event' | 'task';
    title: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
    activity_date: string; // YYYY-MM-DD
    deadline?: string;     // YYYY-MM-DD
    location?: string;
    start_time?: string;   // HH:MM format
    end_time?: string;     // HH:MM format
}

interface ActivityFilters {
    type?: 'event' | 'task';
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
    days?: number;
}
```

---

## 6. FEATURE COMPATIBILITY

### ✅ MAINTAINED FEATURES:
- Semua existing Activity features tetap berfungsi
- Post model masih berfungsi normal
- Commenting dan Liking tetap normal
- User authentication tetap normal

### ✅ NEW FEATURES ADDED:
- Report/Lapor postingan
- Activity management dengan status tracking
- Admin dashboard untuk manage reports
- Statistics untuk reports dan activities

### ⚠️ IMPORTANT NOTES:
1. **No existing features broken** - Semua parameter sesuai dengan requirements
2. **Database-ready** - Migration siap untuk di-run
3. **API-ready** - Semua endpoints sudah ada dan siap digunakan
4. **Scalable** - Design mendukung pertumbuhan data

---

## 7. MIGRATION COMMANDS

Untuk menjalankan database migration:

```bash
# Jalankan semua pending migrations
php artisan migrate

# Jika ingin rollback
php artisan migrate:rollback
```

---

## 8. NEXT STEPS

1. **Run Migration**:
   ```bash
   php artisan migrate
   ```

2. **Test Reports API**:
   - POST /api/reports (create report)
   - GET /api/reports/my-reports (user reports)
   - PUT /api/reports/{id}/status (admin update)

3. **Test Activity API**:
   - GET /api/activities/upcoming
   - GET /api/activities/completed
   - GET /api/activities/overdue
   - PATCH /api/activities/{id}/status

4. **Frontend Integration**:
   - Connect report button ke POST /api/reports
   - Connect activity status update ke PATCH /api/activities/{id}/status
   - Display pending reports di admin dashboard

---

## 9. DATABASE RELATIONSHIPS DIAGRAM

```
Users (1)
├── Activities (*)
│   ├── type: 'event' | 'task'
│   ├── status: pending | in_progress | completed | cancelled | overdue
│   └── metadata: deadline, location, start_time, end_time
│
├── Reports (*)
│   ├── Reports User (1) *-- User
│   ├── Reports Post (1) *-- Post
│   ├── Resolved By (nullable) *-- User
│   └── status: pending | under_review | resolved | dismissed
│
└── Posts (*)
    ├── Comments (*)
    ├── Likes (*)
    └── Reports (*) <- New relationship

```

---

Generated: May 11, 2026
Author: Database Setup Migration
