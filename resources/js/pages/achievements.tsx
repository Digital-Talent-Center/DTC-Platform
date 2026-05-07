import { useState } from 'react';
import { Link, Head } from '@inertiajs/react';
import AppLayout from "@/layouts/app-layout";

const tabs = ['Achievement Collection', 'Need Approval', 'Rejected'];

const achievements = [
  {
    id: 1,
    title: 'Juara 1 Hackathon Nasional',
    description: 'Ini Contoh Prestasi',
    category: 'HIGH PRIORITY',
    categoryColor: 'bg-amber-100 text-amber-700',
    link: 'apps.helloprodigi.web.id',
    date: '30 Nov 2025',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    iconPath: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
    avatars: ['AA', 'BB'],
    status: 'approved',
  },
  {
    id: 2,
    title: 'Social Media Strategy Q4',
    description: 'Finalize the content calendar for DTC holiday campaign across all channels.',
    category: 'MARKETING',
    categoryColor: 'bg-green-100 text-green-700',
    link: 'dtc-internal.docs.com/strategy',
    date: '15 Dec 2025',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    iconPath: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
    avatars: ['CC'],
    extraAvatars: 3,
    status: 'pending',
  },
  {
    id: 3,
    title: 'API Documentation Refactor',
    description: 'Update swagger endpoints for the new microservices architecture version 2.4.',
    category: 'ENGINEERING',
    categoryColor: 'bg-blue-100 text-blue-700',
    link: 'github.com/dtc-tech/core-api',
    date: '05 Jan 2026',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    iconPath: 'M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5',
    avatars: ['DD'],
    status: 'rejected',
  },
];

const featuredAchievement = {
  id: 4,
  title: 'Annual General Meeting Presentation',
  description: 'Drafting the key performance indicators and growth projections for the upcoming AGM at Jakarta HQ.',
  category: 'WORKSHOP',
  categoryColor: 'bg-amber-100 text-amber-700',
  location: 'Jakarta, Indonesia',
  date: '28 Nov 2025',
  dueLabel: 'DUE IN 2 DAYS',
};

export default function AchievementsPage() {
  const [activeTab, setActiveTab] = useState('Achievement Collection');

  const filteredAchievements = achievements.filter(item => {
    if (activeTab === 'Achievement Collection') return item.status === 'approved';
    if (activeTab === 'Need Approval') return item.status === 'pending';
    if (activeTab === 'Rejected') return item.status === 'rejected';
    return false;
  });

  return (
    <AppLayout>
      <Head title="My Achievements" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">My Achievements</h1>
          <p className="mt-2 text-gray-500">Manage your ongoing projects and review assignments within the DTC ecosystem.</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                activeTab === tab
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Achievement Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAchievements.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.iconPath} />
                    </svg>
                  </div>
                  <span className={`px-3 py-1 text-[10px] font-bold tracking-wider rounded-full ${item.categoryColor}`}>{item.category}</span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{item.description}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-amber-600 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.07-9.07l4.5-4.5a4.5 4.5 0 016.364 6.364l-1.757 1.757" />
                  </svg>
                  {item.link}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  {item.date}
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                  <div className="flex -space-x-2">
                    {item.avatars.map((a, i) => (
                      <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 border-2 border-white flex items-center justify-center text-[9px] font-bold text-white">{a}</div>
                    ))}
                    {item.extraAvatars && (
                      <div className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[9px] font-medium text-gray-500">+{item.extraAvatars}</div>
                    )}
                  </div>
                  <button className="px-4 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">Review Task</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Card */}
        {activeTab === 'Achievement Collection' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col sm:flex-row gap-5 mt-5">
            <div className="flex-shrink-0 w-full sm:w-48 h-40 rounded-xl bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-green-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 7.5h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 text-[10px] font-bold tracking-wider rounded-full ${featuredAchievement.categoryColor}`}>{featuredAchievement.category}</span>
                <span className="flex items-center gap-1 text-[10px] font-medium text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {featuredAchievement.dueLabel}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{featuredAchievement.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{featuredAchievement.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                  {featuredAchievement.location}
                </span>
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                  {featuredAchievement.date}
                </span>
              </div>
              <button className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-full shadow-sm transition-all">Upload Final Deck</button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
