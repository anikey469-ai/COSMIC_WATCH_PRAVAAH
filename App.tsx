
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Orbit, 
  Star, 
  Settings, 
  Menu,
  X,
  LogOut,
  MessageSquare,
  Zap
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import OrbitView from './components/OrbitView';
import Watchlist from './components/Watchlist';
import LoginPage from './components/LoginPage';
import LandingPage from './components/LandingPage';
import SettingsModal from './components/SettingsModal';
import ChatSidebar from './components/ChatSidebar';
import { fetchNEOs } from './services/nasa';
import { NearEarthObject, UserProfile } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orbit' | 'watchlist'>('dashboard');
  const [neos, setNeos] = useState<NearEarthObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [showLanding, setShowLanding] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchNEOs();
      setNeos(data);
    } catch (error: any) {
      console.error("Failed to load NEO data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const savedUser = localStorage.getItem('cosmic_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setShowLanding(false); 
    }
    const savedWatchlist = localStorage.getItem('cosmic_watchlist');
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
  }, [loadData]);

  const toggleWatchlist = (id: string) => {
    setWatchlist(prev => {
      const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      localStorage.setItem('cosmic_watchlist', JSON.stringify(next));
      return next;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('cosmic_user');
    setUser(null);
    setShowLanding(true); 
  };

  if (showLanding && !user) {
    return <LandingPage onEnter={() => setShowLanding(false)} />;
  }

  if (!user) {
    return <LoginPage onLogin={(u) => setUser(u)} onBack={() => setShowLanding(true)} />;
  }

  return (
    <div className="flex h-screen bg-transparent text-slate-100 overflow-hidden font-inter relative">
      {/* Sidebar Navigation */}
      <aside className={`relative ${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 glass flex flex-col z-50 border-r border-white/5`}>
        <div className="p-6 flex items-center gap-3 shrink-0">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.5)] shrink-0 ${user.role === 'researcher' ? 'bg-indigo-600' : 'bg-sky-500'}`}>
            <Orbit className="text-white w-6 h-6" />
          </div>
          {isSidebarOpen && <span className="font-space font-bold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-500 whitespace-nowrap">COSMIC WATCH</span>}
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.1)]' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
          >
            <LayoutDashboard size={20} className="shrink-0" />
            {isSidebarOpen && <span className="font-medium whitespace-nowrap">Dashboard</span>}
          </button>
          <button 
            onClick={() => setActiveTab('orbit')}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${activeTab === 'orbit' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
          >
            <Orbit size={20} className="shrink-0" />
            {isSidebarOpen && <span className="font-medium whitespace-nowrap">3D Vizualizer</span>}
          </button>
          
          {user.role === 'researcher' && (
            <button 
              onClick={() => setActiveTab('watchlist')}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all relative ${activeTab === 'watchlist' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <Star size={20} className={`shrink-0 ${watchlist.length > 0 ? 'fill-amber-500/50' : ''}`} />
              {isSidebarOpen && <span className="font-medium whitespace-nowrap">Watchlist</span>}
              {watchlist.length > 0 && isSidebarOpen && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-amber-500 text-[10px] font-bold text-white flex items-center justify-center rounded-full animate-in zoom-in">
                  {watchlist.length}
                </span>
              )}
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2 shrink-0">
          <div className="relative group">
            <button className={`w-full flex items-center gap-4 p-3 rounded-xl text-slate-400 hover:bg-slate-800/50 transition-colors cursor-default`}>
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white uppercase ${user.role === 'researcher' ? 'bg-gradient-to-tr from-indigo-500 to-purple-600' : 'bg-gradient-to-tr from-sky-500 to-blue-600'}`}>
                {user.username.substring(0, 2)}
              </div>
              {isSidebarOpen && (
                <div className="flex flex-col items-start overflow-hidden text-left">
                  <span className="font-medium truncate text-slate-200 w-full">{user.username}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${user.role === 'researcher' ? 'text-indigo-400' : 'text-sky-400'}`}>{user.role}</span>
                </div>
              )}
            </button>
          </div>

          <button 
            onClick={() => setIsSettingsModalOpen(true)}
            className="w-full flex items-center gap-4 p-3 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all"
          >
            <Settings size={20} className="shrink-0" />
            {isSidebarOpen && <span className="font-medium whitespace-nowrap">Settings</span>}
          </button>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
          >
            <LogOut size={20} className="shrink-0" />
            {isSidebarOpen && <span className="font-medium whitespace-nowrap">Logout Terminal</span>}
          </button>
        </div>
        
        {/* Sidebar Toggle Button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 bg-slate-900 border border-white/10 rounded-full p-1.5 hover:bg-slate-800 transition-all text-slate-400 hover:text-white z-50 shadow-xl"
        >
          {isSidebarOpen ? <X size={12} /> : <Menu size={12} />}
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 glass z-40 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-sm lg:text-lg font-space font-bold text-slate-200 uppercase tracking-widest truncate">
              {activeTab === 'dashboard' && 'Telemetry Grid'}
              {activeTab === 'orbit' && 'Orbital Visualization'}
              {activeTab === 'watchlist' && 'Secure Watchlist'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Cosmic Comm Link Toggle */}
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all relative group ${isChatOpen ? 'bg-sky-500 border-sky-400 text-white shadow-lg shadow-sky-500/30' : 'bg-slate-900 border-white/5 text-slate-400 hover:text-sky-400 hover:border-sky-500/30'}`}
            >
              <MessageSquare size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Comm Link</span>
              {!isChatOpen && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-sky-500 rounded-full animate-ping" />
              )}
            </button>

            <div className="h-6 w-[1px] bg-white/5 mx-2 hidden sm:block" />

            <div className="hidden md:flex items-center gap-2 text-slate-500 text-[10px] font-black tracking-[0.2em]">
              <div className="relative flex h-2 w-2">
                <div className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping"></div>
                <div className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></div>
              </div>
              UPLINK: SECURE
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {activeTab === 'dashboard' && <Dashboard neos={neos} loading={loading} userRole={user.role} watchlist={watchlist} toggleWatchlist={toggleWatchlist} />}
          {activeTab === 'orbit' && <OrbitView neos={neos} />}
          {activeTab === 'watchlist' && user.role === 'researcher' && <Watchlist neos={neos} watchlist={watchlist} onRemove={toggleWatchlist} />}
        </div>
      </main>

      {/* Chat Sidebar Overlay */}
      <ChatSidebar 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        user={user} 
      />

      {/* Modals */}
      {isSettingsModalOpen && (
        <SettingsModal 
          isOpen={isSettingsModalOpen} 
          onClose={() => setIsSettingsModalOpen(false)} 
          onSave={() => loadData()} 
        />
      )}
    </div>
  );
};

export default App;
