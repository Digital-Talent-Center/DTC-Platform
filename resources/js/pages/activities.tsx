'use client';

import { useState, useRef, useEffect } from 'react';
import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";
import { api } from "@/services/api";

type ItemType = 'event' | 'task';

interface ActivityItem {
  id: number | string;
  type: ItemType;
  title: string;
  date: string;
  start_time?: string;
  end_time?: string;
  description: string;
  location?: string;
  deadline?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  activity_date?: string;
}

function isOverdue(item: ActivityItem) {
  if (item.status === 'completed' || item.status === 'cancelled') return false;
  
  // For tasks, check deadline
  if (item.type === 'task' && item.deadline) {
    const today = new Date().toISOString().split('T')[0];
    return new Date(item.deadline) < new Date();
  }
  
  // For events, check activity_date
  if (item.type === 'event' && item.date) {
    return new Date(item.date) < new Date();
  }
  
  return false;
}

function safeDate(dateStr?: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function formatDisplayDate(dateStr?: string | null) {
  if (!dateStr) return '-';

  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';

  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
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

function normalizeDate(date: any) {
  if (!date) return null;
  // Clean microsecond precision that JS can't handle (6 decimals -> 3)
  const cleaned = typeof date === 'string' ? date.replace(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\.\d{6}Z/, '$1.000Z') : date;
  const d = new Date(cleaned);
  return isNaN(d.getTime()) ? null : cleaned;
}

// ─── Create Modal ───────────────────────────────────────────────
function CreateModal({ initialType = 'event', onClose, onSave, loading }: { initialType?: ItemType; onClose: () => void; onSave: (item: Omit<ActivityItem, 'id'>) => Promise<void>; loading: boolean }) {
  const [activeType, setActiveType] = useState<ItemType>(initialType);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getTodayStr());
  const [startTime, setStartTime] = useState(getNowTime());
  const [endTime, setEndTime] = useState(getEndTime(getNowTime()));
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [deadline, setDeadline] = useState(getTodayStr());
  const [error, setError] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    try {
      setError('');
      await onSave({
        type: activeType,
        title: title.trim(),
        date: activeType === 'task' ? (deadline || getTodayStr()) : date,
        start_time: activeType === 'event' ? startTime : undefined,
        end_time: activeType === 'event' ? endTime : undefined,
        description,
        location: activeType === 'event' ? location : undefined,
        deadline: activeType === 'task' ? (deadline || getTodayStr()) : undefined,
        status: 'pending',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save activity');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 className="text-lg font-bold text-gray-900">Create New {activeType === 'event' ? 'Event' : 'Task'}</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Title Input */}
        <div className="px-6 pb-4">
          <input type="text" placeholder="Add title" value={title} onChange={(e) => setTitle(e.target.value)}
            className={`w-full text-xl font-medium text-gray-900 placeholder-gray-300 border-b-2 pb-2 focus:outline-none bg-transparent transition-all ${
              activeType === 'event' ? 'border-amber-400 focus:border-amber-500' : 'border-blue-400 focus:border-blue-500'
            }`} autoFocus />
        </div>

        {/* Type Tabs */}
        <div className="px-6 pb-4 flex items-center gap-2">
          {(['event', 'task'] as ItemType[]).map((t) => (
            <button key={t} onClick={() => setActiveType(t)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                activeType === t
                  ? t === 'event'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}>
              {t === 'event' ? 'Event' : 'Task'}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 pb-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          </div>
        )}

        {/* Form Fields */}
        <div className="px-6 pb-6 space-y-4">
          {activeType === 'event' ? (
            <>
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

              {/* Location */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center text-gray-400 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                </div>
                <input type="text" placeholder="Add location" value={location} onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
              </div>
            </>
          ) : (
            <>
              {/* Deadline Date */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center text-gray-400 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Deadline Date</label>
                  <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" />
                </div>
              </div>
            </>
          )}

          {/* Description */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 flex items-center justify-center text-gray-400 flex-shrink-0 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>
            </div>
            <textarea placeholder="Add description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className={`flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:border-transparent ${
                activeType === 'event' ? 'focus:ring-amber-400' : 'focus:ring-blue-400'
              }`} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-end gap-3">
          <button onClick={onClose} disabled={loading} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50">Cancel</button>
          <button onClick={handleSubmit} disabled={!title.trim() || loading}
            className={`px-6 py-2.5 text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 ${
              activeType === 'event' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}>
            {loading && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────
export default function ActivitiesPage() {
  const [showModal, setShowModal] = useState(false);
  const [modalInitialType, setModalInitialType] = useState<ItemType>('event');
  const [createDropdown, setCreateDropdown] = useState(false);
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'event' | 'task'>('all');
  const [error, setError] = useState('');
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) { if (dropRef.current && !dropRef.current.contains(e.target as Node)) setCreateDropdown(false); }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Fetch activities from API
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const data = await api.activities.list();
        
        // Transform API data to component format
        const list = data.data ?? [];
        
        const transformed = (Array.isArray(list) ? list : list.data ?? []).map((item: any) => {
          const normalizedStatus = (item.status || '').toLowerCase();

          return {
            id: item.id,
            type: item.type === 'task' ? 'task' : 'event',
            title: item.title,
            date: normalizeDate(item.activityDate ?? item.activity_date),
            start_time: item.startTime ?? item.start_time ?? null,
            end_time: item.endTime ?? item.end_time ?? null,
            description: item.description || '',
            location: item.location || undefined,
            deadline: normalizeDate(item.deadline) ?? undefined,

            status: ['pending','in_progress','completed','cancelled','overdue'].includes(normalizedStatus)
              ? normalizedStatus
              : 'pending',
          };
      });
        setItems(transformed);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching activities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const handleSave = async (item: Omit<ActivityItem, 'id'>) => {
    try {
      setSaving(true);
      
      const payload = {
        type: item.type,
        title: item.title,
        description: item.description,
        activity_date: item.date,
        status: item.status,
        start_time: item.start_time,
        end_time: item.end_time,
        location: item.location || null,
        deadline: item.deadline ?? null
      };

      const data = await api.activities.create(payload as any);

      const newItem = data.data as any;

      setItems(prev => [{
        id: newItem.id,
        type: newItem.type,
        title: newItem.title,
        date: newItem.activity_date ?? null,
        start_time: newItem.start_time ?? null,
        end_time: newItem.end_time ?? null,
        description: newItem.description || '',
        location: newItem.location || undefined,
        deadline: newItem.deadline ?? undefined,
        status: (newItem.status || 'pending').toLowerCase(),
      }, ...prev]);

      setShowModal(false);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to save activity');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: number | string, newStatus: 'in_progress' | 'completed' | 'cancelled') => {
    try {
      const apiStatus = newStatus === 'in_progress' ? 'in_progress' : newStatus;
      await api.activities.update(Number(id), { status: apiStatus } as any);
      setItems(prev => prev.map(item => 
        item.id === id ? {
          ...item,
          status: newStatus
        } : item
      ));
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert('Failed to update status: ' + err.message);
    }
  };

  const startTask = async (id: number | string) => {
    await handleStatusChange(id, 'in_progress');
  };

  const completeTask = async (id: number | string) => {
    await handleStatusChange(id, 'completed');
  };

  const cancelEvent = async (id: number | string) => {
    await handleStatusChange(id, 'cancelled');
  };

  const enrichedItems = items
  .filter(item => filterType === 'all' || item.type === filterType)
  .map(item => {
    if (isOverdue(item)) {
      return { ...item, status: 'overdue' as const };
    }
    return item;
  });

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
                    <button key={t} onClick={() => { setCreateDropdown(false); setModalInitialType(t); setShowModal(true); }}
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
          <span className="ml-auto text-xs text-gray-400">{enrichedItems.length} items</span>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          {enrichedItems.map((item) => {
          const displayStatus = item.status === 'overdue'
            ? 'OVERDUE'
            : item.status === 'pending'
            ? 'PENDING'
            : item.status === 'in_progress'
            ? 'IN PROGRESS'
            : item.status === 'completed'
            ? 'COMPLETED'
            : 'CANCELLED';

          return (
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
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold tracking-wider rounded-full ${
                  displayStatus === 'OVERDUE'
                    ? 'bg-red-100 text-red-700'
                    : displayStatus === 'PENDING'
                    ? 'bg-blue-100 text-blue-700'
                    : displayStatus === 'IN PROGRESS'
                    ? 'bg-yellow-100 text-yellow-700'
                    : displayStatus === 'COMPLETED'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {displayStatus}
                </span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-1 mb-2">{item.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                    {safeDate(item.date) ? formatDisplayDate(item.date) : '-'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {item.start_time && item.end_time
                      ? `${item.start_time.slice(0,5)} – ${item.end_time.slice(0,5)}`
                      : '-'}
                  </span>
                  {item.location && (
                    <span className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                      {item.location}
                    </span>
                  )}
                  {safeDate(item.deadline) && (
                    <span className="flex items-center gap-1.5 text-amber-600">
                      Deadline: {item.deadline ? formatDisplayDate(item.deadline) : '-'}
                    </span>
                  )}
                </div>
                {/* Action Buttons */}
                <div className="mt-4 flex items-center gap-2">
                  {item.type === 'task' && (item.status === 'pending' || item.status === 'overdue') && (
                    <button onClick={() => startTask(item.id)} className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-medium rounded-full transition-colors">
                      Start
                    </button>
                  )}
                  {item.type === 'task' && item.status === 'in_progress' && (
                    <button onClick={() => completeTask(item.id)} className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-full transition-colors">
                      Complete
                    </button>
                  )}
                  {item.type === 'event' && (item.status === 'pending') && (
                    <button onClick={() => cancelEvent(item.id)} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-full transition-colors">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          )})}

          {enrichedItems.length === 0 && (
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
      {showModal && <CreateModal initialType={modalInitialType} onClose={() => setShowModal(false)} onSave={handleSave} loading={saving} />}
    </AppLayout>
  );
}
