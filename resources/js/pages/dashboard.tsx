import { useState, useRef, useEffect } from "react";
import { Link, Head, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { api } from "@/services/api";
import type { PremiumTransaction, SharedData } from "@/types";

interface MenuItem {
  label: string;
  href: string;
  iconBg: string;
  iconColor: string;
  iconPath: string;
  badge?: number;
}

const menuItems: MenuItem[] = [
  {
    label: "Activities",
    href: "/dashboard/activities",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-500",
    iconPath: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0021 11.25v7.5",
  },
  {
    label: "My Achievement",
    href: "/dashboard/achievements",
    iconBg: "bg-green-50",
    iconColor: "text-green-500",
    iconPath: "M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228M18.75 4.236V2.721",
  },
  {
    label: "Submit Achievement",
    href: "/dashboard/achievements/new",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    iconPath: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5",
  },
  {
    label: "Co-Library",
    href: "/dashboard/co-library",
    iconBg: "bg-pink-50",
    iconColor: "text-pink-500",
    iconPath: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z",
  },
  {
    label: "Co-Guide",
    href: "/dashboard/co-guide",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    iconPath: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25",
  },
  {
    label: "Premium Post",
    href: "/dashboard/premium-post",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-500",
    iconPath: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
  },
];

// Helper to format time
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

// Helper to get initials
const getInitials = (name: string) => {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AA';
};

// Helper to get random avatar color
const getAvatarColor = (index: number) => {
  const colors = [
    'from-pink-400 to-rose-500',
    'from-blue-400 to-indigo-500',
    'from-emerald-400 to-teal-500',
    'from-amber-400 to-orange-500',
    'from-violet-400 to-purple-500',
  ];
  return colors[index % colors.length];
};

function MenuIcon({ path, className }: { path: string; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "w-7 h-7"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

/* ──────────────── Premium Post Detail Modal ──────────────── */
function PremiumModal({ tx, onClose }: { tx: PremiumTransaction; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Gunakan paidAt jika ada, fallback ke createdAt
  const displayDate = tx.paidAt ?? tx.createdAt;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" style={{ animation: "fadeIn .2s ease-out" }} />

      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
        style={{ animation: "modalPop .3s cubic-bezier(.16,1,.3,1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Sisi kiri: gambar / placeholder */}
        <div className="md:w-1/2 w-full h-64 md:h-auto bg-gray-100 flex-shrink-0 relative overflow-hidden">
          {tx.imageUrl ? (
            <img
              src={tx.imageUrl}
              alt={tx.postTitle}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          {/* Fallback: tampil jika tidak ada imageUrl ATAU jika gambar gagal load */}
          <div
            className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 items-center justify-center"
            style={{ display: tx.imageUrl ? 'none' : 'flex' }}
          >
            <span className="text-gray-500">No image</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent md:hidden" />
        </div>

        {/* Sisi kanan: detail konten */}
        <div className="md:w-1/2 w-full p-6 sm:p-8 flex flex-col overflow-y-auto">
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${getAvatarColor(tx.userId)} flex items-center justify-center text-white text-sm font-bold shadow-md`}>
              {getInitials(tx.user?.name || 'AA')}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{tx.user?.name || 'Anonymous'}</p>
              <p className="text-xs text-gray-400">{formatTime(displayDate)}</p>
            </div>
          </div>

          <span className="inline-flex self-start px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 mb-4">
            ⭐ Post
          </span>

          <p className="text-gray-700 text-sm leading-relaxed flex-1">{tx.postTitle}</p>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-400">Highlighted Premium Post</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────── Premium Posts Carousel ──────────────── */
function PremiumPostsSection() {
  const { auth } = usePage<SharedData>().props;
  const isAdmin = auth.user?.role === 'admin';

  const [selectedTx, setSelectedTx] = useState<PremiumTransaction | null>(null);
  const [highlights, setHighlights] = useState<PremiumTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const loadHighlights = async () => {
      try {
        // Ambil hanya premium post yang sudah dibayar (status = 'paid')
        const response = await api.premiumTransactions.highlights();
        setHighlights(response.data);
      } catch (err) {
        console.error('Failed to load premium highlights:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHighlights();
  }, []);

  useEffect(() => {
    if (openMenuId === null) return;
    const close = () => setOpenMenuId(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [openMenuId]);

  async function handleDelete(id: number) {
    if (!confirm('Hapus premium post ini? Tindakan ini tidak dapat dibatalkan.')) return;
    try {
      await api.premiumTransactions.delete(id);
      setHighlights(prev => prev.filter(tx => tx.id !== id));
      setOpenMenuId(null);
    } catch {
      alert('Gagal menghapus post. Silakan coba lagi.');
    }
  }

  function updateScrollButtons() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }

  useEffect(() => {
    updateScrollButtons();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", updateScrollButtons, { passive: true });
    return () => el?.removeEventListener("scroll", updateScrollButtons);
  }, [highlights]);

  function scroll(dir: number) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 380, behavior: "smooth" });
  }

  /* ── Header section yang sama dipakai di semua state ── */
  const SectionHeader = () => (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-200/50">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Premium Highlights</h2>
          <p className="text-xs text-gray-400 mt-0.5">Premium Highlights Post</p>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-2">
        <button onClick={() => scroll(-1)} disabled={!canScrollLeft}
          className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer ${canScrollLeft ? "border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400" : "border-gray-100 text-gray-300 cursor-not-allowed"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button onClick={() => scroll(1)} disabled={!canScrollRight}
          className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer ${canScrollRight ? "border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400" : "border-gray-100 text-gray-300 cursor-not-allowed"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  );

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="mt-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-200/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Premium Highlights</h2>
            <p className="text-xs text-gray-400 mt-0.5">Memuat data...</p>
          </div>
        </div>
        {/* Skeleton cards */}
        <div className="flex gap-5">
          {[1, 2].map((i) => (
            <div key={i} className="flex-shrink-0 w-[360px] sm:w-[420px] h-[200px] bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  /* ── Empty state: belum ada premium post yang dibayar ── */
  if (highlights.length === 0) {
    return (
      <div className="mt-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-200/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Premium Highlights</h2>
            <p className="text-xs text-gray-400 mt-0.5">Premium Highlights Post</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-10 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </div>
          <p className="text-gray-700 font-semibold">Belum ada Premium Post yang tersedia.</p>
          <Link
            href="/dashboard/premium-post"
            className="mt-2 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors"
          >
            Buat Premium Post
          </Link>
        </div>
      </div>
    );
  }

  /* ── Data tersedia: tampilkan carousel ── */
  return (
    <>
      <div className="mt-10 relative">
        <SectionHeader />

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {highlights.map((tx, idx) => {
            const displayDate = tx.paidAt ?? tx.createdAt;
            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="group relative flex-shrink-0 w-[360px] sm:w-[420px] bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-amber-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer snap-start"
              >
                {/* Tombol tiga titik — hanya tampil untuk admin */}
                {isAdmin && (
                  <div
                    className="absolute top-2 right-2 z-10"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setOpenMenuId(openMenuId === tx.id ? null : tx.id)}
                      className="w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                    {openMenuId === tx.id && (
                      <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Hapus Post
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex h-[180px] sm:h-[200px]">
                  {/* Kolom kiri: gambar / placeholder */}
                  <div className="w-[45%] relative overflow-hidden bg-gray-100">
                    {tx.imageUrl ? (
                      <img
                        src={tx.imageUrl}
                        alt={tx.postTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement | null;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 items-center justify-center"
                      style={{ display: tx.imageUrl ? 'none' : 'flex' }}
                    >
                      <span className="text-gray-500 text-xs">No image</span>
                    </div>
                    {/* Badge POST */}
                    <div className="absolute top-3 left-0 bg-gradient-to-r from-amber-500 to-orange-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-r-full shadow-md flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      POST
                    </div>
                  </div>

                  {/* Kolom kanan: info */}
                  <div className="w-[55%] p-4 flex flex-col justify-between">
                    {/* Avatar + nama user */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getAvatarColor(idx)} flex items-center justify-center text-white text-[10px] font-bold`}>
                        {getInitials(tx.user?.name || 'AA')}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{tx.user?.name || 'Anonymous'}</p>
                        <p className="text-[10px] text-gray-400">{formatTime(displayDate)}</p>
                      </div>
                    </div>

                    {/* Badge tipe */}
                    <span className="inline-flex self-start px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600 mb-2">
                      Post
                    </span>

                    {/* Judul/konten post — postTitle dari premium transaction */}
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 flex-1">
                      {tx.postTitle}
                    </p>

                    {/* Tombol lihat selengkapnya */}
                    <div className="flex items-center gap-1 mt-2 text-amber-600 group-hover:text-amber-700 transition-colors">
                      <span className="text-[11px] font-semibold">Lihat Selengkapnya</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Tombol "Lihat Semua" mengarah ke halaman premium-post */}
          <Link
            href="/dashboard/premium-post"
            className="flex-shrink-0 w-[180px] bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 flex flex-col items-center justify-center gap-3 hover:shadow-lg hover:border-amber-200 transition-all cursor-pointer snap-start"
          >
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-amber-700">Buat Premium Post</span>
          </Link>
        </div>
      </div>

      {selectedTx && <PremiumModal tx={selectedTx} onClose={() => setSelectedTx(null)} />}
    </>
  );
}

/* ──────────────── Main Dashboard Page ──────────────── */
export default function DashboardPage() {
  return (
    <AppLayout>
      <Head title="Dashboard" />
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12" style={{ maxWidth: '1200px', width: '100%' }}>
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Student Dashboard</h1>
          <p className="mt-2 text-gray-500">Manage your academic progress and digital learning resources.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {menuItems.map((item) => (
            <Link key={item.label} href={item.href}
              className="group bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 flex flex-col items-center justify-center gap-4 hover:shadow-lg hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-200">
              <div className="relative">
                <div className={`w-14 h-14 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <MenuIcon path={item.iconPath} />
                </div>
                {item.badge && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{item.badge}</span>
                )}
              </div>
              <span className="text-sm font-semibold text-gray-800">{item.label}</span>
            </Link>
          ))}
        </div>

        <PremiumPostsSection />
      </div>
    </AppLayout>
  );
}
