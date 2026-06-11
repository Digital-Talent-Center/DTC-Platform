'use client';

import { useState, useEffect, useRef } from 'react';
import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";
import { api } from '@/services/api';
import type { Document } from '@/types';

export default function CoLibraryPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  // Fetch documents from API
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        // Using api.documents.list which handles auth headers and CSRF
        const response = await api.documents.list();
        
        // PaginatedResponse has data inside data (or just data if the type is mapped)
        const docs = Array.isArray(response.data) ? response.data : (response.data as any).data || [];
        setDocuments(docs);

        // Extract unique categories
        const uniqueCategories = [...new Set(docs.map((doc: Document) => doc.category))].filter(Boolean);
        setCategories(uniqueCategories as string[]);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch documents');
        console.error('Error fetching documents:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const filtered = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleView = (doc: Document) => {
    if (!doc.filePath) {
      alert('File belum tersedia untuk dokumen ini.');
      return;
    }
    const fileUrl = doc.filePath;
    // Open file immediately (before any async) to avoid popup blocker
    window.open(fileUrl, '_blank');
    // Increment view count in background via API
    api.documents.get(doc.id).catch(err => console.error('View count error:', err));
  };

  return (
    <AppLayout>
      <Head title="Co-Library" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            Back to Dashboard
          </Link>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Co-Library</h1>
            <p className="mt-2 text-gray-500">Browse and view shared resources, guides, and learning materials.</p>
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
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filters */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                    selectedCategory === category
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
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
              <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </div>
            <p className="text-sm text-gray-400">Loading resources...</p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6 text-sm text-gray-500">
              Showing {filtered.length} of {documents.length} resources
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-shadow flex flex-col"
                >
                  {/* Header with Icon and Status */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .984.695 1.794 1.592 1.794.891 0 1.591-.81 1.591-1.794 0-.23-.035-.454-.1-.664m-5.801 0A2.25 2.25 0 012.25 6.108v12.042c0 1.135.845 2.098 1.976 2.192.408.036.815.106 1.123.08m5.801 0z" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-1">
                      {doc.isPublic && (
                        <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider rounded-full bg-green-100 text-green-700">
                          PUBLIC
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title and Description */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{doc.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">{doc.description}</p>

                  {/* Tags */}
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {doc.tags.slice(0, 3).map((tag: any, idx: number) => (
                        <span key={idx} className="px-2.5 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                          {tag.name}
                        </span>
                      ))}
                      {doc.tags.length > 3 && (
                        <span className="px-2.5 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                          +{doc.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="mb-4 space-y-2 text-xs text-gray-500">
                    {doc.category && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Category:</span> {doc.category}
                      </div>
                    )}
                    {doc.level && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Level:</span> {doc.level}
                      </div>
                    )}
                    <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {doc.viewsCount || 0} views
                      </span>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleView(doc)}
                      className="w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View File
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && !loading && (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .984.695 1.794 1.592 1.794.891 0 1.591-.81 1.591-1.794 0-.23-.035-.454-.1-.664m-5.801 0A2.25 2.25 0 012.25 6.108v12.042c0 1.135.845 2.098 1.976 2.192.408.036.815.106 1.123.08m5.801 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400">No resources found. Try adjusting your filters.</p>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}

