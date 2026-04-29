import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { api, type Post, type ProfileExtension } from '@/services/api';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});

  // Load posts on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load posts
        const postsResponse = await api.posts.list(1, 10);
        setPosts(postsResponse.data.map(p => ({
          ...p,
          showComments: false,
        })));

        // Load profile
        const profileResponse = await api.profile.get();
        setProfile(profileResponse.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

  const createPost = async () => {
    if (!postText.trim()) return;

    try {
      const newPost = await api.posts.create({ content: postText });
      setPosts(prev => [{ ...newPost.data, showComments: false }, ...prev]);
      setPostText('');
    } catch (err) {
      console.error('Failed to create post:', err);
      setError('Failed to create post');
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Profile */}
          <div className="lg:col-span-3 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="h-20 bg-gradient-to-r from-amber-400 to-amber-500" />
              <div className="px-5 pb-5 -mt-8 text-center">
                <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 border-4 border-white shadow-md flex items-center justify-center text-white text-lg font-bold">
                  {getInitials(profile?.name || 'AA')}
                </div>
                <h3 className="mt-3 text-base font-semibold text-gray-900">{profile?.name || 'User'}</h3>
                <p className="text-xs text-gray-400">Student</p>
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between text-xs"><span className="text-gray-400">PROFILE VIEWS</span><span className="font-bold text-amber-600">142</span></div>
                  <div className="flex justify-between text-xs"><span className="text-gray-400">TASK COMPLETED</span><span className="font-bold text-amber-600">28</span></div>
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

          {/* Center Feed */}
          <div className="lg:col-span-6 space-y-5">
            {/* Create Post */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold">
                  {getInitials(profile?.name || 'AA')}
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
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-around flex-1">
                  {postActions.map((action, i) => (
                    <button key={action} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${postActionColors[i]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={postActionIcons[i]} />
                      </svg>
                      {action}
                    </button>
                  ))}
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

            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-gray-500">Loading posts...</p>
              </div>
            )}

            {/* Posts */}
            {!loading && posts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl border border-gray-100">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold">
                        {getInitials(post.user?.name || 'AA')}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{post.user?.name || 'Anonymous'}</p>
                        <p className="text-xs text-gray-400">Student • {formatTime(post.createdAt)}</p>
                      </div>
                    </div>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-4">{post.content}</p>
                  {post.imageUrl && (
                    <img 
                      src={post.imageUrl} 
                      alt="Post" 
                      className="w-full h-48 object-cover rounded-xl"
                    />
                  )}
                </div>

                {/* Like & Comment Stats */}
                {(post.likesCount > 0 || post.commentsCount > 0) && (
                  <div className="px-5 py-2 flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      {post.likesCount > 0 && (
                        <>
                          <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                            </svg>
                          </span>
                          {post.likesCount}
                        </>
                      )}
                    </span>
                    {post.commentsCount > 0 && (
                      <button onClick={() => toggleComments(post.id)} className="hover:text-gray-600 hover:underline transition-colors">
                        {post.commentsCount} comment{post.commentsCount !== 1 ? 's' : ''}
                      </button>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="px-5 py-2.5 border-t border-gray-100 flex items-center gap-1">
                  <button 
                    onClick={() => toggleLike(post.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${post.liked ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
                    <LikeIcon filled={post.liked || false} />
                    {post.liked ? 'Liked' : 'Like'}
                  </button>
                  <button 
                    onClick={() => toggleComments(post.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${post.showComments ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
                    <CommentIcon />
                    Comment
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                    </svg>
                    Share
                  </button>
                </div>

                {/* Comments Section */}
                {post.showComments && post.comments && post.comments.length > 0 && (
                  <div className="border-t border-gray-100">
                    <div className="px-5 py-3 space-y-3 max-h-64 overflow-y-auto">
                      {post.comments.map((c) => (
                        <div key={c.id} className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                            {getInitials(c.user?.name || 'AA')}
                          </div>
                          <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-semibold text-gray-900">{c.user?.name || 'Anonymous'}</p>
                              <span className="text-[10px] text-gray-400">{formatTime(c.createdAt)}</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-0.5">{c.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Comment Input */}
                    <div className="px-5 py-3 border-t border-gray-50 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                        {getInitials(profile?.name || 'AA')}
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
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">No Activities</p>
                    <p className="text-xs text-gray-400">Check back later</p>
                  </div>
                </div>
              </div>
              <Link 
                href={route('dashboard.activities')}
                className="block w-full mt-4 py-2 text-center text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View All Calendar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
