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

const suggestions = [
  { title: 'Prototyping in Figma', desc: 'Recommended Course' },
  { title: 'JS ES12 Essentials', desc: 'Based on your activity' },
];

const communities = [
  { name: 'Design Collective', color: 'bg-pink-100 text-pink-600' },
  { name: 'Dev Trackers', color: 'bg-green-100 text-green-600' },
];

export default function TimelineIndex() {
  const [postText, setPostText] = useState('');

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
                    AA
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-gray-900">Arrijal Julfa Arrasyid</h3>
                  <p className="text-xs text-gray-400">Student</p>
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">PROFILE VIEWS</span>
                      <span className="font-bold text-amber-600">142</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">TASK COMPLETED</span>
                      <span className="font-bold text-amber-600">28</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-[10px] font-bold tracking-wider text-gray-400 mb-3">MY COMMUNITIES</p>
                <div className="space-y-3">
                  {communities.map((c) => (
                    <div key={c.name} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${c.color} flex items-center justify-center`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{c.name}</span>
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

              {/* Post */}
              <div className="bg-white rounded-2xl border border-gray-100">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold">AA</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Arrijal Julfa Arrasyid</p>
                        <p className="text-xs text-gray-400">Student • 2h ago</p>
                      </div>
                    </div>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-4">
                    Excited to announce that I&apos;ve completed a new task in <span className="font-semibold underline">My Tasks</span>: &quot;Advanced UI Research - 2024 Trends&quot;. Continuous learning is the key! 🚀
                  </p>
                  <div className="w-full h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center">
                    <p className="text-gray-500 text-xs">Achievement Preview</p>
                  </div>
                </div>
                <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    {['Like', 'Comment', 'Share'].map((action) => (
                      <button key={action} className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={
                            action === 'Like' ? 'M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3.02a.689.689 0 01.479-.655c1.04-.355 1.956.564 1.956 1.697v.383a4.5 4.5 0 01-.87 2.666c-.207.286-.263.653-.122.977l.126.291c.205.475.626.81 1.112.882l3.72.53a2.25 2.25 0 011.906 2.422l-.518 5.172a2.25 2.25 0 01-.942 1.596l-2.37 1.694a1.5 1.5 0 01-1.094.28l-4.48-.64a2.25 2.25 0 01-1.19-.613l-.798-.813a1.874 1.874 0 00-2.578-.084l-.447.415a4.5 4.5 0 01-6.067.234L3 18.75' :
                            action === 'Comment' ? 'M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z' :
                            'M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z'
                          } />
                        </svg>
                        {action}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] font-medium text-gray-400 tracking-wider">24 LIKES • 3 COMMENTS</span>
                </div>
              </div>

              {/* Achievement Unlocked */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172" />
                    </svg>
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
              {/* Recent Activities */}
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

              {/* Suggested For You */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-[10px] font-bold tracking-wider text-gray-400 mb-4">SUGGESTED FOR YOU</p>
                <div className="space-y-4">
                  {suggestions.map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347" /></svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                          <p className="text-xs text-gray-400">{s.desc}</p>
                        </div>
                      </div>
                      <button className="w-7 h-7 rounded-full border border-green-300 text-green-500 flex items-center justify-center hover:bg-green-50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
    </AppLayout>
  );
}
