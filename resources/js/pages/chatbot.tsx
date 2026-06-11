import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { type SharedData } from '@/types';
import axios from 'axios';

const BP_INJECT = 'https://cdn.botpress.cloud/webchat/v3.6/inject.js';
const BP_CONFIG = 'https://files.bpcontent.cloud/2026/06/09/06/20260609062352-RVLJACWF.js';

// Hardcoded config extracted from the provided script URL
const BP_BOT_ID = "f0e8050a-1996-4989-b0ca-13d1c897145c";
const BP_CLIENT_ID = "1b124a39-d1f9-432a-8ecb-582b897fc623";

declare global {
  interface Window {
    botpress?: { 
      init(config: any): void; 
      open(): void; 
      close(): void; 
      on(e: string, cb: () => void): void 
    };
  }
}

/** Outer CSS: repositions #fab-root inside our container */
const OUTER_CSS = `
  #fab-root {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100% !important;
    height: 100% !important;
    max-width: none !important;
    max-height: none !important;
    z-index: 40 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }
`;

/** CSS injected INTO the Shadow DOM of #fab-root to expand inner panels */
const SHADOW_CSS = `
  /* Hide the launcher/fab button */
  button[class*="Fab"],
  button[class*="fab"],
  button[class*="launcher"],
  button[class*="Launcher"],
  [data-testid*="fab"],
  [data-testid*="launcher"] {
    display: none !important;
    pointer-events: none !important;
  }

  /* Hide the Botpress internal header since we have our own DTC AI header */
  header, 
  [class*="Header"], 
  [class*="header"], 
  [data-testid*="header"] {
    display: none !important;
  }

  /* Force the chat window to fill 100% of the shadow host cleanly without breaking inputs */
  :host, #webchat-root, .bpWebchat,
  .bpLayout, .bpWindow, .bpContainer,
  iframe {
    position: static !important;
    width: 100% !important;
    height: 100% !important;
    max-width: 100% !important;
    max-height: 100% !important;
    min-width: 0 !important;
    min-height: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    transform: none !important;
    inset: auto !important;
    bottom: auto !important;
    right: auto !important;
    top: 0 !important;
    left: 0 !important;
    border: none !important;
  }

  /* Fix composer height without restricting its width */
  .bpComposerContainer, div[class*="Composer"] {
    max-width: none !important;
    width: calc(100% - 32px) !important;
    height: auto !important;
    min-height: 48px !important;
    max-height: 200px !important;
    margin: 0 16px 16px 16px !important;
    border-radius: 12px !important;
  }
  
  /* Ensure the text area itself isn't stretched to 100% of the screen height */
  textarea, input[type="text"], .bpComposerInput {
    height: auto !important;
    min-height: 24px !important;
  }
`;

function injectIntoShadow() {
  const fabRoot = document.getElementById('fab-root');
  if (!fabRoot) return false;

  function applyToShadow(el: Element) {
    if (el.shadowRoot) {
      const existing = el.shadowRoot.getElementById('dtc-shadow-style');
      if (!existing) {
        const s = document.createElement('style');
        s.id = 'dtc-shadow-style';
        s.textContent = SHADOW_CSS;
        el.shadowRoot.prepend(s);
      }
      el.shadowRoot.querySelectorAll('*').forEach(applyToShadow);
    }
  }

  applyToShadow(fabRoot);
  fabRoot.querySelectorAll('*').forEach(applyToShadow);
  return true;
}

interface ChatSession {
  id: number;
  botpress_conversation_id: string;
  title: string;
  updated_at: string;
}

export default function ChatbotPage() {
  const { auth } = usePage<SharedData>().props;
  const [status, setStatus]   = useState<'idle'|'loading'|'ready'|'error'>('idle');
  const [started, setStarted] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  const BP_STORAGE_KEY = `bp-webchat-${BP_CLIENT_ID}-client`;

  /* ── Load Sessions ── */
  const fetchSessions = async () => {
    try {
      const res = await axios.get('/api/chat-sessions');
      setSessions(res.data);
    } catch (e) {
      console.error("Failed to load sessions", e);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  /* ── Mount: Handle URL Routing & CSS ── */
  useEffect(() => {
    document.body.classList.add('dtc-chatbot-page');
    const style = document.createElement('style');
    style.id = 'bp-fullpage-css';
    style.textContent = OUTER_CSS;
    document.head.appendChild(style);
    styleRef.current = style;

    // Check for URL commands
    const params = new URLSearchParams(window.location.search);
    const newChat = params.get('new');
    const loadChat = params.get('chat');
    const prompt = params.get('prompt');

    if (newChat || loadChat) {
      // Modify Botpress LocalStorage before it loads
      try {
        const clientData = JSON.parse(localStorage.getItem(BP_STORAGE_KEY) || '{"state":{}}');
        if (!clientData.state) clientData.state = {};
        
        if (newChat) {
          delete clientData.state.conversationId;
        } else if (loadChat) {
          clientData.state.conversationId = loadChat;
        }
        localStorage.setItem(BP_STORAGE_KEY, JSON.stringify(clientData));
      } catch (e) {
        console.error("Failed to modify botpress storage", e);
      }

      // Clean URL
      window.history.replaceState({}, '', '/chatbot');
      
      // Auto-start
      startChatWrapper(prompt || undefined);
    }

    return () => {
      document.body.classList.remove('dtc-chatbot-page');
      style.remove();
      window.botpress?.close();
    };
  }, []);

  /* ── Synchronize new conversations with DB ── */
  const syncConversation = async () => {
    try {
      const clientData = JSON.parse(localStorage.getItem(BP_STORAGE_KEY) || '{}');
      const cid = clientData?.state?.conversationId;
      if (!cid) return;
      
      setActiveConversationId(cid);

      // Check if we already have this in DB state
      // (Using a functional set state to get latest or just fetching again)
      const res = await axios.get('/api/chat-sessions');
      const updatedSessions = res.data;
      setSessions(updatedSessions);

      if (!updatedSessions.find((s: ChatSession) => s.botpress_conversation_id === cid)) {
        // Save new conversation to DB
        await axios.post('/api/chat-sessions', {
          botpress_conversation_id: cid,
          title: 'Percakapan Baru'
        });
        fetchSessions(); // Refresh list
      }
    } catch (e) {
      console.error("Failed to sync botpress conversation", e);
    }
  };

  /* ── Init Botpress ── */
  const startChatWrapper = (initialPrompt?: string) => {
    setStarted(true);
    setStatus('loading');

    const bootBotpressWithConfig = () => {
      const shadowPoll = (m = 0) => {
        const fabRoot = document.getElementById('fab-root');
        const container = document.getElementById('bp-container');
        if (fabRoot && container && fabRoot.parentElement !== container) {
           container.appendChild(fabRoot);
        }
        if (injectIntoShadow()) {
           window.botpress?.open();
           setStatus('ready');
           
           // Wait a moment for Botpress to generate ID and save to LocalStorage, then sync
           setTimeout(syncConversation, 1500);
           return;
        }
        if (m < 40) setTimeout(() => shadowPoll(m + 1), 250);
      };

      // Load their custom config script which automatically calls window.botpress.init()
      if (!document.getElementById('bp-config')) {
        const c = document.createElement('script');
        c.id = 'bp-config';
        c.src = BP_CONFIG;
        c.defer = true;
        c.onload = () => shadowPoll();
        document.head.appendChild(c);
      } else {
        shadowPoll();
      }
    };

    if (!document.getElementById('bp-inject')) {
      const s = document.createElement('script');
      s.id = 'bp-inject';
      s.src = BP_INJECT;
      s.async = true;
      s.onload = bootBotpressWithConfig;
      s.onerror = () => setStatus('error');
      document.head.appendChild(s);
    } else {
      bootBotpressWithConfig();
    }
  };

  const deleteSession = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm("Hapus percakapan ini?")) return;
    try {
      const sToDelete = sessions.find(x => x.id === id);
      await axios.delete(`/api/chat-sessions/${id}`);
      setSessions(s => s.filter(x => x.id !== id));
      
      if (sToDelete?.botpress_conversation_id === activeConversationId) {
        window.location.href = '/chatbot?new=1';
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getInitials = (n?: string) =>
    n?.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2) || 'AA';

  return (
    <AppLayout>
      <Head title="DTC AI – Chatbot" />
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-[#f9f9f9]">

        {/* Sidebar */}
        <aside className="w-64 shrink-0 bg-white border-r border-gray-100 flex flex-col">
          <div className="p-3">
            <button
              onClick={() => { window.location.href = '/chatbot?new=1'; }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-500 group-hover:rotate-90 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Percakapan Baru
            </button>
          </div>

          <div className="px-4 pt-2 pb-1">
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Riwayat</p>
          </div>

          <div className="flex-1 overflow-y-auto px-3 space-y-1">
            {sessions.length > 0 ? (
              sessions.map(s => (
                <div 
                  key={s.id}
                  onClick={() => window.location.href = `/chatbot?chat=${s.botpress_conversation_id}`}
                  className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    activeConversationId === s.botpress_conversation_id 
                    ? 'bg-amber-50 border border-amber-200' 
                    : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 shrink-0 ${activeConversationId === s.botpress_conversation_id ? 'text-amber-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                    <span className={`text-xs font-semibold truncate ${activeConversationId === s.botpress_conversation_id ? 'text-amber-700' : 'text-gray-600'}`}>
                      {s.title}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => deleteSession(e, s.id)} 
                    className="text-amber-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors flex-shrink-0"
                    title="Hapus percakapan ini"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-center px-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
                <p className="text-[11px] text-gray-400">Belum ada riwayat</p>
              </div>
            )}
          </div>

          {/* User */}
          <div className="border-t border-gray-100 p-3 space-y-1.5">
            <div className="flex items-center gap-2.5 px-2 py-1.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                {getInitials(auth.user?.name)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{auth.user?.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{auth.user?.email}</p>
              </div>
            </div>
            {sessions.length > 0 && (
              <button
                onClick={async () => {
                  if (window.confirm('Hapus semua riwayat percakapan?')) {
                    try {
                      await axios.delete('/api/chat-sessions/all');
                      setSessions([]);
                      localStorage.removeItem(`bp-webchat-${BP_CLIENT_ID}-client`);
                      window.location.href = '/chatbot';
                    } catch (e) {
                      console.error(e);
                    }
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs text-red-500 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Hapus semua riwayat
              </button>
            )}
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden relative">

          {/* Header bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shrink-0 z-10 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 leading-none">DTC AI</p>
                <p className="text-[10px] mt-0.5 flex items-center gap-1">
                  {status === 'ready' && <><span className="w-1.5 h-1.5 rounded-full bg-green-500" /><span className="text-green-600">Online</span></>}
                  {status === 'loading' && <><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /><span className="text-amber-500">Memuat…</span></>}
                  {status === 'idle' && <span className="text-gray-400">Asisten AI DTC</span>}
                  {status === 'error' && <><span className="w-1.5 h-1.5 rounded-full bg-red-500" /><span className="text-red-500">Error</span></>}
                </p>
              </div>
            </div>
            <span className="hidden sm:block text-xs text-gray-400">
              Hi, <span className="font-semibold text-gray-700">{auth.user?.name?.split(' ')[0]}</span> 👋
            </span>
          </div>

          {/* Welcome / loading overlay */}
          {!started && (
            <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6 py-12 overflow-y-auto">
              <div className="flex flex-col items-center gap-4 mt-8">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                </div>
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900">Hai, {auth.user?.name?.split(' ')[0] || 'Mahasiswa'}! 👋</h1>
                  <p className="text-gray-500 text-sm mt-1.5 max-w-sm">Saya <span className="font-semibold text-amber-600">DTC AI</span>, asisten virtual Digital Talent Centre. Ada yang bisa saya bantu?</p>
                </div>
              </div>
              <button onClick={() => window.location.href = '/chatbot?new=1'}
                className="flex items-center gap-2.5 px-7 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                Mulai Chat dengan DTC AI
              </button>
            </div>
          )}

          {/* Loading while scripts fetch */}
          {started && status === 'loading' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Menghubungkan ke DTC AI…</p>
            </div>
          )}

          {/* Error */}
          {started && status === 'error' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <p className="text-sm font-semibold text-red-600">Gagal memuat DTC AI</p>
              <button onClick={() => window.location.reload()}
                className="px-5 py-2 text-sm font-semibold bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors">
                Coba lagi
              </button>
            </div>
          )}

          {/* This container holds the moved Botpress element */}
          {started && (
             <div id="bp-container" className={`absolute top-16 left-0 right-0 bottom-0 z-0 ${status === 'ready' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`} />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
