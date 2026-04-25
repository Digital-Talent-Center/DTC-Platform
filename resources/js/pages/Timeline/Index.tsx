import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

const postActions = ['Photo', 'Video', 'Event', 'Write article'];
const postActionIcons = [
  'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 6v12.75c0 1.243 1.007 2.25 2.25 2.25z',
  'M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z',
  'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
];
const postActionColors = ['text-amber-600', 'text-green-600', 'text-blue-600', 'text-orange-600'];

const recentActivities = [
  { title: 'Math Quiz Deadline', desc: 'Due in 4 hours', color: 'bg-red-500' },
  { title: 'New Library Addition', desc: 'UI Design Principles Vol. 2', color: 'bg-amber-500' },
  { title: 'Review Meeting', desc: 'Tomorrow at 10:00 AM', color: 'bg-green-500' },
];

const biodata = [
  { label: 'NIM', value: '1234567890' },
  { label: 'FACULTY', value: 'Informatika' },
  { label: 'STUDY PROGRAM', value: 'S1 Informatika' },
  { label: 'BATCH YEAR', value: '2023' },
  { label: 'WHATSAPP', value: '08123456789' },
];

interface Comment {
  id: number;
  author: string;
  initials: string;
  text: string;
  time: string;
}

interface PostData {
  id: number;
  author: string;
  initials: string;
  role: string;
  time: string;
  content: string;
  image: boolean;
  likes: number;
  liked: boolean;
  comments: Comment[];
  showComments: boolean;
}

const initialPosts: PostData[] = [
  {
    id: 1, author: 'Arrijal Julfa Arrasyid', initials: 'AA', role: 'Student', time: '2h ago',
    content: 'Excited to announce that I\'ve completed a new task in My Tasks: "Advanced UI Research - 2024 Trends". Continuous learning is the key! 🚀',
    image: true, likes: 24, liked: false, showComments: false,
    comments: [
      { id: 1, author: 'Budi Santoso', initials: 'BS', text: 'Great work! Keep it up 🔥', time: '1h ago' },
      { id: 2, author: 'Citra Dewi', initials: 'CD', text: 'Inspiring! Can you share the resources?', time: '45m ago' },
      { id: 3, author: 'Dimas Prasetyo', initials: 'DP', text: 'Amazing progress, congrats!', time: '30m ago' },
    ],
  },
];

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
  const [posts, setPosts] = useState<PostData[]>(initialPosts);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});

  const toggleLike = (postId: number) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  };

  const toggleComments = (postId: number) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, showComments: !p.showComments } : p));
  };

  const addComment = (postId: number) => {
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;
    const newComment: Comment = { id: Date.now(), author: 'Arrijal Julfa Arrasyid', initials: 'AA', text, time: 'Just now' };
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, newComment], showComments: true } : p));
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

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
                  <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 border-4 border-white shadow-md flex items-center justify-center text-white text-lg font-bold">AA</div>
                  <h3 className="mt-3 text-base font-semibold text-gray-900">Arrijal Julfa Arrasyid</h3>
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
                  {biodata.map((item) => (
                    <div key={item.label}>
                      <p className="text-[10px] font-semibold tracking-wider text-gray-400">{item.label}</p>
                      <p className="text-sm font-medium text-gray-800">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Center Feed */}
            <div className="lg:col-span-6 space-y-5">
              {/* Create Post */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold">AA</div>
                  <input type="text" placeholder="Start a post" value={postText} onChange={(e) => setPostText(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
                </div>
                <div className="flex items-center justify-around">
                  {postActions.map((action, i) => (
                    <button key={action} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${postActionColors[i]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={postActionIcons[i]} />
                      </svg>
                      {action}
                    </button>
                  ))}
                </div>
              </div>

              {/* Posts */}
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl border border-gray-100">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold">{post.initials}</div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{post.author}</p>
                          <p className="text-xs text-gray-400">{post.role} • {post.time}</p>
                        </div>
                      </div>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed mb-4">{post.content}</p>
                    {post.image && (
                      <div className="w-full h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center">
                        <p className="text-gray-500 text-xs">Achievement Preview</p>
                      </div>
                    )}
                  </div>

                  {/* Like & Comment Stats */}
                  {(post.likes > 0 || post.comments.length > 0) && (
                    <div className="px-5 py-2 flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        {post.likes > 0 && (<><span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg></span>{post.likes}</>)}
                      </span>
                      {post.comments.length > 0 && (
                        <button onClick={() => toggleComments(post.id)} className="hover:text-gray-600 hover:underline transition-colors">
                          {post.comments.length} comment{post.comments.length !== 1 ? 's' : ''}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="px-5 py-2.5 border-t border-gray-100 flex items-center gap-1">
                    <button onClick={() => toggleLike(post.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${post.liked ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
                      <LikeIcon filled={post.liked} />
                      {post.liked ? 'Liked' : 'Like'}
                    </button>
                    <button onClick={() => toggleComments(post.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${post.showComments ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
                      <CommentIcon />
                      Comment
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
                      Share
                    </button>
                  </div>

                  {/* Comments Section */}
                  {post.showComments && (
                    <div className="border-t border-gray-100">
                      {/* Comment List */}
                      <div className="px-5 py-3 space-y-3 max-h-64 overflow-y-auto">
                        {post.comments.map((c) => (
                          <div key={c.id} className="flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">{c.initials}</div>
                            <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-semibold text-gray-900">{c.author}</p>
                                <span className="text-[10px] text-gray-400">{c.time}</span>
                              </div>
                              <p className="text-xs text-gray-600 mt-0.5">{c.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Comment Input */}
                      <div className="px-5 py-3 border-t border-gray-50 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">AA</div>
                        <div className="flex-1 flex items-center gap-2">
                          <input type="text" placeholder="Write a comment..."
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === 'Enter') addComment(post.id); }}
                            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
                          <button onClick={() => addComment(post.id)} disabled={!(commentInputs[post.id] || '').trim()}
                            className="p-1.5 text-amber-500 hover:text-amber-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Achievement Unlocked */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Achievement Unlocked</p>
                    <p className="text-xs text-gray-400">System • 5h ago</p>
                  </div>
                </div>
                <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900">Top Performer - Week 14</p>
                    <p className="text-xs text-gray-500 mt-0.5">Arrijal ranked in the top 5% of active students this week.</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 ml-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172" /></svg>
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-4">
                  <button className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3.02a.689.689 0 01.479-.655c1.04-.355 1.956.564 1.956 1.697v.383" /></svg>
                    Congratulate
                  </button>
                  <button className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314" /></svg>
                    Spread the word
                  </button>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-3 space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-bold tracking-wider text-gray-400">RECENT ACTIVITIES</p>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </button>
                </div>
                <div className="space-y-4">
                  {recentActivities.map((a, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full ${a.color} mt-1.5 flex-shrink-0`} />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{a.title}</p>
                        <p className="text-xs text-gray-400">{a.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-2 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  View All Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
    </AppLayout>
  );
}
