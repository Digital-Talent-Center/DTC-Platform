import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { api, type Post, type ProfileExtension, type Activity } from '@/services/api';
import { Link } from '@inertiajs/react';

const postActions = ['Photo', 'Video', 'Event', 'Write article'];
const postActionIcons = [
  'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 6v12.75c0 1.243 1.007 2.25 2.25 2.25z',
  'M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z',
  'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0121 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
];
const postActionColors = ['text-amber-600', 'text-green-600', 'text-blue-600', 'text-orange-600'];

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

function getBatchYear(nim?: string) {
  if (!nim || nim.length < 7) return '-';
  return `20${nim.slice(5, 7)}`;
}

interface PostWithUI extends Post {
  showComments?: boolean;
  liked?: boolean;
}

type ProfileWithStudyProgram = ProfileExtension & {
  studyProgram?: string;
};

// ─── Like Icon ──────────────────────────────
const LikeIcon = ({ filled }: { filled: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

// ─── Comment Icon ───────────────────────────
const CommentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
  </svg>
);

export default function TimelineIndex() {
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState<PostWithUI[]>([]);
  const [profile, setProfile] = useState<ProfileExtension | null>(null);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});

  const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  let userIdParam = urlParams.get('user');
  if (userIdParam) {
    try {
      const decoded = atob(userIdParam);
      if (decoded.startsWith('user_')) {
        userIdParam = decoded.replace('user_', '');
      }
    } catch (e) {
      // keep original if not base64
    }
  }

  // Media attachments & tags
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [tag, setTag] = useState('');
  const [activeAttachType, setActiveAttachType] = useState<'photo' | 'video' | 'event' | 'article' | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImageUrl(objectUrl);
  };

  // Dropdown & Reporting States
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [reportingPostId, setReportingPostId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState('inappropriate_content');
  const [reportDescription, setReportDescription] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // Load posts on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load posts
        const postsResponse = await api.posts.list(1, 10, userIdParam ? { user_id: Number(userIdParam) } : undefined);
        const postsList = Array.isArray(postsResponse.data) ? postsResponse.data : (postsResponse.data as any).data || [];
        
        setPosts(postsList.map((p: any) => ({
          ...p,
          showComments: false,
        })));

        // Load profile
        const profileResponse = userIdParam ? await api.profile.getUser(Number(userIdParam)) : await api.profile.get();
        setProfile(profileResponse.data);

        // Load recent activities
        if (!userIdParam) {
          try {
            const activitiesResponse = await api.activities.list();
            setRecentActivities(activitiesResponse.data.slice(0, 5));
          } catch (actErr) {
            console.error('Failed to load recent activities:', actErr);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getProfileUrl = (id?: number) => {
    if (!id) return '#';
    const myId = profile?.userId || profile?.user?.id;
    return myId === id ? '/profile' : `/profile/${btoa('user_' + id)}`;
  };

  const toggleLike = async (postId: number) => {
    try {
      await api.posts.like(postId);
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              liked: !p.liked, 
              likesCount: p.liked ? p.likesCount - 1 : p.likesCount + 1 
            } 
          : p
      ));
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const toggleComments = (postId: number) => {
    setPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, showComments: !p.showComments } : p
    ));
  };

  const addComment = async (postId: number) => {
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;

    try {
      await api.comments.create(postId, { content: text });
      // Reload the post to get updated comments
      const updatedPost = await api.posts.get(postId);
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...updatedPost.data, showComments: true } 
          : p
      ));
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const deleteComment = async (postId: number, commentId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus komentar ini?')) return;
    try {
      await api.comments.delete(postId, commentId);
      // Reload the post to get updated comments
      const updatedPost = await api.posts.get(postId);
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...updatedPost.data, showComments: true } 
          : p
      ));
    } catch (err) {
      console.error('Failed to delete comment:', err);
      alert('Gagal menghapus komentar');
    }
  };

  const createPost = async () => {
    if (!postText.trim()) return;

    try {
      let newPost;
      // Send a placeholder or dummy URL to backend to pass VARCHAR(500) validation
      let dummyUrl = undefined;
      if (imageFile) {
        if (activeAttachType === 'photo') {
          dummyUrl = 'https://images.unsplash.com/photo-placeholder-local';
        } else if (activeAttachType === 'video') {
          dummyUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
        }
      } else if (imageUrl.trim()) {
        dummyUrl = imageUrl.trim();
      }

      newPost = await api.posts.create({ 
        content: postText,
        image_url: dummyUrl,
        tag: tag.trim() || undefined
      } as any);
      
      const createdData = newPost.data;
      
      // Save local file to localStorage if selected
      if (imageFile && createdData?.id) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          try {
            localStorage.setItem(`post_media_${createdData.id}`, base64String);
            localStorage.setItem(`post_media_type_${createdData.id}`, activeAttachType || 'photo');
            // Update posts state to immediately show local media
            setPosts(prev => prev.map(p => 
              p.id === createdData.id ? { ...p, localMedia: base64String, localMediaType: activeAttachType } : p
            ));
          } catch (e) {
            console.error('LocalStorage media save error:', e);
          }
        };
        reader.readAsDataURL(imageFile);
      }
      
      setPosts(prev => [{ ...createdData, showComments: false }, ...prev]);
      setPostText('');
      setImageUrl('');
      setImageFile(null);
      setTag('');
      setActiveAttachType(null);
    } catch (err) {
      console.error('Failed to create post:', err);
      setError('Failed to create post');
    }
  };

  const deletePost = async (postId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus postingan ini?')) return;
    try {
      await api.posts.delete(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      setOpenDropdownId(null);
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert('Gagal menghapus postingan');
    }
  };

  const submitReport = async () => {
    if (!reportingPostId) return;
    setSubmittingReport(true);
    try {
      const getCsrfToken = () => {
        const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
        return match ? decodeURIComponent(match[1]) : '';
      };
      const token = getCsrfToken() || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': token,
          'X-CSRF-TOKEN': token,
        },
        body: JSON.stringify({
          post_id: reportingPostId,
          reason: reportReason,
          description: reportDescription,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to submit report');
      }

      alert('Laporan berhasil dikirim dan akan segera ditinjau oleh admin.');
      setReportingPostId(null);
      setReportReason('inappropriate_content');
      setReportDescription('');
    } catch (err: any) {
      console.error('Failed to report post:', err);
      alert(err.message || 'Gagal melaporkan postingan.');
    } finally {
      setSubmittingReport(false);
    }
  };

  if (error) {
    return (
      <AppLayout>
        <Head title="Timeline" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Head title="Timeline" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={userIdParam ? "flex flex-col items-center" : "grid grid-cols-1 lg:grid-cols-12 gap-6"}>
          {/* Left Sidebar - Profile */}
          {!userIdParam && (
          <div className="lg:col-span-3 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="h-20 bg-gradient-to-r from-amber-400 to-amber-500" />
              <div className="px-5 pb-5 -mt-8 text-center">
                <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 border-4 border-white shadow-md flex items-center justify-center text-white text-lg font-bold overflow-hidden">
                  {(profile?.avatarUrl || (profile as any)?.avatar_url) ? <img src={profile?.avatarUrl || (profile as any)?.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : getInitials(profile?.user?.name || 'AA')}
                </div>
                <h3 className="mt-3 text-base font-semibold text-gray-900">{profile?.user?.name || 'User'}</h3>
                <p className="text-xs text-gray-400 capitalize">{profile?.role || 'Student'}</p>
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between text-xs"><span className="text-gray-400">TOTAL POSTS</span><span className="font-bold text-amber-600">{profile?.postsCount ?? (profile as any)?.posts_count ?? 0}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-gray-400">TASK COMPLETED</span><span className="font-bold text-amber-600">{profile?.completedTasksCount ?? (profile as any)?.completed_tasks_count ?? 0}</span></div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-[10px] font-bold tracking-wider text-gray-400 mb-3">BIODATA</p>
              <div className="space-y-3">
                {profile ? (
                  <>
                    <div>
                      <p className="text-[10px] font-semibold tracking-wider text-gray-400">NIM</p>
                      <p className="text-sm font-medium text-gray-800">{profile.nim || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold tracking-wider text-gray-400">FACULTY</p>
                      <p className="text-sm font-medium text-gray-800">{profile.faculty || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold tracking-wider text-gray-400">STUDY PROGRAM</p>
                      <p className="text-sm font-medium text-gray-800">{profile.major || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold tracking-wider text-gray-400">BATCH YEAR</p>
                      <p className="text-sm font-medium text-gray-800">
                        {getBatchYear(profile?.nim)}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-500">Loading...</p>
                )}
              </div>
            </div>
          </div>
          )}

          {/* Center Feed */}
          <div className={`space-y-5 ${userIdParam ? 'w-full max-w-2xl' : 'lg:col-span-6'}`}>
            {userIdParam && (
              <div className="mb-2">
                <Link 
                  href={`/profile/${btoa('user_' + userIdParam)}`} 
                  className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-amber-600 transition-colors bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Profile
                </Link>
              </div>
            )}

            {/* Create Post */}
            {!userIdParam && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                  {(profile?.avatarUrl || (profile as any)?.avatar_url) ? <img src={profile?.avatarUrl || (profile as any)?.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : getInitials(profile?.user?.name || 'AA')}
                </div>
                <input 
                  type="text" 
                  placeholder="Start a post" 
                  value={postText} 
                  onChange={(e) => setPostText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); createPost(); } }}
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" 
                />
              </div>

              {/* Conditional attachment inputs */}
              {(activeAttachType === 'photo' || activeAttachType === 'video') && (
                <div className="mt-2 mb-4 p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">
                      UPLOAD {activeAttachType === 'photo' ? 'FOTO' : 'VIDEO'} DARI DEVICE
                    </p>
                    {(imageFile || imageUrl) && (
                      <button 
                        onClick={() => { setImageFile(null); setImageUrl(''); }} 
                        className="text-xs text-red-500 hover:text-red-600 font-semibold"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  
                  {/* Clickable Drag & Drop Zone */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 hover:border-amber-400 hover:bg-amber-50/10 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 min-h-[140px] relative overflow-hidden bg-white"
                  >
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept={activeAttachType === 'photo' ? 'image/*' : 'video/*'}
                      className="hidden"
                    />

                    {imageUrl ? (
                      activeAttachType === 'photo' ? (
                        <div className="w-full flex justify-center relative">
                          <img src={imageUrl} alt="Preview" className="max-h-[180px] object-contain rounded-lg shadow-sm" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                            <span className="text-white text-xs font-semibold">Ganti Gambar</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full flex justify-center relative text-center">
                          <video src={imageUrl} controls className="max-h-[180px] object-contain rounded-lg shadow-sm mx-auto" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg pointer-events-none">
                            <span className="text-white text-xs font-semibold animate-in">Ganti Video</span>
                          </div>
                        </div>
                      )
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                          {activeAttachType === 'photo' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-gray-700">
                          Klik untuk memilih {activeAttachType === 'photo' ? 'Foto' : 'Video'} dari device
                        </p>
                        <p className="text-[10px] text-gray-400">
                          Mendukung file gambar PNG, JPG, JPEG atau video MP4
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
              {(activeAttachType === 'article' || activeAttachType === 'event') && (
                <div className="mt-2 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <input 
                    type="text" 
                    placeholder={
                      activeAttachType === 'event' ? "Masukkan Tag Kegiatan (e.g. Seminar, Workshop)" :
                      "Masukkan Tag Artikel (e.g. Artikel, Riset)"
                    } 
                    value={tag} 
                    onChange={(e) => setTag(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-400" 
                  />
                  <button onClick={() => { setTag(''); setActiveAttachType(null); }} className="text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center justify-around flex-1">
                  {postActions.map((action, i) => {
                    const isSelected = (action === 'Photo' && activeAttachType === 'photo') || 
                                     (action === 'Video' && activeAttachType === 'video') || 
                                     (action === 'Event' && activeAttachType === 'event') || 
                                     (action === 'Write article' && activeAttachType === 'article');
                    return (
                      <button 
                        key={action} 
                        onClick={() => {
                          if (action === 'Photo') setActiveAttachType(prev => prev === 'photo' ? null : 'photo');
                          else if (action === 'Video') setActiveAttachType(prev => prev === 'video' ? null : 'video');
                          else if (action === 'Event') {
                            setActiveAttachType(prev => prev === 'event' ? null : 'event');
                            setTag('Event');
                          }
                          else if (action === 'Write article') {
                            setActiveAttachType(prev => prev === 'article' ? null : 'article');
                            setTag('Article');
                          }
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${isSelected ? 'bg-amber-50 text-amber-600' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${postActionColors[i]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={postActionIcons[i]} />
                        </svg>
                        {action}
                      </button>
                    );
                  })}
                </div>
                <button 
                  onClick={createPost}
                  disabled={!postText.trim()}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 rounded-lg transition-colors"
                >
                  Post
                </button>
              </div>
            </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-gray-500">Loading posts...</p>
              </div>
            )}

            {/* Posts */}
            {!loading && posts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl border border-gray-100 relative">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Link href={getProfileUrl(post.userId || post.user?.id)} className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-amber-300 transition-all">
                        {(post.user?.profileExtension?.avatarUrl || (post.user as any)?.profile_extension?.avatar_url) ? <img src={post.user?.profileExtension?.avatarUrl || (post.user as any)?.profile_extension?.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : getInitials(post.user?.name || 'AA')}
                      </Link>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Link href={getProfileUrl(post.userId || post.user?.id)} className="text-sm font-semibold text-gray-900 hover:text-amber-600 hover:underline">{post.user?.name || 'Anonymous'}</Link>
                          {post.tag && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-700 rounded-md capitalize">
                              {post.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">Student • {formatTime(post.createdAt || (post as any).created_at || new Date().toISOString())}</p>
                      </div>
                    </div>

                    {/* Three dots dropdown */}
                    <div className="relative">
                      <button 
                        onClick={() => setOpenDropdownId(openDropdownId === post.id ? null : post.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                        </svg>
                      </button>

                      {openDropdownId === post.id && (
                        <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl border border-gray-100 shadow-lg py-1.5 z-10 animate-in fade-in slide-in-from-top-1 duration-150">
                          {post.userId === profile?.userId ? (
                            <button 
                              onClick={() => deletePost(post.id)}
                              className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 font-medium transition-colors flex items-center gap-1.5"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                              Hapus Post
                            </button>
                          ) : (
                            <button 
                              onClick={() => {
                                setReportingPostId(post.id);
                                setOpenDropdownId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 font-medium transition-colors flex items-center gap-1.5"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
                              </svg>
                              Laporkan Post
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-4">{post.content}</p>
                  {(() => {
                    const localMedia = (post as any).localMedia || localStorage.getItem(`post_media_${post.id}`);
                    const localMediaType = (post as any).localMediaType || localStorage.getItem(`post_media_type_${post.id}`);
                    
                    const mediaUrl = localMedia || post.imageUrl || (post as any).image_url;
                    if (!mediaUrl) return null;
                    
                    const isVideo = localMediaType === 'video' || 
                                    (!localMedia && mediaUrl.match(/\.(mp4|webm|ogg)$/i)) ||
                                    mediaUrl.startsWith('data:video/') ||
                                    mediaUrl.includes('mov_bbb.mp4');

                    if (isVideo) {
                      return (
                        <video 
                          src={mediaUrl} 
                          controls
                          className="w-full max-h-[350px] object-cover rounded-xl border border-gray-100"
                        />
                      );
                    } else {
                      return (
                        <img 
                          src={mediaUrl} 
                          alt="Post" 
                          className="w-full max-h-[350px] object-cover rounded-xl border border-gray-100"
                        />
                      );
                    }
                  })()}
                </div>

                {/* Like & Comment Stats */}
                {((post.likesCount ?? (post as any).likes_count ?? 0) > 0 || (post.commentsCount ?? (post as any).comments_count ?? 0) > 0) && (
                  <div className="px-5 py-2 flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      {(post.likesCount ?? (post as any).likes_count ?? 0) > 0 && (
                        <>
                          <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                            </svg>
                          </span>
                          {post.likesCount ?? (post as any).likes_count ?? 0}
                        </>
                      )}
                    </span>
                    {(post.commentsCount ?? (post as any).comments_count ?? 0) > 0 && (
                      <button onClick={() => toggleComments(post.id)} className="hover:text-gray-600 hover:underline transition-colors">
                        {post.commentsCount ?? (post as any).comments_count ?? 0} comment{(post.commentsCount ?? (post as any).comments_count ?? 0) !== 1 ? 's' : ''}
                      </button>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="px-5 py-2.5 border-t border-gray-100 flex items-center gap-1">
                  <button 
                    onClick={() => toggleLike(post.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${(post.liked || (post as any).is_liked_by_user) ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
                    <LikeIcon filled={(post.liked || (post as any).is_liked_by_user) || false} />
                    {(post.liked || (post as any).is_liked_by_user) ? 'Liked' : 'Like'}
                  </button>
                  <button 
                    onClick={() => toggleComments(post.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${post.showComments ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
                    <CommentIcon />
                    Comment
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/timeline?post=${post.id}`);
                      alert('Link postingan berhasil disalin ke clipboard!');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                    </svg>
                    Share
                  </button>
                </div>

                {/* Comments Section */}
                {post.showComments && (
                  <div className="border-t border-gray-100">
                    {post.comments && post.comments.length > 0 && (
                      <div className="px-5 py-3 space-y-3 max-h-64 overflow-y-auto border-b border-gray-50">
                        {post.comments.map((c) => (
                          <div key={c.id} className="flex items-start gap-2.5">
                            <Link href={getProfileUrl(c.userId || c.user?.id)} className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0 overflow-hidden hover:ring-2 hover:ring-gray-300 transition-all">
                              {(c.user?.profileExtension?.avatarUrl || (c.user as any)?.profile_extension?.avatar_url) ? <img src={c.user?.profileExtension?.avatarUrl || (c.user as any)?.profile_extension?.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : getInitials(c.user?.name || 'AA')}
                            </Link>
                            <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <Link href={getProfileUrl(c.userId || c.user?.id)} className="text-xs font-semibold text-gray-900 hover:text-amber-600 hover:underline">{c.user?.name || 'Anonymous'}</Link>
                                  <span className="text-[10px] text-gray-400">{formatTime(c.createdAt || (c as any).created_at)}</span>
                                </div>
                                {(c.userId === (profile?.userId || profile?.user?.id) || post.userId === (profile?.userId || profile?.user?.id)) && (
                                  <button 
                                    onClick={() => deleteComment(post.id, c.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-0.5"
                                    title="Hapus komentar"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mt-0.5">{c.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Comment Input */}
                    <div className="px-5 py-3 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0 overflow-hidden">
                        {(profile?.avatarUrl || (profile as any)?.avatar_url) ? <img src={profile?.avatarUrl || (profile as any)?.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : getInitials(profile?.user?.name || 'AA')}
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <input 
                          type="text" 
                          placeholder="Write a comment..."
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === 'Enter') addComment(post.id); }}
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" 
                        />
                        <button 
                          onClick={() => addComment(post.id)} 
                          disabled={!(commentInputs[post.id] || '').trim()}
                          className="p-1.5 text-amber-500 hover:text-amber-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {!loading && posts.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-gray-500">No posts yet. Be the first to share!</p>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          {!userIdParam && (
          <div className="lg:col-span-3 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold tracking-wider text-gray-400">RECENT ACTIVITIES</p>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        activity.status === 'completed' ? 'bg-green-500' :
                        activity.status === 'in_progress' ? 'bg-blue-500' :
                        'bg-amber-500'
                      }`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{activity.title}</p>
                        <p className="text-xs text-gray-400 capitalize">{activity.type} • {formatTime(activity.activityDate || activity.createdAt)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">No Activities</p>
                      <p className="text-xs text-gray-400">Check back later</p>
                    </div>
                  </div>
                )}
              </div>
              <Link 
                href="/dashboard/activities"
                className="block w-full mt-4 py-2 text-center text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View All Calendar
              </Link>
            </div>
          </div>
          )}
        </div>
      </div>

      {reportingPostId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Laporkan Postingan
              </h3>
              <button 
                onClick={() => setReportingPostId(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-1.5">ALASAN PELAPORAN</label>
                <select 
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="inappropriate_content">Konten Tidak Pantas</option>
                  <option value="spam">Spam / Iklan Mengganggu</option>
                  <option value="harassment">Pelecehan / Perundungan</option>
                  <option value="false_information">Informasi Palsu / Hoaks</option>
                  <option value="copyright_violation">Pelanggaran Hak Cipta</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-1.5">DESKRIPSI (OPSIONAL)</label>
                <textarea 
                  rows={3}
                  placeholder="Berikan detail tambahan tentang laporan Anda..."
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50">
                <button 
                  onClick={() => setReportingPostId(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50 rounded-lg"
                >
                  Batal
                </button>
                <button 
                  onClick={submitReport}
                  disabled={submittingReport}
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 rounded-lg shadow-sm"
                >
                  {submittingReport ? 'Mengirim...' : 'Kirim Laporan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
