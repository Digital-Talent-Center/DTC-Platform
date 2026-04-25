import { useState } from 'react';
import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";

export default function ProfilePage() {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(12);

  const profileData = {
    name: 'Arrijal Julfa Arrasyid',
    role: 'HUMAN CAPITAL',
    roleColor: 'bg-amber-500 text-white',
    email: 'arrijal.julfa@dtc.web',
    nim: '202488192',
    faculty: 'Faculty of Social Sciences',
    about: 'Passionate Human Capital professional with a focus on organizational development and talent acquisition. Dedicated to building inclusive workspaces where innovation thrives and individuals reach their full potential.',
  };

  const achievements = [
    { title: '1st Place HC Competition', desc: 'Regional Talent Strategy 2023', icon: '🏆' },
    { title: 'Best Delegate Award', desc: 'Youth Leadership Summit 2024', icon: '🏅' },
    { title: "Dean's List Honoree", desc: 'Top 5% Academic Excellence', icon: '📜' },
  ];

  const toggleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  return (
    <AppLayout>
      <Head title="My Profile" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full">

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-8">
          {/* Cover */}
          <div className="h-36 sm:h-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          </div>

          {/* Profile Info */}
          <div className="px-6 sm:px-8 pb-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-14">
              {/* Avatar */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-xl border-4 border-white flex-shrink-0">
                AA
              </div>

              {/* Name & Info */}
              <div className="flex-1 pb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{profileData.name}</h1>
                <span className={`inline-block mt-1.5 px-3 py-1 text-[10px] font-bold tracking-wider rounded-full ${profileData.roleColor}`}>
                  {profileData.role}
                </span>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                    {profileData.email}
                  </span>
                  <span className="text-gray-300 hidden sm:inline">•</span>
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" /></svg>
                    NIM: {profileData.nim}
                  </span>
                  <span className="text-gray-300 hidden sm:inline">•</span>
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" /></svg>
                    {profileData.faculty}
                  </span>
                </div>
              </div>

              {/* Edit Profile Button */}
              <Link href="/profile/edit" className="self-start sm:self-end inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-full shadow-sm transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-amber-500 rounded-full" />
                About
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">{profileData.about}</p>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-amber-500 rounded-full" />
                Achievements
              </h2>
              <div className="space-y-4">
                {achievements.map((a, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-lg flex-shrink-0">
                      {a.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{a.title}</p>
                      <p className="text-xs text-gray-400">{a.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column — Recent Activity */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-1 h-5 bg-amber-500 rounded-full" />
                  Recent Activity
                </h2>
                <button className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors">View all</button>
              </div>

              {/* Post */}
              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                {/* Post Header */}
                <div className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold">AA</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Arrijal Julfa Arrasyid</p>
                    <p className="text-xs text-gray-400">Posted • 2h ago</p>
                  </div>
                </div>

                {/* Post Content */}
                <div className="px-4 pb-3">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Just finished a remarkable workshop on &quot;Digital Transformation in Human Capital Management&quot;. Exciting times ahead for the industry! 🚀
                  </p>
                </div>

                {/* Post Image */}
                <div className="w-full h-56 sm:h-72 bg-gradient-to-br from-amber-800 via-amber-900 to-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-amber-600/40 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 6v12.75c0 1.243 1.007 2.25 2.25 2.25z" /></svg>
                    <p className="text-amber-600/50 text-xs">Workshop Photo</p>
                  </div>
                </div>

                {/* Post Actions */}
                <div className="px-4 py-3 flex items-center gap-1 border-t border-gray-100">
                  <button onClick={toggleLike}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${liked ? 'text-red-500 bg-red-50' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3.02a.689.689 0 01.479-.655c1.04-.355 1.956.564 1.956 1.697v.383a4.5 4.5 0 01-.87 2.666c-.207.286-.263.653-.122.977l.126.291c.205.475.626.81 1.112.882l3.72.53a2.25 2.25 0 011.906 2.422l-.518 5.172a2.25 2.25 0 01-.942 1.596l-2.37 1.694a1.5 1.5 0 01-1.094.28l-4.48-.64a2.25 2.25 0 01-1.19-.613l-.798-.813a1.874 1.874 0 00-2.578-.084l-.447.415a4.5 4.5 0 01-6.067.234L3 18.75" /></svg>
                    Like{likeCount > 0 && ` (${likeCount})`}
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" /></svg>
                    Comment
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
