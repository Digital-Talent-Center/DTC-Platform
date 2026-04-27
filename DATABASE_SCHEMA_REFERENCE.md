# SQL DDL Reference - DTC Platform Database Schema

> Complete SQL schema for PostgreSQL database migration

## Database Tables Overview

This document provides the complete SQL DDL (Data Definition Language) for creating all tables in the DTC Platform PostgreSQL database.

### Table Structure

```
Database: dtc_platform (PostgreSQL)
Version: 1.0
Last Updated: 2026-04-27
```

---

## 1. USERS TABLE (Existing)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

---

## 2. PROFILE_EXTENSIONS TABLE

Stores extended user profile information (NIM, faculty, about, social links, etc.)

```sql
CREATE TABLE profile_extensions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    nim VARCHAR(50) UNIQUE NULL,
    faculty VARCHAR(255) NULL,
    major VARCHAR(255) NULL,
    phone VARCHAR(20) NULL,
    avatar_url VARCHAR(500) NULL,
    about TEXT NULL,
    role VARCHAR(100) NULL,
    social_links JSONB NULL DEFAULT '{}',
    profile_completed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_profile_extensions_user_id ON profile_extensions(user_id);
```

**Fields Mapping:**
| Database | Frontend | Type | Notes |
|----------|----------|------|-------|
| nim | nim | string | Student ID |
| faculty | faculty | string | Faculty name |
| major | major | string | Major/Program |
| phone | phone | string | Contact number |
| avatar_url | avatar | string | Profile picture URL |
| about | about | string | Bio/description |
| role | role | string | User role (student, mentor) |
| social_links | socialLinks | object | {github, linkedin, twitter, portfolio} |

---

## 3. POSTS TABLE

Stores timeline posts/updates

```sql
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url VARCHAR(500) NULL,
    caption VARCHAR(500) NULL,
    tag VARCHAR(100) NULL,
    likes_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);
```

**Fields Mapping:**
| Database | Frontend | Type | Notes |
|----------|----------|------|-------|
| content | content | text | Post message |
| image_url | imageUrl | string | Attached image |
| caption | caption | string | Image caption |
| tag | tag | string | Topic tag |
| likes_count | likesCount | number | Denormalized count |
| comments_count | commentsCount | number | Denormalized count |

---

## 4. COMMENTS TABLE

Stores comments on posts

```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);
```

---

## 5. LIKES TABLE

Stores likes on posts and comments (polymorphic pattern)

```sql
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    likeable_id UUID NOT NULL,
    likeable_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_likes_unique ON likes(user_id, likeable_id, likeable_type);
CREATE INDEX idx_likes_likeable ON likes(likeable_id, likeable_type);
```

**Constraint:** Each user can like an item only once

**Valid likeable_type values:**
- `Post`
- `Comment`

---

## 6. ACHIEVEMENTS TABLE

Stores user achievements/awards

```sql
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(100) NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
    badge_icon VARCHAR(255) NULL,
    year SMALLINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_status ON achievements(status);
CREATE INDEX idx_achievements_created_at ON achievements(created_at);
```

**Fields Mapping:**
| Database | Frontend | Type | Notes |
|----------|----------|------|-------|
| status | status | enum | 'approved' \| 'pending' \| 'rejected' |
| category | category | string | Achievement type |
| title | title | string | Achievement name |

---

## 7. ACTIVITIES TABLE

Stores user activities/events log

```sql
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    status VARCHAR(100) NOT NULL DEFAULT 'completed' CHECK(status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    relatable_id UUID NULL,
    relatable_type VARCHAR(100) NULL,
    activity_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_activity_date ON activities(activity_date);
CREATE INDEX idx_activities_relatable ON activities(relatable_id, relatable_type);
```

**Fields Mapping:**
| Database | Frontend | Type | Notes |
|----------|----------|------|-------|
| type | type | string | 'login', 'post_created', etc. |
| activity_date | date/time | timestamp | When activity occurred |
| status | status | enum | 'pending' \| 'in_progress' \| 'completed' \| 'cancelled' |

---

## 8. NOTIFICATIONS TABLE

Stores user notifications

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    notifiable_id UUID NULL,
    notifiable_type VARCHAR(100) NULL,
    action_url VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

**Fields Mapping:**
| Database | Frontend | Type | Notes |
|----------|----------|------|-------|
| category | category | string | 'system', 'social', 'achievement' |
| is_read | read | boolean | Read status |
| message | message | text | Notification content |

---

## 9. DOCUMENTS TABLE

Stores documents (Co-Guide, Co-Library)

```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    type VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    competition VARCHAR(100) NULL,
    level VARCHAR(100) NULL,
    year SMALLINT NULL,
    file_path VARCHAR(500) NULL,
    file_icon VARCHAR(50) NULL,
    tags TEXT NULL,
    views_count INTEGER NOT NULL DEFAULT 0,
    downloads_count INTEGER NOT NULL DEFAULT 0,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_created_at ON documents(created_at);
```

**Fields Mapping:**
| Database | Frontend | Type | Notes |
|----------|----------|------|-------|
| category | category | string | 'co-guide', 'co-library', 'tutorial' |
| type | type | string | 'pdf', 'guide', 'resource' |
| level | level | enum | 'beginner' \| 'intermediate' \| 'advanced' |
| competition | competition | string | 'ICPC', 'CTF', 'Hackathon' |

---

## 10. TAGS TABLE

Stores document tags

```sql
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tags_slug ON tags(slug);
```

---

## 11. DOCUMENT_TAG PIVOT TABLE

Many-to-many relationship between documents and tags

```sql
CREATE TABLE document_tag (
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (document_id, tag_id)
);

CREATE INDEX idx_document_tag_tag_id ON document_tag(tag_id);
```

---

## System Tables (Existing)

These tables are automatically created by Laravel:

```sql
-- Password reset tokens
CREATE TABLE password_reset_tokens (
    email VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL
);

-- Cache
CREATE TABLE cache (
    key VARCHAR(255) PRIMARY KEY,
    value LONGTEXT NOT NULL,
    expiration INTEGER NOT NULL
);

-- Sessions
CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id UUID NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    payload LONGTEXT NOT NULL,
    last_activity INTEGER NOT NULL
);

-- Jobs queue
CREATE TABLE jobs (
    id BIGSERIAL PRIMARY KEY,
    queue VARCHAR(255) NOT NULL,
    payload LONGTEXT NOT NULL,
    attempts SMALLINT NOT NULL,
    reserved_at INTEGER NULL,
    available_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
);
```

---

## Relationships Summary

```
User (1) ──── (N) Posts
User (1) ──── (N) Comments
User (1) ──── (N) Likes
User (1) ──── (N) Achievements
User (1) ──── (N) Activities
User (1) ──── (N) Notifications
User (1) ──── (N) Documents
User (1) ──── (1) ProfileExtension

Post (1) ──── (N) Comments
Post (1) ──── (N) Likes

Comment (1) ──── (N) Likes

Document (N) ──── (N) Tags (through document_tag)
```

---

## Data Type Mappings

| PostgreSQL | Laravel | Frontend (TypeScript) |
|------------|---------|----------------------|
| UUID | uuid | string (UUID format) |
| VARCHAR(255) | string | string |
| TEXT | text | string |
| SMALLINT | integer | number |
| BOOLEAN | boolean | boolean |
| TIMESTAMP | dateTime | Date/ISO string |
| INTEGER | integer | number |
| JSONB | json | object/array |

---

## Performance Considerations

1. **Denormalization:**
   - `likes_count` and `comments_count` on Posts table (updated via triggers or application logic)
   - `views_count` and `downloads_count` on Documents table

2. **Indexes:**
   - User ID fields (foreign keys)
   - Timestamps for sorting
   - Status fields for filtering
   - Email for authentication

3. **Constraints:**
   - NOT NULL for required fields
   - UNIQUE for email, nim, social links
   - CHECK for enum fields (status, level, type)
   - FOREIGN KEYs with CASCADE DELETE for data consistency

---

## Migration Execution

To create these tables in PostgreSQL:

```bash
# Run all migrations
php artisan migrate

# Specific migration
php artisan migrate --path=database/migrations/0001_01_02_000003_create_posts_table.php

# Rollback
php artisan migrate:rollback

# Reset database
php artisan migrate:refresh
```

