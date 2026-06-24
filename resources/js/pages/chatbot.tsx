import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState, useCallback } from 'react';
import { type SharedData } from '@/types';

const BP_INJECT = 'https://cdn.botpress.cloud/webchat/v3.6/inject.js';
const BP_CONFIG = 'https://files.bpcontent.cloud/2026/06/11/18/20260611183647-A3ATWCTL.js';
const BP_CLIENT_ID = 'e09f61e4-1a6a-43ed-9227-e6ff570b4f5a';

declare global {
  interface Window {
    botpress?: {
      init(config: any): void;
      open(): void;
      close(): void;
      on(e: string, cb: (...args: any[]) => void): void;
    };
  }
}

/* ── CSS injected into Botpress Shadow DOM ── */
const BP_SHADOW_CSS = `
  /* Hide built-in header — we have our own */
  header, [class*="Header"], [data-testid*="header"] {
    display: none !important;
  }
  /* Hide native sidebar/history — we have our own */
  [class*="Sidebar"], [class*="sidebar"],
  [class*="History"], [class*="history"],
  [class*="ConversationList"], [class*="conversationList"] {
    display: none !important;
  }
  button[aria-label*="istory"], button[aria-label*="onversation"],
  [class*="BackButton"], [class*="backButton"] {
    display: none !important;
  }
  /* Fill container */
  :host { width: 100% !important; height: 100% !important; }
`;

/* ── Inject CSS into all nested shadow roots ── */
function injectShadowCSS(el: Element, id: string, css: string): boolean {
  let ok = false;
  if (el.shadowRoot) {
    if (!el.shadowRoot.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = css;
      el.shadowRoot.prepend(s);
      ok = true;
    } else { ok = true; }
    el.shadowRoot.querySelectorAll('*').forEach(c => {
      if (injectShadowCSS(c, id, css)) ok = true;
    });
  }
  for (const child of Array.from(el.children)) {
    if (injectShadowCSS(child, id, css)) ok = true;
  }
  return ok;
}

/* ── Traverse into Shadow DOM to find the actual focused element ── */
function getDeepActiveElement(): Element | null {
  let el = document.activeElement;
  while (el?.shadowRoot?.activeElement) {
    el = el.shadowRoot.activeElement;
  }
  return el;
}

/* ── Conversation history (API-synced ↔ server) ── */
interface HistoryItem {
  id: string;          // botpress_conversation_id
  serverId?: number;   // DB primary key (for delete)
  title: string;
  preview: string;
  ts: number;
}

const BP_KEY = `bp-webchat-${BP_CLIENT_ID}-client`;

const getBpConvoId = (): string | null => {
  try {
    // Try the primary key first
    const primary = JSON.parse(localStorage.getItem(BP_KEY) || '{}');
    if (primary?.state?.conversationId) return primary.state.conversationId;

    // Scan all localStorage keys for Botpress data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('bp-webchat-')) continue;
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        if (data?.state?.conversationId) return data.state.conversationId;
        if (data?.conversationId) return data.conversationId;
      } catch { /* skip malformed keys */ }
    }
    return null;
  } catch { return null; }
};

/* ── Detect when user sends a message to Botpress ── */
/* Botpress uses WebSocket for messaging, not window.fetch. We intercept all
   three channels (fetch, WebSocket, keydown Enter) for full coverage.        */
let _interceptorsReady = false;
let _lastMsgTs = 0;

function dispatchUserMessage(text: string) {
  const now = Date.now();
  if (now - _lastMsgTs < 3000) return; // dedup: ignore within 3s window
  _lastMsgTs = now;
  console.log('DTC AI - User message detected:', text);
  // Delay to let Botpress assign the conversation ID in localStorage
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('dtc-user-message', { detail: { text } }));
  }, 1200);
}

function setupInterceptors() {
  if (_interceptorsReady) return;
  _interceptorsReady = true;

  // 1. Fetch interceptor (in case Botpress uses REST for some operations)
  const origFetch = window.fetch;
  window.fetch = async function (...args: Parameters<typeof fetch>) {
    const response = await origFetch.apply(this, args);
    try {
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request)?.url || '';
      const opts = args[1];
      if (url.includes('botpress') && opts?.method?.toUpperCase() === 'POST' && opts?.body) {
        const body = typeof opts.body === 'string' ? JSON.parse(opts.body) : null;
        const msgText = body?.payload?.text?.trim();
        if (msgText && msgText.length >= 2) {
          dispatchUserMessage(msgText);
        }
      }
    } catch { /* ignore */ }
    return response;
  };

  // 2. WebSocket interceptor (Botpress primarily uses WebSocket for messaging)
  const origWsSend = WebSocket.prototype.send;
  WebSocket.prototype.send = function (data: string | ArrayBufferLike | Blob | ArrayBufferView) {
    try {
      if (typeof data === 'string') {
        const parsed = JSON.parse(data);
        const msgText = (parsed?.payload?.text || parsed?.text || '').trim();
        if (msgText && msgText.length >= 2) {
          console.log('DTC AI - WebSocket message intercepted:', msgText);
          dispatchUserMessage(msgText);
        }
      }
    } catch { /* not JSON, ignore */ }
    return origWsSend.call(this, data);
  };

  // 3. Keydown Enter handler (most reliable fallback — reads input value directly)
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    const active = getDeepActiveElement();
    if (!active) return;
    let text = '';
    if (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') {
      text = (active as HTMLInputElement).value?.trim() || '';
    } else if ((active as HTMLElement).contentEditable === 'true') {
      text = (active as HTMLElement).textContent?.trim() || '';
    }
    if (text.length >= 2) {
      console.log('DTC AI - Keydown Enter intercepted:', text);
      dispatchUserMessage(text);
    }
  }, true); // capture phase to get it before Botpress clears the input
}
setupInterceptors();

/* ── API helpers ── */
const csrfToken = () =>
  document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '';

const apiFetch = (path: string, opts: RequestInit = {}) =>
  fetch(`/api${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-CSRF-TOKEN': csrfToken(),
      ...(opts.headers || {}),
    },
  });

const fetchHistory = async (): Promise<HistoryItem[]> => {
  try {
    const res = await apiFetch('/chat-sessions');
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((s: any) => ({
      id: s.botpress_conversation_id,
      serverId: s.id,
      title: s.title || 'Percakapan Baru',
      preview: '',
      ts: new Date(s.updated_at).getTime(),
    }));
  } catch { return []; }
};

const upsertSession = async (bpConvoId: string, title: string): Promise<{id: number} | null> => {
  try {
    const res = await apiFetch('/chat-sessions', {
      method: 'POST',
      body: JSON.stringify({ botpress_conversation_id: bpConvoId, title }),
    });
    if (!res.ok) {
      console.error('DTC AI - upsertSession HTTP error:', res.status);
      return null;
    }
    const data = await res.json();
    console.log('DTC AI - upsertSession OK:', data);
    return data;
  } catch (err) {
    console.error('DTC AI - upsertSession failed:', err);
    return null;
  }
};

const deleteSession = async (serverId: number) => {
  try {
    await apiFetch(`/chat-sessions/${serverId}`, { method: 'DELETE' });
  } catch { /* best-effort */ }
};

const deleteAllSessions = async () => {
  try {
    await apiFetch('/chat-sessions/all', { method: 'DELETE' });
  } catch { /* best-effort */ }
};

export default function ChatbotPage() {
  const { auth } = usePage<SharedData>().props;
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSidebarOpen(window.innerWidth >= 768);
    }
  }, []);

  /* ── Load history from API on mount ── */
  useEffect(() => {
    fetchHistory().then(h => setHistory(h));
  }, []);

  /* ── Sync current Botpress conversation active ID (polling — no session creation) ── */
  const syncHistory = useCallback(() => {
    const cid = getBpConvoId();
    if (!cid) return;
    setActiveId(cid);
  }, []);

  /* ── Create session ONLY when user sends a message (fetch interceptor) ── */
  useEffect(() => {
    const handler = (e: Event) => {
      const text = (e as CustomEvent).detail?.text;
      if (!text) return;

      const cid = getBpConvoId();
      console.log('DTC AI - Fetch intercepted user message:', text, 'cid:', cid);
      if (!cid) return;

      const title = text.length > 35 ? text.slice(0, 35) + '…' : text;
      const preview = text.length > 60 ? text.slice(0, 60) + '…' : text;

      setHistory(prev => {
        const item = prev.find(h => h.id === cid);
        if (!item) {
          // Brand new conversation — create with message text as title
          console.log('DTC AI - Creating session:', cid, title);
          upsertSession(cid, title).then(data => {
            if (data?.id) {
              setHistory(h => h.map(hi =>
                hi.id === cid ? { ...hi, serverId: data.id } : hi
              ));
            }
          });
          return [{ id: cid, title, preview, ts: Date.now() }, ...prev];
        }
        // Already exists — no rename needed, title was set on first message
        return prev;
      });
    };

    window.addEventListener('dtc-user-message', handler);
    return () => window.removeEventListener('dtc-user-message', handler);
  }, [
    // no deps — handler reads getBpConvoId() fresh each time
  ]);

  /* ── Actions ── */
  const initBotpress = () => {
    try {
      // 1. Clean up existing Botpress elements and scripts
      try { window.botpress?.close(); } catch { }
      document.getElementById('bp-webchat-container')?.remove();
      document.querySelectorAll('[class*="bp-widget"]').forEach(el => el.remove());
      document.getElementById('bp-inject')?.remove();
      document.getElementById('bp-config')?.remove();
      delete window.botpress;
      delete (window as any).botpressWebChat;

      // Also clean up any Botpress stylesheets
      document.querySelectorAll('link[href*="botpress"]').forEach(el => el.remove());

      const el = document.getElementById('bp-embedded-webchat');
      if (el) el.innerHTML = '';

      // 2. Re-inject scripts to force fresh initialization
      setStatus('loading');
      const s = document.createElement('script');
      s.id = 'bp-inject'; s.src = BP_INJECT; s.async = true;
      s.onload = () => {
        const c = document.createElement('script');
        c.id = 'bp-config'; c.src = BP_CONFIG; c.defer = true;
        c.onload = () => setStatus('ready');
        c.onerror = () => setStatus('error');
        document.head.appendChild(c);
      };
      s.onerror = () => setStatus('error');
      document.head.appendChild(s);
    } catch {
      window.location.reload();
    }
  };

  /* ── Load Botpress on Mount ── */
  useEffect(() => {
    initBotpress();
    return () => {
      try { window.botpress?.close(); } catch { }
    };
  }, []);

  /* ── Poll: inject shadow CSS + sync history ── */
  useEffect(() => {
    if (status !== 'ready') return;
    const t = setInterval(() => {
      const el = document.getElementById('bp-embedded-webchat');
      if (el) injectShadowCSS(el, 'prodigi-bp', BP_SHADOW_CSS);
      syncHistory();
    }, 500);
    return () => clearInterval(t);
  }, [status, syncHistory]);

  const switchChat = (cid: string) => {
    try {
      const d = JSON.parse(localStorage.getItem(BP_KEY) || '{"state":{}}');
      d.state = { ...d.state, conversationId: cid };
      localStorage.setItem(BP_KEY, JSON.stringify(d));
      setActiveId(cid);
      if (window.innerWidth < 768) setIsSidebarOpen(false);
      initBotpress();
    } catch {
      window.location.reload();
    }
  };

  const newChat = () => {
    try {
      const d = JSON.parse(localStorage.getItem(BP_KEY) || '{"state":{}}');
      if (d.state) delete d.state.conversationId;
      localStorage.setItem(BP_KEY, JSON.stringify(d));
      setActiveId(null);
      if (window.innerWidth < 768) setIsSidebarOpen(false);
      initBotpress();
    } catch {
      window.location.reload();
    }
  };

  const clearAll = () => {
    if (!confirm('Hapus semua riwayat percakapan?')) return;
    deleteAllSessions();
    localStorage.removeItem(BP_KEY);
    setHistory([]); setActiveId(null);
    window.location.reload();
  };

  const deleteOne = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const item = history.find(h => h.id === id);
    if (item?.serverId) deleteSession(item.serverId);
    setHistory(prev => prev.filter(h => h.id !== id));
    // If we deleted the active conversation, start a new one
    if (activeId === id) newChat();
  };

  /* ── Render ── */
  return (
    <AppLayout>
      <Head title="DTC AI – Chatbot" />
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-white relative">

        {/* ─── MOBILE OVERLAY ─── */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-10 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* ─── LEFT SIDEBAR ─── */}
        <aside className={`shrink-0 bg-white border-r border-gray-100 flex flex-col transition-all duration-300 absolute md:relative z-20 h-full overflow-hidden ${isSidebarOpen ? 'w-64 md:w-56 translate-x-0' : 'w-64 md:w-0 -translate-x-full md:translate-x-0 border-r-0'}`}>
          {/* Header Sidebar Mobile Only */}
          <div className="flex md:hidden items-center justify-between p-4 border-b border-gray-100">
            <span className="font-bold text-gray-900">Riwayat Chat</span>
            <button onClick={() => setIsSidebarOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg bg-gray-50">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* New chat */}
          <div className="p-3">
            <button onClick={newChat}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all group">
              <svg className="w-4 h-4 text-amber-500 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Percakapan Baru
            </button>
          </div>

          {/* Label */}
          <div className="px-4 pt-1 pb-2">
            <p className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">Riwayat</p>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-3 space-y-1">
            {history.length > 0 ? history.map(h => (
              <div key={h.id}
                onClick={() => switchChat(h.id)}
                className={`group w-full flex items-start justify-between gap-1 px-3 py-3 rounded-xl cursor-pointer transition-all ${activeId === h.id
                    ? 'bg-amber-50 border-l-[3px] border-l-amber-400 border border-amber-200'
                    : 'border border-transparent hover:bg-gray-50'
                  }`}>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-bold truncate ${activeId === h.id ? 'text-gray-900' : 'text-gray-700'}`}>{h.title}</p>
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">{h.preview}</p>
                </div>
                <button
                  onClick={(e) => deleteOne(e, h.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all shrink-0 mt-0.5"
                  title="Hapus percakapan ini"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-32 gap-2 text-center px-2">
                <svg className="w-8 h-8 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
                <p className="text-[11px] text-gray-400">Belum ada riwayat</p>
              </div>
            )}
          </div>

          {/* Clear */}
          <div className="p-3 border-t border-gray-100">
            <button onClick={clearAll}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-all">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Hapus riwayat
            </button>
          </div>
        </aside>

        {/* ─── MAIN CHAT ─── */}
        <div className="flex-1 flex flex-col overflow-hidden relative">

          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white border-b border-gray-100 shrink-0 z-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1.5 -ml-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                title="Toggle Sidebar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <p className="text-base font-bold text-gray-900">DTC AI</p>
              {status === 'ready' && (
                <span className="flex items-center gap-1 ml-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-[10px] text-green-600 font-medium">Online</span>
                </span>
              )}
              {status === 'loading' && (
                <span className="flex items-center gap-1 ml-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[10px] text-amber-500">Memuat…</span>
                </span>
              )}
            </div>
            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Menu">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
          </div>

          {/* Botpress embed */}
          <div className="flex-1 relative overflow-hidden">
            {status === 'loading' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-white">
                <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-400">Menghubungkan ke DTC AI…</p>
              </div>
            )}
            {status === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-white">
                <p className="text-sm font-semibold text-red-600">Gagal memuat DTC AI</p>
                <button onClick={() => window.location.reload()}
                  className="px-5 py-2 text-sm font-semibold bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors">
                  Coba lagi
                </button>
              </div>
            )}
            <div id="bp-embedded-webchat" className="absolute inset-0 w-full h-full" />
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
