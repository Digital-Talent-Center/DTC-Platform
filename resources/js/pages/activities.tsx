import { useState, useRef, useEffect } from 'react';
import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";

type ItemType = 'event' | 'task';

interface ActivityItem {
  id: number;
  type: ItemType;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location?: string;
  deadline?: string;
  status: 'upcoming' | 'completed';
}

const historyItems: ActivityItem[] = [
  {
    id: 1, type: 'event', title: 'Rapat Persiapan Awarding ADIKARA 2025',
    date: '2025-12-24', startTime: '19:00', endTime: '20:00',
    description: 'Finalisasi detail teknis untuk malam penganugerahan.',
    location: 'TULT 06.08', status: 'completed',
  },
  {
    id: 2, type: 'task', title: 'Laporan Kemajuan Mingguan',
    date: '2025-12-20', startTime: '10:00', endTime: '12:00',
    description: 'Mengumpulkan laporan kemajuan mingguan divisi.',
    deadline: '2025-12-22', status: 'completed',
  },
  {
    id: 3, type: 'event', title: 'Design System Workshop: Lucid Canvas',
    date: '2025-12-15', startTime: '10:00', endTime: '12:00',
    description: 'Exploration of the new design language for DTC platform.',
    location: 'Creative Hub', status: 'completed',
  },
  {
    id: 4, type: 'task', title: 'API Documentation Refactor',
    date: '2025-12-10', startTime: '14:00', endTime: '15:30',
    description: 'Update swagger endpoints for microservices v2.4.',
    deadline: '2025-12-12', status: 'completed',
  },
  {
    id: 5, type: 'event', title: 'DTC Platform V2 Launch Sync',
    date: '2025-12-02', startTime: '14:00', endTime: '15:30',
    description: 'Final checklist before migrating to the new infrastructure.',
    location: 'GKU Building • Room 402', status: 'completed',
  },
];

function formatDisplayDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function getTodayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function getNowTime() {
  const d = new Date();
  return d.toTimeString().slice(0, 5);
}

function getEndTime(start: string) {
  const [h, m] = start.split(':').map(Number);
  const end = new Date(2000, 0, 1, h + 1, m);
  return end.toTimeString().slice(0, 5);
}

// ─── Create Modal ───────────────────────────────────────────────
function CreateModal({ onClose, onSave }: { onClose: () => void; onSave: (item: Omit<ActivityItem, 'id'>) => void }) {
  const [activeType, setActiveType] = useState<ItemType>('event');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getTodayStr());
  const [startTime, setStartTime] = useState(getNowTime());
  const [endTime, setEndTime] = useState(getEndTime(getNowTime()));
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [deadline, setDeadline] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave({
      type: activeType,
      title: title.trim(),
      date, startTime, endTime, description,
      ...(activeType === 'event' ? { location } : { deadline }),
      status: 'upcoming',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 className="text-lg font-bold text-gray-900">Create New</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Title Input */}
        <div className="px-6 pb-4">
          <input type="text" placeholder="Add title" value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xl font-medium text-gray-900 placeholder-gray-300 border-b-2 border-amber-400 pb-2 focus:outline-none focus:border-amber-500 bg-transparent" autoFocus />
        </div>

        {/* Type Tabs */}
        <div className="px-6 pb-4 flex items-center gap-2">
          {(['event', 'task'] as ItemType[]).map((t) => (
            <button key={t} onClick={() => setActiveType(t)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${activeType === t ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
              {t === 'event' ? 'Event' : 'Task'}
            </button>
          ))}
        </div>

        {/* Form Fields */}
        <div className="px-6 pb-6 space-y-4">
          {/* Date & Time */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center text-gray-400 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div className="flex-1 space-y-2">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
              <div className="flex items-center gap-2">
                <input type="time" value={startTime} onChange={(e) => { setStartTime(e.target.value); setEndTime(getEndTime(e.target.value)); }}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
                <span className="text-gray-400 text-sm">–</span>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
              </div>
            </div>
          </div>

          {/* Conditional: Location (Event) or Deadline (Task) */}
          {activeType === 'event' ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center text-gray-400 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
              </div>
              <input type="text" placeholder="Add location" value={location} onChange={(e) => setLocation(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center text-gray-400 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <input type="date" placeholder="Add deadline" value={deadline} onChange={(e) => setDeadline(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
            </div>
          )}

          {/* Description */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 flex items-center justify-center text-gray-400 flex-shrink-0 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>
            </div>
            <textarea placeholder="Add description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={!title.trim()}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────
export default function ActivitiesPage() {
  const [showModal, setShowModal] = useState(false);
  const [createDropdown, setCreateDropdown] = useState(false);
  const [items, setItems] = useState<ActivityItem[]>(historyItems);
  const [filterType, setFilterType] = useState<'all' | 'event' | 'task'>('all');
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) { if (dropRef.current && !dropRef.current.contains(e.target as Node)) setCreateDropdown(false); }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSave = (item: Omit<ActivityItem, 'id'>) => {
    setItems(prev => [{ ...item, id: Date.now() }, ...prev]);
    setShowModal(false);
  };

  const filtered = filterType === 'all' ? items : items.filter(i => i.type === filterType);

  return (
    <AppLayout>
      <Head title="Activities" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Activities & Events</h1>
              <p className="mt-2 text-gray-500">Manage your tasks and events within the DTC ecosystem.</p>
            </div>
            {/* Create Button */}
            <div className="relative" ref={dropRef}>
              <button onClick={() => setCreateDropdown(!createDropdown)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md text-sm font-medium text-gray-700 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Create
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 text-gray-400 transition-transform ${createDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
              </button>
              {createDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl border border-gray-200 shadow-lg py-1.5 z-10">
                  {(['event', 'task'] as ItemType[]).map((t) => (
                    <button key={t} onClick={() => { setCreateDropdown(false); setShowModal(true); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      {t === 'event' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      )}
                      {t === 'event' ? 'Event' : 'Task'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {([['all', 'All'], ['event', 'Events'], ['task', 'Tasks']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setFilterType(key)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${filterType === key ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
              {label}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-400">{filtered.length} items</span>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow flex items-start gap-4">
              {/* Type Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.type === 'event' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                {item.type === 'event' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold tracking-wider rounded-full ${item.type === 'event' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    {item.type === 'event' ? 'EVENT' : 'TASK'}
                  </span>
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold tracking-wider rounded-full ${item.status === 'upcoming' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {item.status === 'upcoming' ? 'UPCOMING' : 'COMPLETED'}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-1 mb-2">{item.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                    {formatDisplayDate(item.date)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {item.startTime} – {item.endTime}
                  </span>
                  {item.location && (
                    <span className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                      {item.location}
                    </span>
                  )}
                  {item.deadline && (
                    <span className="flex items-center gap-1.5 text-amber-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" /></svg>
                      Deadline: {formatDisplayDate(item.deadline)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
              </div>
              <p className="text-sm text-gray-400">No items yet. Create your first event or task!</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showModal && <CreateModal onClose={() => setShowModal(false)} onSave={handleSave} />}
    </AppLayout>
  );
}
