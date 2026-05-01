'use client';

import { useState, useEffect, useRef } from 'react';
import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";

interface Guide {
  id: number | string;
  title: string;
  description: string;
  category?: string;
  level?: string;
  year?: number;
  file_path?: string;
  file_icon?: string;
  tags: string[];
  views_count: number;
  downloads_count: number;
  is_public?: boolean;
  created_at?: string;
}

export default function CoGuidePage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [levels, setLevels] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  // Fetch guides from the dedicated guides API
  useEffect(() => {
    const fetchGuides = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/guides');
        if (!response.ok) throw new Error('Failed to fetch guides');
        const data = await response.json();
        
        const allGuides = data.data || [];
        
        // Map both camelCase and snake_case keys
        const mapped = (Array.isArray(allGuides) ? allGuides : []).map((g: any) => ({
          id: g.id,
          title: g.title,
          description: g.description || '',
          category: g.category || '',
          level: g.level || '',
          year: g.year,
          file_path: g.filePath ?? g.file_path,
          file_icon: g.fileIcon ?? g.file_icon,
          tags: g.tags || [],
          views_count: g.viewsCount ?? g.views_count ?? 0,
          downloads_count: g.downloadsCount ?? g.downloads_count ?? 0,
          is_public: g.isPublic ?? g.is_public ?? true,
          created_at: g.createdAt ?? g.created_at,
        }));

        setGuides(mapped);

        // Extract unique levels
        const uniqueLevels = [...new Set(mapped.map((g: Guide) => g.level))].filter(Boolean);
        setLevels(uniqueLevels as string[]);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching guides:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGuides();
  }, []);

  const filtered = guides.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || guide.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const handleView = (guide: Guide) => {
    if (!guide.file_path) {
      alert('File belum tersedia untuk guide ini.');
      return;
    }
    // Open file immediately (before any async) to avoid popup blocker
    window.open(guide.file_path, '_blank');
    // Increment view count in background
    fetch(`/api/guides/${guide.id}`, {
      credentials: 'include',
    }).catch(err => console.error('View count error:', err));
  };

  const handleDownload = (guide: Guide) => {
    if (!guide.file_path) {
      alert('File belum tersedia untuk guide ini.');
      return;
    }
    // Create download link directly to avoid popup blocker
    const a = window.document.createElement('a');
    a.href = guide.file_path;
    a.download = guide.title || 'guide';
    a.target = '_blank';
    window.document.body.appendChild(a);
    a.click();
    a.remove();
    // Increment download count in background
    fetch(`/api/guides/${guide.id}/download`, {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': document
          .querySelector('meta[name="csrf-token"]')
          ?.getAttribute('content') || '',
      },
      credentials: 'include',
    }).catch(err => console.error('Download count error:', err));
  };

  return (
    <AppLayout>
      <Head title="Co-Guide" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            Back to Dashboard
          </Link>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Co-Guide</h1>
            <p className="mt-2 text-gray-500">Comprehensive guides and step-by-step tutorials to help you succeed.</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search guides..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Level Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedLevel('all')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                selectedLevel === 'all'
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Levels
            </button>
            {levels.map(level => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all capitalize ${
                  selectedLevel === level
                    ? 'bg-purple-500 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center gap-3">
            <div className="animate-spin">
              <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </div>
            <p className="text-sm text-gray-400">Loading guides...</p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6 text-sm text-gray-500">
              Showing {filtered.length} of {guides.length} guides
            </div>

            {/* Guides Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((guide) => (
                <div
                  key={guide.id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-shadow flex flex-col"
                >
                  {/* Header with Icon and Level Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-1">
                      {guide.level && (
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold tracking-wider rounded-full capitalize ${
                          guide.level === 'beginner' ? 'bg-blue-100 text-blue-700' :
                          guide.level === 'intermediate' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {guide.level}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title and Description */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{guide.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-grow">{guide.description}</p>

                  {/* Tags */}
                  {guide.tags && guide.tags.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {guide.tags.slice(0, 3).map((tag: string, idx: number) => (
                        <span key={idx} className="px-2.5 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                          {tag}
                        </span>
                      ))}
                      {guide.tags.length > 3 && (
                        <span className="px-2.5 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                          +{guide.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="mb-4 space-y-2 text-xs text-gray-500">
                    {guide.category && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Category:</span> {guide.category}
                      </div>
                    )}
                    <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {guide.views_count || 0} views
                      </span>
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {guide.downloads_count || 0} downloads
                      </span>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleView(guide)}
                      className="flex-1 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                    <button
                      onClick={() => handleDownload(guide)}
                      className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && !loading && (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400">No guides available yet. Please check back later.</p>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
