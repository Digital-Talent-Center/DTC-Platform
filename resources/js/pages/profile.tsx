import { useState, useEffect } from 'react';
import AppLayout from "@/layouts/app-layout";
import { Head, Link, usePage } from "@inertiajs/react";
import { api, type ProfileExtension, type Achievement, type Post } from '@/services/api';
import { type SharedData } from '@/types';
import { Trophy, Award, BookOpen, GraduationCap, Briefcase, Star, Calendar, Library, BookText, Sparkles, Bell } from 'lucide-react';

export default function ProfilePage({ userId }: { userId?: string | number }) {
  const { auth } = usePage<SharedData>().props;
  const isOwnProfile = !userId || String(userId) === String(auth.user?.id);
  const targetUserId = isOwnProfile ? auth.user?.id : userId;

  const [profile, setProfile] = useState<ProfileExtension | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingAchievements, setLoadingAchievements] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const getInitials = (name?: string) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AA';

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

  const categoryIcons: Record<string, React.ReactNode> = {
    competition: <Trophy className="w-5 h-5 text-amber-600" />,
    certification: <Award className="w-5 h-5 text-amber-600" />,
    publication: <BookOpen className="w-5 h-5 text-amber-600" />,
    scholarship: <GraduationCap className="w-5 h-5 text-amber-600" />,
    internship: <Briefcase className="w-5 h-5 text-amber-600" />,
  };

  useEffect(() => {
    if (isOwnProfile) {
      api.profile.get()
        .then(res => setProfile(res.data))
        .catch(console.error)
        .finally(() => setLoadingProfile(false));
    } else if (targetUserId) {
      api.profile.getUser(Number(targetUserId))
        .then(res => setProfile(res.data))
        .catch(console.error)
        .finally(() => setLoadingProfile(false));
    } else {
      setLoadingProfile(false);
    }

    if (targetUserId) {
      api.achievements.list({ status: 'approved', user_id: targetUserId })
        .then(res => setAchievements(res.data.slice(0, 3)))
        .catch(console.error)
        .finally(() => setLoadingAchievements(false));

      api.posts.list(1, 5, { user_id: targetUserId as number })
        .then(res => setPosts(res.data))
        .catch(console.error)
        .finally(() => setLoadingPosts(false));
    } else {
      setLoadingAchievements(false);
      setLoadingPosts(false);
    }
  }, [targetUserId, isOwnProfile]);

  return (
    <AppLayout>
      <Head title="My Profile" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full">

        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-8">
          <div className="h-36 sm:h-48 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
          </div>
          <div className="px-6 sm:px-8 pb-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-14">
              {/* Avatar */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-xl border-4 border-white flex-shrink-0 overflow-hidden">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  getInitials(profile?.user?.name || (isOwnProfile ? auth.user?.name : 'User'))
                )}
              </div>
              <div className="flex-1 pb-1">
                {loadingProfile ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-8 bg-gray-200 rounded w-48" />
                    <div className="h-4 bg-gray-100 rounded w-32" />
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{profile?.user?.name || (isOwnProfile ? auth.user?.name : 'User')}</h1>
                    <span className="inline-block mt-1.5 text-base font-semibold text-amber-600 capitalize">{profile?.role || 'Student'}</span>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-3 text-sm text-gray-500">
                      {profile?.nim && <><span>NIM: {profile.nim}</span></>}
                      {profile?.faculty && <><span className="hidden sm:inline text-gray-300">•</span><span>{profile.faculty}</span></>}
                    </div>
                  </>
                )}
              </div>
              {isOwnProfile && (
                <Link href="/profile/edit" className="self-start sm:self-end inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-full shadow-sm transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                  Edit Profile
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-6 sticky top-24 self-start">
            {/* About */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-amber-500 rounded-full" />About
              </h2>
              {loadingProfile ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-full" /><div className="h-3 bg-gray-100 rounded w-5/6" /><div className="h-3 bg-gray-100 rounded w-4/6" />
                </div>
              ) : (
                <p className="text-sm text-gray-600 leading-relaxed">{profile?.about || 'No description added yet. Click "Edit Profile" to add one.'}</p>
              )}
            </div>

            {/* Info */}
            {!loadingProfile && profile && (profile.major || profile.phone) && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><span className="w-1 h-5 bg-amber-500 rounded-full" />Info</h2>
                <div className="space-y-3">
                  {profile.major && <div className="flex items-center gap-3 text-sm"><span className="text-gray-400 w-20 flex-shrink-0">Major</span><span className="text-gray-700 font-medium">{profile.major}</span></div>}
                  {profile.phone && <div className="flex items-center gap-3 text-sm"><span className="text-gray-400 w-20 flex-shrink-0">Phone</span><span className="text-gray-700 font-medium">{profile.phone}</span></div>}
                </div>
              </div>
            )}

            {/* Achievements */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><span className="w-1 h-5 bg-amber-500 rounded-full" />Achievements</h2>
                {isOwnProfile && <Link href="/dashboard/achievements" className="text-xs text-amber-600 hover:text-amber-700 font-medium">View all</Link>}
              </div>
              {loadingAchievements ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2].map(i => <div key={i} className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gray-200 flex-shrink-0" /><div className="flex-1 space-y-1"><div className="h-3 bg-gray-200 rounded w-3/4" /><div className="h-2 bg-gray-100 rounded w-1/2" /></div></div>)}
                </div>
              ) : achievements.length === 0 ? (
                <p className="text-sm text-gray-400">No approved achievements yet.</p>
              ) : (
                <div className="space-y-4">
                  {achievements.map((a) => (
                    <div key={a.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-lg flex-shrink-0">{categoryIcons[a.category] ?? <Star className="w-5 h-5 text-amber-600" />}</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{a.title}</p>
                        <p className="text-xs text-gray-400 capitalize">{a.category} • {a.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-3">
            {isOwnProfile && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2"><span className="w-1 h-5 bg-amber-500 rounded-full" />Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Submit Achievement', href: '/dashboard/achievements/new', icon: Trophy, color: 'bg-amber-50 border-amber-100 hover:border-amber-200 hover:bg-amber-100', textColor: 'text-amber-600' },
                    { label: 'My Activities', href: '/dashboard/activities', icon: Calendar, color: 'bg-purple-50 border-purple-100 hover:border-purple-200 hover:bg-purple-100', textColor: 'text-purple-600' },
                    { label: 'Co-Library', href: '/dashboard/co-library', icon: Library, color: 'bg-pink-50 border-pink-100 hover:border-pink-200 hover:bg-pink-100', textColor: 'text-pink-600' },
                    { label: 'Co-Guide', href: '/dashboard/co-guide', icon: BookText, color: 'bg-blue-50 border-blue-100 hover:border-blue-200 hover:bg-blue-100', textColor: 'text-blue-600' },
                    { label: 'Timeline', href: '/timeline', icon: Sparkles, color: 'bg-green-50 border-green-100 hover:border-green-200 hover:bg-green-100', textColor: 'text-green-600' },
                    { label: 'Notifications', href: '/notifications', icon: Bell, color: 'bg-orange-50 border-orange-100 hover:border-orange-200 hover:bg-orange-100', textColor: 'text-orange-600' },
                  ].map(item => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.label} href={item.href} className={`${item.color} rounded-xl border p-4 flex flex-col items-start gap-2 hover:shadow-sm transition-all group`}>
                        <Icon className={`w-6 h-6 ${item.textColor} group-hover:scale-110 transition-transform`} />
                        <span className={`text-xs font-bold ${item.textColor}`}>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* My Posts */}
            <div className={`bg-white rounded-2xl border border-gray-100 p-6 ${isOwnProfile ? 'mt-6' : ''}`}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><span className="w-1 h-5 bg-amber-500 rounded-full" />{isOwnProfile ? 'My Posts' : 'Posts'}</h2>
                <Link href={`/timeline?user=${btoa('user_' + targetUserId)}`} className="text-xs text-amber-600 hover:text-amber-700 font-medium">View all</Link>
              </div>

              {loadingPosts ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                        <div className="h-2 bg-gray-100 rounded w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-sm text-gray-400">{isOwnProfile ? "You haven't posted anything yet." : "No posts yet."}</p>
                  {isOwnProfile && <Link href="/timeline" className="inline-block mt-2 text-xs font-medium text-amber-600 hover:text-amber-700">Create a post</Link>}
                </div>
              ) : (
                <div className="space-y-5">
                  {posts.map(post => (
                    <div key={post.id} className="pb-5 border-b border-gray-50 last:border-0 last:pb-0">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                          {profile?.avatarUrl ? (
                            <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            getInitials(auth.user?.name)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900 truncate">{post.user?.name || profile?.user?.name || auth.user?.name}</p>
                            <span className="text-xs text-gray-400 whitespace-nowrap">{formatTime(post.createdAt)}</span>
                          </div>
                          {post.tag && <span className="inline-block px-1.5 py-0.5 mt-0.5 text-[10px] font-medium bg-amber-50 text-amber-600 rounded">{post.tag}</span>}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-3 mb-3">{post.content}</p>
                      {(() => {
                        const localMedia = (post as any).localMedia || (typeof window !== 'undefined' ? localStorage.getItem(`post_media_${post.id}`) : null);
                        const localMediaType = (post as any).localMediaType || (typeof window !== 'undefined' ? localStorage.getItem(`post_media_type_${post.id}`) : null);

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
                              className="w-full h-40 object-cover rounded-xl border border-gray-100 mb-3"
                            />
                          );
                        } else {
                          return (
                            <img
                              src={mediaUrl}
                              alt="Post media"
                              className="w-full h-40 object-cover rounded-xl border border-gray-100 mb-3"
                            />
                          );
                        }
                      })()}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                          {post.likesCount}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                          {post.commentsCount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
