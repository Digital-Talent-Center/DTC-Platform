# Quick Reference: Reports & Activity Management API

## Files Created/Modified

### New Files:
1. ✅ `app/Models/Report.php` - Report model
2. ✅ `database/migrations/2026_05_11_000001_create_reports_table.php` - Migration
3. ✅ `app/Http/Controllers/ReportController.php` - API controller

### Modified Files:
1. ✅ `app/Models/Post.php` - Added reports() relationship
2. ✅ `app/Models/Activity.php` - Enhanced with new scopes and methods
3. ✅ `app/Http/Controllers/ActivityController.php` - Added upcoming(), completed(), overdue(), updateStatus()
4. ✅ `routes/api.php` - Added report routes and activity enhancement routes

---

## Quick API Examples

### 1. USER - Report a Post
```javascript
// Frontend
const reportPost = async (postId, reason, description) => {
    const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            post_id: postId,
            reason: reason, // 'spam', 'harassment', etc
            description: description
        })
    });
    return response.json();
};
```

### 2. USER - Get My Reports
```javascript
const getMyReports = async () => {
    const response = await fetch('/api/reports/my-reports');
    return response.json();
};
```

### 3. USER - Get Upcoming Activities
```javascript
const getUpcomingActivities = async (type = null) => {
    const url = type 
        ? `/api/activities/upcoming?type=${type}`
        : '/api/activities/upcoming';
    const response = await fetch(url);
    return response.json();
};
```

### 4. USER - Update Activity Status
```javascript
const updateActivityStatus = async (activityId, status) => {
    const response = await fetch(`/api/activities/${activityId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: status })
    });
    return response.json();
};
```

### 5. ADMIN - Get All Reports
```javascript
const getAllReports = async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`/api/reports?${params}`);
    return response.json();
};

// Examples:
getAllReports({ status: 'pending' });
getAllReports({ reason: 'spam' });
getAllReports({ from_date: '2026-05-01', to_date: '2026-05-11' });
```

### 6. ADMIN - Get Post Reports
```javascript
const getPostReports = async (postId) => {
    const response = await fetch(`/api/reports/post/${postId}`);
    return response.json();
};
```

### 7. ADMIN - Update Report Status
```javascript
const resolveReport = async (reportId, status, actionTaken) => {
    const response = await fetch(`/api/reports/${reportId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            status: status, // 'resolved', 'dismissed', 'under_review'
            action_taken: actionTaken // 'post_removed', 'user_warned', etc
        })
    });
    return response.json();
};
```

### 8. ADMIN - Get Report Statistics
```javascript
const getReportStats = async () => {
    const response = await fetch('/api/reports/statistics');
    return response.json();
};

// Response:
// {
//   "total_reports": 25,
//   "by_status": { "pending": 5, "under_review": 3, "resolved": 15, "dismissed": 2 },
//   "by_reason": { "spam": 10, "harassment": 8, ... }
// }
```

---

## Report Reasons (for dropdown/select):
```
- inappropriate_content  → Konten tidak pantas
- spam                   → Spam
- harassment             → Pelecehan
- false_information      → Informasi salah
- copyright_violation    → Pelanggaran copyright
- other                  → Lainnya
```

## Activity Statuses:
```
- pending        → Belum mulai
- in_progress    → Sedang berlangsung
- completed      → Selesai
- cancelled      → Dibatalkan
- overdue        → Terlambat
```

## Report Statuses:
```
- pending       → Menunggu review
- under_review  → Sedang direview
- resolved      → Selesai ditangani
- dismissed     → Ditolak
```

---

## Database Setup

Run migration:
```bash
php artisan migrate
```

Rollback if needed:
```bash
php artisan migrate:rollback --step=1
```

---

## Testing (Tinker):

```bash
php artisan tinker

# Create a report
$post = Post::find(1);
$report = Report::create([
    'post_id' => $post->id,
    'user_id' => auth()->id(),
    'reason' => 'spam',
    'description' => 'This is spam',
    'status' => 'pending'
]);

# Get pending reports
Report::pending()->get();

# Update report
$report->markResolved('post_removed', auth()->id());

# Get activity statistics
Activity::where('user_id', 1)->statistics();
```

---

## Notes:
- ✅ All existing features are maintained
- ✅ No breaking changes to existing code
- ✅ Backward compatible
- ✅ Ready for production migration
- ⚠️ Remember to run `php artisan migrate` before testing

