import { useState, useMemo } from 'react';
import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";

interface Document {
  id: number;
  title: string;
  description: string;
  tags: string[];
  size: string;
  isNew?: boolean;
  competition: string;
  type: string;
  year: string;
  icon: 'doc' | 'book' | 'poster' | 'checklist';
}

const documents: Document[] = [
  {
    id: 1, title: 'Template PKM-RE 2024.docx', description: 'Official template for Program Kreativitas Mahasiswa Riset Eksakta (PKM-RE) updated for the 2024 cycle.',
    tags: ['PKM', 'TEMPLATE', '2024'], size: '1.2 MB', isNew: true, competition: 'PKM', type: 'Template', year: '2024', icon: 'doc',
  },
  {
    id: 2, title: 'Panduan Umum Gemastik XVII', description: 'Comprehensive guide covering all competition branches in Gemastik XVII, including rules and evaluation criteria.',
    tags: ['GEMASTIK', 'PANDUAN'], size: '4.5 MB', competition: 'Gemastik', type: 'Panduan', year: '2024', icon: 'book',
  },
  {
    id: 3, title: 'LIDM 2023 - Digital Poster Finalist', description: "Collection of winning digital posters from last year's LIDM competition for design inspiration.",
    tags: ['LIDM', 'WINNER', '2023'], size: '18.0 MB', competition: 'LIDM', type: 'Portofolio', year: '2023', icon: 'poster',
  },
  {
    id: 4, title: 'Checklist Kelengkapan Administrasi', description: 'A simple document to help you track all administrative requirements before final submission.',
    tags: ['CHECKLIST', 'ADMIN'], size: '240 KB', competition: 'All', type: 'Checklist', year: '2024', icon: 'checklist',
  },
  {
    id: 5, title: 'Template Proposal PKM-KC 2024', description: 'Proposal template for PKM Karsa Cipta with complete formatting guidelines.',
    tags: ['PKM', 'TEMPLATE', '2024'], size: '980 KB', competition: 'PKM', type: 'Template', year: '2024', icon: 'doc',
  },
  {
    id: 6, title: 'Gemastik XVI Best Paper Collection', description: 'Compilation of best paper submissions from Gemastik XVI for reference and study.',
    tags: ['GEMASTIK', 'WINNER', '2023'], size: '25.3 MB', competition: 'Gemastik', type: 'Portofolio', year: '2023', icon: 'book',
  },
];

const competitions = ['All', 'PKM', 'Gemastik', 'LIDM'];
const types = ['All', 'Template', 'Panduan', 'Portofolio', 'Checklist'];
const years = ['All', '2024', '2023', '2022'];

const ITEMS_PER_PAGE = 4;

const iconMap = {
  doc: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  book: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
  poster: 'M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42',
  checklist: 'M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75',
};

export default function CoGuidePage() {
  const [search, setSearch] = useState('');
  const [competition, setCompetition] = useState('All');
  const [type, setType] = useState('All');
  const [year, setYear] = useState('All');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return documents.filter(doc => {
      const matchSearch = !search || doc.title.toLowerCase().includes(search.toLowerCase()) || doc.description.toLowerCase().includes(search.toLowerCase());
      const matchComp = competition === 'All' || doc.competition === competition;
      const matchType = type === 'All' || doc.type === type;
      const matchYear = year === 'All' || doc.year === year;
      return matchSearch && matchComp && matchType && matchYear;
    });
  }, [search, competition, type, year]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const clearFilters = () => { setSearch(''); setCompetition('All'); setType('All'); setYear('All'); setPage(1); };

  return (
    <AppLayout>
      <Head title="Co-Guide" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">

        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Co-Guide</h1>
          <p className="mt-2 text-gray-500 max-w-lg">Akses panduan pilihan, template resmi, dan portofolio pemenang untuk kompetisi universitas.</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            <input type="text" placeholder="Search documents..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all" />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <FilterDropdown label="Competition" value={competition} options={competitions} onChange={(v) => { setCompetition(v); setPage(1); }} />
          <FilterDropdown label="Type" value={type} options={types} onChange={(v) => { setType(v); setPage(1); }} />
          <FilterDropdown label="Year" value={year} options={years} onChange={(v) => { setYear(v); setPage(1); }} />
          {(competition !== 'All' || type !== 'All' || year !== 'All' || search) && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors ml-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              Clear Filters
            </button>
          )}
        </div>

        {/* Document List */}
        <div className="space-y-3">
          {paginated.map((doc) => (
            <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-amber-700 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={iconMap[doc.icon]} /></svg>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{doc.title}</h3>
                  {doc.isNew && <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-red-500 bg-red-50 rounded">NEW</span>}
                </div>
                <p className="text-xs text-gray-500 line-clamp-1 mb-2">{doc.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {doc.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-gray-600 bg-gray-100 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Download */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <button className="w-10 h-10 rounded-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center shadow-sm transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                </button>
                <span className="text-[10px] font-medium text-gray-400">{doc.size}</span>
              </div>
            </div>
          ))}

          {paginated.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
              </div>
              <p className="text-sm text-gray-400">No documents found matching your filters.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${page === p ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

// ─── Filter Dropdown Component ──────────────────────────────────
function FilterDropdown({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:border-gray-300 transition-colors">
        {label}: <span className="text-gray-900">{value}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 w-40 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-20">
            {options.map((opt) => (
              <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${value === opt ? 'text-amber-600 font-semibold bg-amber-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
