import { useState, useMemo } from 'react';
import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";

/* ── Types ─────────────────────────────────────────── */
interface DocumentItem {
  id: number;
  title: string;
  description: string;
  tags: string[];
  competition: string;
  level: string;
  type: string;
  year: string;
  fileUrl: string;
}

/* ── Dummy data ────────────────────────────────────── */
const documents: DocumentItem[] = [
  {
    id: 1,
    title: '2025 - Juara 2 - Slide - Tim cuka cuka club (ACETRA).pdf',
    description: 'Slide Juara 2 Gemastik Divisi 11 Pengembangan Bisnis TIK Tim cuka cuka club (ACETRA).pdf',
    tags: ['Gemastik', 'Juara', 'Slide'],
    competition: 'Gemastik',
    level: 'Nasional',
    type: 'Slide',
    year: '2025',
    fileUrl: '#',
  },
  {
    id: 2,
    title: '2025 - Finalis - Slide - ADA4Career.pdf',
    description: 'Slide Final 2025 Gemastik Divisi 11 Pengembangan Bisnis TIK ADA4Career.pdf',
    tags: ['Gemastik', 'Universitas', 'Slide'],
    competition: 'Gemastik',
    level: 'Universitas',
    type: 'Slide',
    year: '2025',
    fileUrl: '#',
  },
  {
    id: 3,
    title: '2025 - Universitas - Proposal - Tim Telyu Sigma (Solarkeun).pdf',
    description: 'Proposal Lolos Universitas Gemastik Divisi 8 Software Development (Pengembangan Perangkat Lunak) Tim Telyu Sigma (Solarkeun).pdf',
    tags: ['Gemastik', 'Universitas', 'Proposal'],
    competition: 'Gemastik',
    level: 'Universitas',
    type: 'Proposal',
    year: '2025',
    fileUrl: '#',
  },
  {
    id: 4,
    title: '2024 - Juara 1 - Proposal - Tim Inovasi Digital.pdf',
    description: 'Proposal Juara 1 Gemastik Divisi 7 Pengembangan Aplikasi Mobile Tim Inovasi Digital.pdf',
    tags: ['Gemastik', 'Juara', 'Proposal'],
    competition: 'Gemastik',
    level: 'Nasional',
    type: 'Proposal',
    year: '2024',
    fileUrl: '#',
  },
  {
    id: 5,
    title: '2024 - Finalis - Slide - Tim CloudNine.pdf',
    description: 'Slide Final 2024 FIND IT Divisi UI/UX Design Tim CloudNine.pdf',
    tags: ['FIND IT', 'Finalis', 'Slide'],
    competition: 'FIND IT',
    level: 'Nasional',
    type: 'Slide',
    year: '2024',
    fileUrl: '#',
  },
  {
    id: 6,
    title: '2024 - Universitas - Paper - Tim DataDriven.pdf',
    description: 'Paper Lolos Seleksi Universitas JOINTS Divisi Data Analytics Tim DataDriven.pdf',
    tags: ['JOINTS', 'Universitas', 'Paper'],
    competition: 'JOINTS',
    level: 'Universitas',
    type: 'Paper',
    year: '2024',
    fileUrl: '#',
  },
];

/* ── Extract unique filter values from data ────────── */
function uniqueValues(key: keyof DocumentItem): string[] {
  const set = new Set(documents.map((d) => d[key] as string));
  return Array.from(set).sort();
}

/* ── PDF Icon Component ────────────────────────────── */
function PdfIcon() {
  return (
    <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    </div>
  );
}

/* ── View Button Component ─────────────────────────── */
function ViewButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50 transition-all flex-shrink-0"
      title="View document"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </a>
  );
}

/* ── Filter Select Component ───────────────────────── */
function FilterSelect({
  label,
  value,
  onChange,
  options,
  accentColor = 'amber',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  accentColor?: string;
}) {
  const colorMap: Record<string, { border: string; label: string; focus: string }> = {
    amber: {
      border: 'border-amber-400',
      label: 'text-amber-600',
      focus: 'focus:ring-amber-400 focus:border-amber-500',
    },
    rose: {
      border: 'border-rose-400',
      label: 'text-rose-500',
      focus: 'focus:ring-rose-400 focus:border-rose-500',
    },
    blue: {
      border: 'border-blue-400',
      label: 'text-blue-500',
      focus: 'focus:ring-blue-400 focus:border-blue-500',
    },
    emerald: {
      border: 'border-emerald-400',
      label: 'text-emerald-600',
      focus: 'focus:ring-emerald-400 focus:border-emerald-500',
    },
  };

  const colors = colorMap[accentColor] || colorMap.amber;

  return (
    <div className="relative flex-1 min-w-[140px]">
      <label className={`absolute -top-2.5 left-3 px-1.5 bg-white text-xs font-medium ${colors.label} z-10`}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2.5 bg-white border ${colors.border} rounded-lg text-sm text-gray-700 appearance-none cursor-pointer ${colors.focus} focus:outline-none focus:ring-1 transition-colors`}
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {/* Custom chevron */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </div>
  );
}

/* ── Document Card Component ───────────────────────── */
function DocumentCard({ doc }: { doc: DocumentItem }) {
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 px-5 py-5 hover:shadow-md hover:border-gray-200 transition-all duration-200">
      <div className="flex items-start gap-4">
        {/* PDF Icon */}
        <PdfIcon />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 mb-1 leading-snug">
            {doc.title}
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-2">
            {doc.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2">
            {doc.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* View Button */}
        <ViewButton href={doc.fileUrl} />
      </div>
    </div>
  );
}

/* ── Main Co-Library Page ──────────────────────────── */
export default function CoLibraryPage() {
  const [search, setSearch] = useState('');
  const [competition, setCompetition] = useState('');
  const [level, setLevel] = useState('');
  const [type, setType] = useState('');
  const [year, setYear] = useState('');

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      const matchSearch =
        !search ||
        doc.title.toLowerCase().includes(search.toLowerCase()) ||
        doc.description.toLowerCase().includes(search.toLowerCase()) ||
        doc.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchCompetition = !competition || doc.competition === competition;
      const matchLevel = !level || doc.level === level;
      const matchType = !type || doc.type === type;
      const matchYear = !year || doc.year === year;
      return matchSearch && matchCompetition && matchLevel && matchType && matchYear;
    });
  }, [search, competition, level, type, year]);

  const hasActiveFilters = !!(search || competition || level || type || year);

  return (
    <AppLayout>
      <Head title="Co-Library" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Page Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Co-Library
          </h1>
        </div>

        {/* Search & Filters Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 mb-6">
          {/* Search Bar */}
          <div className="relative mb-5">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <input
              id="co-library-search"
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter Dropdowns - 2x2 grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FilterSelect
              label="Competition"
              value={competition}
              onChange={setCompetition}
              options={uniqueValues('competition')}
              accentColor="rose"
            />
            <FilterSelect
              label="Level"
              value={level}
              onChange={setLevel}
              options={uniqueValues('level')}
              accentColor="blue"
            />
            <FilterSelect
              label="Type"
              value={type}
              onChange={setType}
              options={uniqueValues('type')}
              accentColor="rose"
            />
            <FilterSelect
              label="Year"
              value={year}
              onChange={setYear}
              options={uniqueValues('year')}
              accentColor="amber"
            />
          </div>

          {/* Active filters indicator & clear */}
          {hasActiveFilters && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Showing {filtered.length} of {documents.length} documents
              </p>
              <button
                onClick={() => { setSearch(''); setCompetition(''); setLevel(''); setType(''); setYear(''); }}
                className="text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Document List */}
        <div className="space-y-3">
          {filtered.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}

          {/* Empty State */}
          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500">No documents found</p>
              <p className="text-xs text-gray-400">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
