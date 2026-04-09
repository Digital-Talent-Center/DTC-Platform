import { useState } from 'react';
import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";

const tabs = ['Happening', 'History'];

const events = [
  {
    id: 1,
    title: 'Rapat Persiapan Awarding ADIKARA 2025',
    organizer: 'Halo Panitia ADIKARA 2025',
    description: 'Finalisasi detail teknis untuk malam penganugerahan. Pastikan semua divisi telah mengumpulkan laporan kemajuan mingguan.',
    status: 'COMPLETED',
    statusColor: 'bg-gray-100 text-gray-600',
    date: '24 Dec 2025, 19:00 - 20:00',
    dateIcon: 'calendar',
    location: null,
    link: 'links',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    iconPath: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z',
  },
  {
    id: 2,
    title: 'Design System Workshop: Lucid Canvas',
    organizer: 'UI/UX Department',
    description: 'Exploration of the new design language. Implementing tonal layering and removing border-heavy components for the next DTC...',
    status: 'ARCHIVED',
    statusColor: 'bg-yellow-100 text-yellow-700',
    date: '15 Dec 2025, 10:00 - 12:00',
    dateIcon: 'clock',
    location: 'TULT 06.08 • Creative Hub',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    iconPath: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    id: 3,
    title: 'DTC Platform V2 Launch Sync',
    organizer: 'Product & Eng Teams',
    description: 'Final checklist before migrating to the new infrastructure. Reviewing analytics integrations and user onboarding flows.',
    status: 'COMPLETED',
    statusColor: 'bg-gray-100 text-gray-600',
    date: '02 Dec 2025, 14:00 - 15:30',
    dateIcon: 'calendar',
    location: null,
    link: 'links',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    iconPath: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z',
  },
  {
    id: 4,
    title: 'Marketing Strategy Q4 Review',
    organizer: 'Branding & Media',
    description: 'Evaluating the impact of recent social media campaigns and preparing the roadmap for January 2026 activations.',
    status: 'COMPLETED',
    statusColor: 'bg-gray-100 text-gray-600',
    date: '28 Nov 2025, 13:00 - 14:00',
    dateIcon: 'calendar',
    location: 'GKU Building • Room 402',
    iconBg: 'bg-pink-50',
    iconColor: 'text-pink-600',
    iconPath: 'M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46',
  },
  {
    id: 5,
    title: 'Community Outreach Program',
    organizer: 'CSR Division',
    description: 'Distribution of technical kits to local high schools as part of the DTC Education Initiative. Coordination for logistics.',
    status: 'COMPLETED',
    statusColor: 'bg-gray-100 text-gray-600',
    date: '20 Nov 2025, 08:00 - 16:00',
    dateIcon: 'clock',
    location: 'DTC Main Hall • Ground Floor',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    iconPath: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
  },
];

export default function ActivitiesPage() {
  const [activeTab, setActiveTab] = useState('History');

  return (
    <AppLayout>
      <Head title="Activities" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Activities & Events</h1>
          <p className="mt-2 text-gray-500">Track your ongoing and past participation in DTC events.</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 mb-8 border-b border-gray-200">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'text-amber-600 border-b-2 border-amber-500'
                  : 'text-gray-400 hover:text-gray-600'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${event.iconBg} ${event.iconColor} flex items-center justify-center`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={event.iconPath} />
                  </svg>
                </div>
                <span className={`px-3 py-1 text-[10px] font-bold tracking-wider rounded-full ${event.statusColor}`}>{event.status}</span>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">{event.title}</h3>
              <p className="text-sm font-medium text-amber-600 mb-2">{event.organizer}</p>
              <p className="text-sm text-gray-500 mb-4 line-clamp-3">{event.description}</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={event.dateIcon === 'clock' ? 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' : 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5'} />
                  </svg>
                  {event.date}
                </div>
                {event.location && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {event.location}
                  </div>
                )}
                {event.link && (
                  <div className="flex items-center gap-2 text-xs text-amber-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.07-9.07l4.5-4.5a4.5 4.5 0 016.364 6.364l-1.757 1.757" />
                    </svg>
                    {event.link}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Load More History */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Looking for older events?</p>
            <button className="px-5 py-2 text-xs font-bold tracking-wider text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
              LOAD MORE HISTORY
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
