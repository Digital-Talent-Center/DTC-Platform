import { useState, useEffect } from 'react';
import { Link, Head } from '@inertiajs/react';
import AppLayout from "@/layouts/app-layout";
import axios from 'axios';

const tabs = ['Achievement Collection', 'Need Approval', 'Rejected'];

interface Achievement {
  id: number;
  nim: string;
  nama_lengkap: string;
  title: string;
  description: string;
  category: string;
  jenis: string;
  tingkat: string;
  keikutsertaan: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  link_sertifikat?: string;
  bukti_path?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

const getCategoryStyles = (category: string) => {
  const cat = (category || 'Lainnya').toUpperCase();
  if (cat.includes('KOMPETISI') || cat.includes('COMPETITION') || cat.includes('PRESTASI')) {
    return {
      bg: 'bg-amber-50',
      color: 'text-amber-500',
      badge: 'bg-amber-100 text-amber-700'
    };
  }
  if (cat.includes('AKADEMIK') || cat.includes('ACADEMIC') || cat.includes('SEMINAR') || cat.includes('WORKSHOP') || cat.includes('KONFERENSI')) {
    return {
      bg: 'bg-blue-50',
      color: 'text-blue-500',
      badge: 'bg-blue-100 text-blue-700'
    };
  }
  return {
    bg: 'bg-purple-50',
    color: 'text-purple-500',
    badge: 'bg-purple-100 text-purple-700'
  };
};

export default function AchievementsPage() {
  const [activeTab, setActiveTab] = useState('Achievement Collection');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch achievements from API
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/achievements');
        const data = response.data;
        
        // Handle paginated response
        const list = data.data?.data || data.data || [];
        setAchievements(Array.isArray(list) ? list : []);
        setError('');
      } catch (err: any) {
        console.error('Error fetching achievements:', err);
        setError(err.message);
        setAchievements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const filteredAchievements = achievements.filter(item => {
    if (activeTab === 'Achievement Collection') return item.status === 'approved';
    if (activeTab === 'Need Approval') return item.status === 'pending';
    if (activeTab === 'Rejected') return item.status === 'rejected';
    return false;
  });

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'approved':
        return { categoryColor: 'bg-green-100 text-green-700', label: 'Approved' };
      case 'pending':
        return { categoryColor: 'bg-yellow-100 text-yellow-700', label: 'Pending' };
      case 'rejected':
        return { categoryColor: 'bg-red-100 text-red-700', label: 'Rejected' };
      default:
        return { categoryColor: 'bg-gray-100 text-gray-700', label: status };
    }
  };

  const getAchievementIcon = (tingkat: string) => {
    const icons: { [key: string]: string } = {
      'Internasional': 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
      'Nasional': 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
      'Regional': 'M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5',
    };
    return icons[tingkat] || icons['Internasional'];
  };

  const latestApproved = achievements.find(item => item.status === 'approved');

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">My Achievements</h1>
              <p className="mt-2 text-gray-500">Manage your ongoing projects and review assignments within the DTC ecosystem.</p>
            </div>
            <Link
              href="/dashboard/achievements/new"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full shadow-sm text-sm transition-all"
            >
              Submit Achievement
            </Link>
          </div>
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
          {loading ? (
            <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500">
              Loading achievements...
            </div>
          ) : filteredAchievements.length > 0 ? (
            filteredAchievements.map((item) => {
              const styles = getCategoryStyles(item.category);
              const initials = item.nama_lengkap 
                ? item.nama_lengkap.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() 
                : 'AA';
              const dateLabel = item.tanggal_mulai 
                ? `${new Date(item.tanggal_mulai).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})} - ${new Date(item.tanggal_selesai).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}`
                : '-';

              return (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl ${styles.bg} ${styles.color} flex items-center justify-center`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={getAchievementIcon(item.tingkat)} />
                        </svg>
                      </div>
                      <span className={`px-3 py-1 text-[10px] font-bold tracking-wider rounded-full ${styles.badge}`}>{item.category}</span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{item.description}</p>
                  </div>
                  <div>
                    {item.link_sertifikat && (
                      <a href={item.link_sertifikat} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-amber-600 mb-1 hover:underline">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.07-9.07l4.5-4.5a4.5 4.5 0 016.364 6.364l-1.757 1.757" />
                        </svg>
                        Lihat Sertifikat
                      </a>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      {dateLabel}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                      <div className="flex -space-x-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 border-2 border-white flex items-center justify-center text-[9px] font-bold text-white">{initials}</div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${getStatusStyles(item.status).categoryColor}`}>
                        {getStatusStyles(item.status).label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721" />
              </svg>
              <p className="text-gray-500 font-medium">Belum ada prestasi pada kategori ini.</p>
              <Link href="/dashboard/achievements/new" className="mt-3 text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline">
                Kirim Prestasi Baru &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* Featured Card */}
        {activeTab === 'Achievement Collection' && latestApproved && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col sm:flex-row gap-5 mt-5">
            <div className="flex-shrink-0 w-full sm:w-48 h-40 rounded-xl bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-green-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l3.75-2.25L16.5 21l-.813-5.096c.093-.207.21-.4.35-.574l3.197-3.197a1.5 1.5 0 00-.833-2.56l-4.423-.615-1.98-3.996a1.5 1.5 0 00-2.697 0L8.796 9.664l-4.422.615a1.5 1.5 0 00-.834 2.56l3.198 3.197c.14.173.257.367.35.574z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 text-[10px] font-bold tracking-wider rounded-full ${getCategoryStyles(latestApproved.category).badge}`}>{latestApproved.category}</span>
                <span className="flex items-center gap-1 text-[10px] font-medium text-gray-400 uppercase">
                  ⭐ LATEST APPROVED ACHIEVEMENT
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{latestApproved.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{latestApproved.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                  Tingkat: {latestApproved.tingkat}
                </span>
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                  {latestApproved.tanggal_mulai ? new Date(latestApproved.tanggal_mulai).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}) : '-'}
                </span>
              </div>
              {latestApproved.link_sertifikat && (
                <a href={latestApproved.link_sertifikat} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-full shadow-sm transition-all">
                  Lihat Sertifikat
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
