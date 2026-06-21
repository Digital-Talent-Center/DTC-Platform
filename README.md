# PRODIGI — DTC Platform

Platform digital untuk mahasiswa Digital Talent Center (DTC) dalam mengelola prestasi akademik, kegiatan, dan sumber belajar secara terpadu.

---

## Tentang Aplikasi

**PRODIGI** (Platform Digital Talent Center) adalah web app berbasis Laravel + React yang dibangun sebagai bagian dari tugas akhir mata kuliah Aplikasi Berbasis Platform. Platform ini dirancang khusus untuk ekosistem mahasiswa DTC — mulai dari dokumentasi prestasi, manajemen kegiatan, hingga konten premium berbasis pembayaran.

Aplikasi ini menggunakan arsitektur **monorepo fullstack**: backend Laravel sebagai API dan Inertia.js sebagai jembatan ke frontend React, sehingga tidak ada pemisahan repo antara frontend dan backend.

---

## Fitur Utama

- **Dashboard Mahasiswa** — Ringkasan aktivitas, navigasi cepat ke semua fitur, dan highlight Premium Post yang sudah dibayar.
- **Activities & Events** — Kelola kegiatan harian dalam dua tipe: *Event* (kegiatan dengan jadwal) dan *Task* (tugas dengan deadline). Status berubah otomatis jika melewati deadline (*overdue*).
- **My Achievements** — Submit, lihat status, dan kelola prestasi akademik/kompetisi. Ada tiga tab: *Collection* (approved), *Need Approval* (pending), dan *Rejected*.
- **Submit Achievement** — Form pengajuan prestasi dengan upload bukti (sertifikat/screenshot) dan link sertifikat.
- **Co-Library** — Repositori dokumen dan referensi belajar yang bisa difilter berdasarkan kategori, level, dan kompetisi.
- **Co-Guide** — Panduan teknis dan tutorial yang dikurasi untuk mahasiswa DTC.
- **Premium Post** — Fitur highlight konten berbayar menggunakan Midtrans Snap (Sandbox). User bisa memilih durasi (7 hari / 1 bulan / 3 bulan), upload lampiran, lalu bayar via payment gateway.
- **Timeline** — Feed postingan antar mahasiswa, lengkap dengan like dan komentar.
- **Notifications** — Notifikasi sistem untuk berbagai event di dalam platform.
- **Profile** — Halaman profil dengan informasi akademik (NIM, fakultas, jurusan), foto, bio, dan social links.
- **Admin Panel** — Manajemen mahasiswa, persetujuan prestasi, dan monitoring aktivitas.

---

## Tech Stack

### Backend
| Teknologi | Versi | Keterangan |
|-----------|-------|-----------|
| PHP | ^8.2 | Runtime |
| Laravel | ^12.0 | Framework utama |
| Inertia.js (Laravel) | ^2.0 | SSR bridge ke React |
| PostgreSQL | — | Database utama |
| Midtrans PHP SDK | ^2.6 | Payment gateway |
| Ziggy | ^2.4 | Named routes di frontend |

### Frontend
| Teknologi | Versi | Keterangan |
|-----------|-------|-----------|
| React | ^19.0 | UI library |
| TypeScript | ^5.7 | Static typing |
| Inertia.js (React) | ^2.3 | SPA tanpa build terpisah |
| Tailwind CSS | ^4.0 | Utility-first CSS |
| Radix UI | — | Komponen aksesibel (dialog, dropdown, dll) |
| Lucide React | — | Icon library |
| Vite | ^6.0 | Build tool & dev server |

---

## Struktur Folder

```
DTC-Platform/
├── app/
│   ├── Http/
│   │   ├── Controllers/       # Controller API & web
│   │   ├── Middleware/        # Auth & custom middleware
│   │   └── Requests/          # Form request validation
│   ├── Models/                # Eloquent models
│   ├── Policies/              # Authorization policies
│   └── Services/
│       └── MidtransService.php
├── database/
│   ├── migrations/            # Skema tabel
│   ├── factories/             # Factory untuk testing
│   └── seeders/
├── resources/
│   └── js/
│       ├── components/        # Komponen reusable (Header, UI, dll)
│       ├── layouts/           # App layout wrapper
│       ├── pages/             # Halaman (dashboard, activities, dll)
│       │   ├── admin/         # Halaman khusus admin
│       │   └── auth/          # Login, register
│       ├── services/
│       │   └── api.ts         # API service layer
│       └── types/             # TypeScript type definitions
├── routes/
│   ├── api.php                # Route API
│   ├── web.php                # Route web (Inertia)
│   └── auth.php               # Route autentikasi
├── docker/
│   ├── nginx/
│   │   ├── default.conf           # Nginx config (development)
│   │   └── default.prod.conf      # Nginx config (production)
│   └── php/
│       ├── entrypoint.sh          # Startup script container
│       ├── php.ini                # PHP config production
│       ├── php-dev.ini            # PHP config development (Xdebug)
│       ├── www.conf               # PHP-FPM pool production
│       └── www-dev.conf           # PHP-FPM pool development
├── .dockerignore
├── .env.example
├── composer.json
├── docker-compose.yml             # Development environment
├── docker-compose.prod.yml        # Production override
├── Dockerfile                     # Multi-stage build
├── package.json
└── vite.config.js
```

---

## Instalasi & Setup

Ada dua cara menjalankan aplikasi ini: **Docker** (direkomendasikan, sudah dikonfigurasi) atau **manual** (tanpa Docker).

---

### 🐳 Cara A — Docker (Direkomendasikan)

#### Prasyarat
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (sudah include Docker Compose)

#### Langkah Setup

**1. Clone repository**
```bash
git clone <url-repo>
cd DTC-Platform
```

**2. Salin file environment**
```bash
cp .env.example .env
```

**3. Buat volume Firebase (untuk push notification)**
```bash
docker volume create dtc-platform_firebase_credentials
```

**4. Build Docker image**
```bash
docker compose build
```

**5. Jalankan semua service**
```bash
docker compose up -d
```

> Container `app` akan otomatis menjalankan `composer install`, generate `APP_KEY`, migrasi database, dan `storage:link` saat pertama kali start.

**6. Generate APP_KEY dan muat ulang container**
```bash
docker compose exec app php artisan key:generate --force
docker compose up -d --force-recreate app
```

**7. (Opsional) Jalankan seeder untuk data demo**
```bash
docker compose exec app php artisan db:seed
```

Akun bawaan setelah seeder:

| Role | Email | Password |
|------|-------|----------|
| Student (Demo) | `demo@example.com` | `ipalGemink123` |
| Admin | `admin@example.com` | `admin1234` |

Akses aplikasi di: **http://localhost**

#### Perintah Docker Harian
```bash
docker compose up -d          # Start semua service
docker compose down           # Stop semua service
docker compose logs -f app    # Lihat log Laravel
docker compose exec app php artisan migrate        # Jalankan migrasi baru
docker compose exec app php artisan optimize:clear # Clear semua cache
docker compose exec app php artisan db:seed        # Jalankan seeder
```

---

### 🛠️ Cara B — Manual (Tanpa Docker)

#### Prasyarat

- PHP >= 8.2 (dengan ekstensi `pdo_pgsql`, `gd`)
- Composer
- Node.js >= 18 & npm
- PostgreSQL

#### Langkah Instalasi

**1. Clone repository**
```bash
git clone <url-repo>
cd DTC-Platform
```

**2. Install dependensi**
```bash
composer install
npm install
```

**3. Konfigurasi environment**
```bash
cp .env.example .env
php artisan key:generate
```

**4. Buat database PostgreSQL**
```sql
CREATE DATABASE dtc_platform;
```

**5. Edit `.env` sesuai konfigurasi lokal**

Wajib diisi minimal:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=dtc_platform
DB_USERNAME=postgres
DB_PASSWORD=(isi_password)
```

Untuk fitur pembayaran (Midtrans Sandbox):
```env
MIDTRANS_SERVER_KEY=Mid-server-tOmErGbEpNXbNW0UpfFcCOgV
MIDTRANS_CLIENT_KEY=Mid-client-FZgCuX4t9C8DJA9z
MIDTRANS_IS_PRODUCTION=false
VITE_MIDTRANS_CLIENT_KEY="${MIDTRANS_CLIENT_KEY}"
VITE_MIDTRANS_SNAP_URL=https://app.sandbox.midtrans.com/snap/snap.js
```

**6. Jalankan migrasi dan seeder**

Untuk setup awal lengkap dengan data demo:
```bash
php artisan migrate:fresh --seed
```

Atau jika hanya ingin menjalankan migrasi tanpa data demo:
```bash
php artisan migrate
```

Seeder akan membuat dua akun bawaan yang bisa langsung dipakai:

| Role | Email | Password |
|------|-------|----------|
| Student (Demo) | `demo@example.com` | `ipalGemink123` |
| Admin | `admin@example.com` | `admin1234` |

> **Catatan:** Akun demo juga dilengkapi dengan contoh data — posts, achievements, activities, notifications, dan dokumen — supaya tampilan aplikasi tidak kosong saat pertama kali dijalankan.

**7. (Opsional) Buat symlink storage**
```bash
php artisan storage:link
```

---

## Menjalankan Aplikasi

### 🐳 Dengan Docker

```bash
docker compose up -d
```

Akses aplikasi di: **http://localhost**  
Vite HMR (hot reload): **http://localhost:5173**

### 🛠️ Tanpa Docker

Cara paling mudah adalah menggunakan satu perintah dari Composer yang akan menjalankan Laravel server, queue worker, dan Vite sekaligus:

```bash
composer run dev
```

Atau jalankan manual di beberapa terminal terpisah:

```bash
# Terminal 1 — Laravel server
php artisan serve

# Terminal 2 — Vite dev server (hot reload)
npm run dev

# Terminal 3 — Queue worker (opsional, untuk background jobs)
php artisan queue:listen --tries=1
```

Akses aplikasi di: **http://localhost:8000**

---

## Konfigurasi Environment Penting

| Variable | Keterangan |
|----------|-----------|
| `APP_KEY` | Generate dengan `php artisan key:generate` |
| `DB_CONNECTION` | Gunakan `pgsql` |
| `DB_DATABASE` | Nama database PostgreSQL |
| `MIDTRANS_SERVER_KEY` | Server key dari dashboard Midtrans (jangan expose ke frontend) |
| `MIDTRANS_CLIENT_KEY` | Client key Midtrans (boleh expose ke browser) |
| `MIDTRANS_IS_PRODUCTION` | Set `false` untuk sandbox/development |
| `VITE_MIDTRANS_CLIENT_KEY` | Referensi ke `MIDTRANS_CLIENT_KEY` untuk Vite |
| `VITE_MIDTRANS_SNAP_URL` | URL Snap.js Midtrans (sandbox atau production) |
| `FILESYSTEM_DISK` | Set `local` atau `public` untuk storage upload |

---

## Catatan untuk Developer

### Arsitektur
Aplikasi ini menggunakan **Inertia.js** — tidak ada API terpisah untuk frontend. Semua halaman dirender sebagai Inertia page component (`.tsx`), dan data di-pass langsung dari controller. Endpoint di `routes/api.php` digunakan khusus untuk request AJAX (fetch dari komponen React).

### Payment Gateway
Integrasi Midtrans menggunakan Snap popup. Karena berjalan di localhost, webhook dari Midtrans tidak bisa menjangkau server lokal. Untuk mengatasi ini, ada endpoint `POST /api/midtrans/check-and-mark-paid` yang dipanggil frontend setelah Snap `onSuccess` callback untuk verifikasi manual ke Midtrans API.

### Role User
Ada dua role: `student` (default) dan `admin`. Role admin ditentukan lewat kolom `role` di tabel `profile_extensions`, bukan di tabel `users`.

### Upload File
File upload (lampiran premium post, bukti prestasi) disimpan di `storage/app/public`. Pastikan sudah menjalankan `php artisan storage:link` agar file bisa diakses publik.

### Struktur API Response
Semua API response menggunakan format konsisten:
```json
{
  "data": { },
  "message": "Success",
  "pagination": { }
}
```
Field `message` dan `pagination` bersifat opsional tergantung endpoint.

---

## Lisensi

Proyek ini dibuat untuk keperluan akademik. Tidak untuk distribusi komersial.