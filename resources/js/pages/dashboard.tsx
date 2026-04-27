import { useState, useRef, useEffect } from "react";
import { Link, Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { api, type Post } from "@/services/api";

const menuItems = [
  {
    label: "Activities",
    href: "/dashboard/activities",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    iconPath: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0121 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
  },
  {
    label: "My Achievements",
    href: "/dashboard/achievements",
    badge: 3,
    iconBg: "bg-green-50",
    iconColor: "text-green-500",
    iconPath: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    label: "Submit Achievement",
    href: "/dashboard/achievements",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    iconPath: "M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228M18.75 4.236V2.721",
  },
  {
    label: "Premium Post",
    href: "/timeline",
    iconBg: "bg-pink-50",
    iconColor: "text-pink-500",
    iconPath: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z",
  },
  {
    label: "Co-Guide",
    href: "/dashboard/co-guide",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    iconPath: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
  },
];

const extraMenuItems = [
  {
    label: "Profile",
    href: "/profile",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-500",
    iconPath: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
  },
  {
    label: "Settings",
    href: "#",
    iconBg: "bg-slate-50",
    iconColor: "text-slate-500",
    iconPath: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z",
  },
  {
    label: "Help Center",
    href: "#",
    iconBg: "bg-teal-50",
    iconColor: "text-teal-500",
    iconPath: "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z",
  },
  {
    label: "Notifications",
    href: "#",
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    iconPath: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0",
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

/* ──────────────── Menu Lain Dropdown ──────────────── */
function MenuLainButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="group bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 flex flex-col items-center justify-center gap-4 hover:shadow-lg hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-200 w-full cursor-pointer"
      >
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-100 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-gray-800">Co-Library</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2"
          style={{ animation: "menuDrop .2s ease-out" }}>
          {extraMenuItems.map((item) => (
            <Link key={item.label} href={item.href}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              onClick={() => setOpen(false)}>
              <div className={`w-9 h-9 rounded-lg ${item.iconBg} ${item.iconColor} flex items-center justify-center flex-shrink-0`}>
                <MenuIcon path={item.iconPath} className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ──────────────── Premium Post Popup Modal ──────────────── */
function PostModal({ post, onClose }: { post: Post; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" style={{ animation: "fadeIn .2s ease-out" }} />

      {/* Modal Content */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
        style={{ animation: "modalPop .3s cubic-bezier(.16,1,.3,1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Left — Full Image */}
        <div className="md:w-1/2 w-full h-64 md:h-auto bg-gray-100 flex-shrink-0 relative overflow-hidden">
          {post.imageUrl ? (
            <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
              <span className="text-gray-500">No image</span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent md:hidden" />
        </div>

        {/* Right — Full Caption & Info */}
        <div className="md:w-1/2 w-full p-6 sm:p-8 flex flex-col overflow-y-auto">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${getAvatarColor(post.userId)} flex items-center justify-center text-white text-sm font-bold shadow-md`}>
              {getInitials(post.user?.name || 'AA')}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{post.user?.name || 'Anonymous'}</p>
              <p className="text-xs text-gray-400">{formatTime(post.createdAt)}</p>
            </div>
          </div>

          {/* Tag */}
          <span className="inline-flex self-start px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 mb-4">
            ⭐ Post
          </span>

          {/* Caption */}
          <p className="text-gray-700 text-sm leading-relaxed flex-1">{post.content}</p>

          {/* Premium badge */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-400">Highlighted Post</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────── Premium Posts Carousel ──────────────── */
function PremiumPostsSection() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response = await api.posts.list(1, 5);
        setPosts(response.data);
      } catch (err) {
        console.error('Failed to load posts:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

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
  }, []);

  function scroll(dir: number) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 380, behavior: "smooth" });
  }

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
            <p className="text-xs text-gray-400 mt-0.5">Loading posts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="mt-10 bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <p className="text-gray-500">No posts yet. Start sharing!</p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-10 relative">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-200/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recent Posts</h2>
              <p className="text-xs text-gray-400 mt-0.5">Latest from your community</p>
            </div>
          </div>

          {/* Arrow navigation */}
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

        {/* Scrollable Carousel */}
        <div ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {posts.map((post, idx) => (
            <div key={post.id}
              onClick={() => setSelectedPost(post)}
              className="group flex-shrink-0 w-[360px] sm:w-[420px] bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-amber-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer snap-start"
            >
              <div className="flex h-[180px] sm:h-[200px]">
                {/* Left — Post Image */}
                <div className="w-[45%] relative overflow-hidden bg-gray-100">
                  {post.imageUrl ? (
                    <img src={post.imageUrl} alt="Post"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                      <span className="text-gray-500 text-xs">No image</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-0 bg-gradient-to-r from-amber-500 to-orange-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-r-full shadow-md flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    POST
                  </div>
                </div>

                {/* Right — Caption & Info */}
                <div className="w-[55%] p-4 flex flex-col justify-between">
                  {/* User */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getAvatarColor(idx)} flex items-center justify-center text-white text-[10px] font-bold`}>
                      {getInitials(post.user?.name || 'AA')}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{post.user?.name || 'Anonymous'}</p>
                      <p className="text-[10px] text-gray-400">{formatTime(post.createdAt)}</p>
                    </div>
                  </div>

                  {/* Tag */}
                  <span className="inline-flex self-start px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600 mb-2">
                    Post
                  </span>

                  {/* Caption preview (truncated) */}
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 flex-1">
                    {post.content}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center gap-1 mt-2 text-amber-600 group-hover:text-amber-700 transition-colors">
                    <span className="text-[11px] font-semibold">Lihat Selengkapnya</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* "Lihat Semua" card at end */}
          <Link href="/timeline"
            className="flex-shrink-0 w-[180px] bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 flex flex-col items-center justify-center gap-3 hover:shadow-lg hover:border-amber-200 transition-all cursor-pointer snap-start">
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-amber-700">Lihat Semua</span>
          </Link>
        </div>
      </div>

      {/* Modal */}
      {selectedPost && <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
    </>
  );
}

/* ──────────────── Main Dashboard Page ──────────────── */
export default function DashboardPage() {
  return (
    <AppLayout>
      <Head title="Dashboard" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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

          {/* Co-Library */}
          <Link href="/dashboard/co-library"
            className="group bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 flex flex-col items-center justify-center gap-4 hover:shadow-lg hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-200">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-100 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-800">Co-Library</span>
          </Link>
        </div>

        {/* Premium Posts Section */}
        <PremiumPostsSection />
      </div>
    </AppLayout>
  );
}
