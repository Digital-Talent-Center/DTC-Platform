# System Architecture & Project Context

> [!IMPORTANT]
> **Context untuk AI Antigravity:** 
> Dokumen ini adalah panduan arsitektur sistem (System Context) dari project target. Kita akan melakukan migrasi/import komponen dari project berbasis **Next.js** ke dalam project ini.

## Teknologi Utama (Tech Stack)
Project target ini bukanlah aplikasi *Single Page Application* (SPA) React terpisah yang menggunakan *API proxy* (seperti Next.js terpisah dari backend API), melainkan sebuah arsitektur hibrida (monorepo backend/frontend via Inertia.js). 

Stack yang digunakan:
1. **Backend:** Laravel 12.x (PHP 8.2+)
2. **Frontend Routing/State:** Inertia.js 2.0 (`@inertiajs/react`)
3. **Frontend Library:** React 19 + TypeScript (`.tsx`)
4. **Styling:** Tailwind CSS 4.0 (`@tailwindcss/vite`)
5. **UI Components:** shadcn/ui (berbasis Radix UI)
6. **Bundler:** Vite

## Perbedaan Signifikan dengan Next.js
Karena kita mengimpor dari Next.js, perhatikan perbedaan utama ini:
* **Routing:** Kita **TIDAK** menggunakan sistem routing Next.js (`app/` atau `pages/`). Routing dikendalikan secara mutlak dari backend Laravel (`routes/web.php`).
* **Data Fetching:** Jangan gunakan asinkronus React Server Components (RSC) atau fungsi seperti `getServerSideProps` pada file `.tsx`. Alih-alih, Controller Laravel-lah yang mereturn data via fungsi `Inertia::render()`, yang akan otomatis masuk sebagai *Props* ke komponen UI React.
* **Tidak ada API Routes:** Fetching API internal ditiadakan kecuali sangat perlu, karena view terhubung langsung dengan backend via Inertia.

## Struktur File (Directory Structure)
Berikut adalah gambaran struktur folder utama tempat di mana pekerjaan frontend dipusatkan:

```text
/ (Project Root)
├── app/                  # (LARAVEL) Backend Logic, Controllers, Models (PHP)
├── bootstrap/app.php     # Konfigurasi pusat aplikasi Laravel
├── config/               # Konfigurasi sistem (PHP)
├── routes/               
│   └── web.php           # (LARAVEL) Routing utama untuk aplikasi. Semua URL / Pages diregistrasi di sini 
│
├── package.json          # List dependency Node
├── vite.config.js        # Entrypoint untuk frontend assets (bundler config)
├── components.json       # Konfigurasi untuk men-generate/modify shadcn/ui
│
└── resources/            # (FRONTEND ROOT)
    ├── css/
    │   └── app.css       # Tailwind entry point v4.0
    └── js/               
        ├── app.tsx       # Entry point utama Inertia & React
        ├── ssr.jsx       # Entry point untuk Server Side Rendering (SSR)
        │
        ├── pages/        # === NEXT.JS equivalent to `pages/` (atau `app/` di App Router) ===
        │                 # Menyimpan Komponen View (Halaman Utama).
        │                 # Setiap sub-direktori merujuk pada pemanggilan render, misal: `Inertia::render('Home/Index')` akan merender `pages/Home/Index.tsx`
        │
        ├── components/   # === NEXT.JS equivalent to `components/` ===
        │                 # Umumnya berisi dua hal:
        │                 # 1. UI primitive komponen (button, modals, dll. dari shadcn)
        │                 # 2. Reusable components (Navbar, Footer, Card, dll.)
        │                 
        ├── layouts/      # Memuat struktur layout global UI untuk membungkus page page
        ├── lib/          # Utilities umum React (seperti util func untuk tailwind-merge)
        ├── hooks/        # Custom React Hooks
        └── types/        # TypeScript Definitions Interfaces (.d.ts)
```

## Panduan Migrasi Komponen Next.js
Jika kamu (AI pengimpor) bertugas mengimpor halaman page Next.js (.tsx) ke sistem ini, ikuti langkah berikut:
1. Pindahkan komponen dan markup pada `page.tsx` di Next.js ke folder `resources/js/pages/`.
2. Hapus seluruh dependency spesifik Next.js pada file hasil migrasi:
   - Ganti `import Image from 'next/image'` dengan tag HTML `<img>` standar.
   - Ganti `import Link from 'next/link'` menjadi `import { Link } from '@inertiajs/react'` (`<Link href="...">`).
   - Hapus metadata API khusus Next.js.
3. Pindahkan komponen partikel (reusable components) ke folder `resources/js/components/`.
4. Jika Next.js page memiliki Client-side data fetching atau Server side fetch (RSC), sesuaikan kodenya. Pindahkan logik query database/API call ke file Laravel Controller lalu inject hasil query tersebut sebagai Component `Props` memanfaatkan function `Inertia::render()`.
5. Aset gambar statik (seperti `.png`, `.svg` di public/ Next.js) harus ikut disalin ke root `public/` project Laravel. Komponen nantinya bisa memanggil melalui root reference langsung: `<img src="/nama-file.png" />`.
