
import React, { useState, useMemo, useEffect } from 'react';
import { NearEarthObject, UserRole } from '../types';
import { getRiskColor, getRiskLevel } from '../services/risk';
import { 
  ArrowRight, 
  Star, 
  Microscope, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  X,
  ShieldCheck,
  BrainCircuit,
  FileText,
  AlertTriangle,
  Zap,
  Maximize2,
  Navigation,
  Activity,
  EyeOff,
  Calendar,
  ShieldAlert,
  Skull,
  Info
} from 'lucide-react';

interface DashboardProps {
  neos: NearEarthObject[];
  loading: boolean;
  userRole: UserRole;
  watchlist: string[];
  toggleWatchlist: (id: string) => void;
}

const ITEMS_PER_PAGE = 6;

type SizeFilter = 'all' | 'small' | 'medium' | 'large';
type RiskFilter = 'all' | 'low' | 'elevated' | 'critical';
type VelocityFilter = 'all' | 'slow' | 'moderate' | 'fast';
type SortBy = 'none' | 'date_desc' | 'date_asc' | 'risk_desc' | 'miss_asc';

const Dashboard: React.FC<DashboardProps> = ({ neos, loading, userRole, watchlist, toggleWatchlist }) => {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingNeo, setEditingNeo] = useState<NearEarthObject | null>(null);
  
  const [hazardFilter, setHazardFilter] = useState<'all' | 'hazardous'>('all');
  const [sizeFilter, setSizeFilter] = useState<SizeFilter>('all');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [velocityFilter, setVelocityFilter] = useState<VelocityFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('none');

  const [overrides, setOverrides] = useState<Record<string, { score: number, notes: string }>>({});

  useEffect(() => {
    const savedOverrides = localStorage.getItem('cosmic_researcher_overrides');
    if (savedOverrides) setOverrides(JSON.parse(savedOverrides));
  }, []);

  const saveOverride = (id: string, score: number, notes: string) => {
    const newOverrides = { ...overrides, [id]: { score, notes } };
    setOverrides(newOverrides);
    localStorage.setItem('cosmic_researcher_overrides', JSON.stringify(newOverrides));
    setEditingNeo(null);
  };

  const processedNeos = useMemo(() => {
    const base = neos.map(neo => {
      const override = overrides[neo.id];
      return {
        ...neo,
        is_verified: !!override,
        display_score: override ? override.score : neo.risk_score,
        researcher_notes: override ? override.notes : undefined,
      };
    }).filter(neo => {
      const matchesSearch = neo.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesHazard = hazardFilter === 'all' || neo.is_potentially_hazardous_asteroid;
      
      const diameter = neo.estimated_diameter.meters.estimated_diameter_max;
      let matchesSize = true;
      if (sizeFilter === 'small') matchesSize = diameter < 50;
      else if (sizeFilter === 'medium') matchesSize = diameter >= 50 && diameter <= 500;
      else if (sizeFilter === 'large') matchesSize = diameter > 500;

      const score = neo.is_verified ? neo.display_score : -1;
      let matchesRisk = true;
      if (riskFilter !== 'all') {
         if (!neo.is_verified) matchesRisk = false;
         else if (riskFilter === 'low') matchesRisk = score! < 40;
         else if (riskFilter === 'elevated') matchesRisk = score! >= 40 && score! < 75;
         else if (riskFilter === 'critical') matchesRisk = score! >= 75;
      }

      const velocity = parseFloat(neo.close_approach_data[0]?.relative_velocity?.kilometers_per_hour || '0');
      let matchesVelocity = true;
      if (velocityFilter === 'slow') matchesVelocity = velocity < 30000;
      else if (velocityFilter === 'moderate') matchesVelocity = velocity >= 30000 && velocity <= 70000;
      else if (velocityFilter === 'fast') matchesVelocity = velocity > 70000;

      return matchesSearch && matchesHazard && matchesSize && matchesRisk && matchesVelocity;
    });

    if (sortBy === 'none') return base;
    
    return [...base].sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.close_approach_data[0].close_approach_date).getTime() - new Date(a.close_approach_data[0].close_approach_date).getTime();
      if (sortBy === 'date_asc') return new Date(a.close_approach_data[0].close_approach_date).getTime() - new Date(b.close_approach_data[0].close_approach_date).getTime();
      if (sortBy === 'risk_desc') return (b.display_score || 0) - (a.display_score || 0);
      if (sortBy === 'miss_asc') return parseFloat(a.close_approach_data[0].miss_distance.kilometers) - parseFloat(b.close_approach_data[0].miss_distance.kilometers);
      return 0;
    });
  }, [neos, overrides, searchQuery, hazardFilter, sizeFilter, riskFilter, velocityFilter, sortBy]);

  const totalPages = Math.ceil(processedNeos.length / ITEMS_PER_PAGE);
  const paginatedNeos = processedNeos.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const stats = useMemo(() => {
    const hazardousCount = neos.filter(n => n.is_potentially_hazardous_asteroid).length;
    const avgVelocity = neos.reduce((acc, n) => acc + parseFloat(n.close_approach_data[0]?.relative_velocity?.kilometers_per_hour || '0'), 0) / (neos.length || 1);
    const closestMiss = Math.min(...neos.map(n => parseFloat(n.close_approach_data[0]?.miss_distance?.kilometers || '1000000000')));
    return { hazardousCount, avgVelocity, closestMiss };
  }, [neos]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium animate-pulse tracking-[0.2em] uppercase text-xs text-center">Synchronizing Deep Space Sensors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Telemetry Control */}
        <section className="lg:col-span-3 space-y-4 bg-slate-900/20 p-6 rounded-[2rem] border border-slate-800/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-space font-bold flex items-center gap-3">
                <Activity size={22} className="text-sky-400" />
                Orbital Surveillance Grid
              </h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{processedNeos.length} TELEMETRY FEEDS ACTIVE</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative group w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input type="text" placeholder="Find Object ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-sky-500/50 outline-none transition-all placeholder:text-slate-700" />
              </div>
              <button onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)} className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border transition-all text-sm font-bold w-full sm:w-auto ${isFilterPanelOpen ? 'bg-sky-500 border-sky-400 text-white shadow-lg shadow-sky-500/20' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}>
                <Filter size={18} /> Telemetry Filters
              </button>
            </div>
          </div>
          {isFilterPanelOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-slate-800 animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Threat Evaluation</label>
                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button onClick={() => setHazardFilter('all')} className={`flex-1 py-1 text-[10px] rounded transition-all ${hazardFilter === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-600'}`}>ALL</button>
                  <button onClick={() => setHazardFilter('hazardous')} className={`flex-1 py-1 text-[10px] rounded transition-all ${hazardFilter === 'hazardous' ? 'bg-red-500/20 text-red-400 font-bold' : 'text-slate-600'}`}>HAZARD</button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Physical Size</label>
                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button onClick={() => setSizeFilter('all')} className={`flex-1 py-1 text-[10px] rounded transition-all ${sizeFilter === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-600'}`}>ALL</button>
                  <button onClick={() => setSizeFilter('small')} className={`flex-1 py-1 text-[10px] rounded transition-all ${sizeFilter === 'small' ? 'bg-sky-500/20 text-sky-400 font-bold' : 'text-slate-600'}`}>S</button>
                  <button onClick={() => setSizeFilter('medium')} className={`flex-1 py-1 text-[10px] rounded transition-all ${sizeFilter === 'medium' ? 'bg-sky-500/20 text-sky-400 font-bold' : 'text-slate-600'}`}>M</button>
                  <button onClick={() => setSizeFilter('large')} className={`flex-1 py-1 text-[10px] rounded transition-all ${sizeFilter === 'large' ? 'bg-sky-500/20 text-sky-400 font-bold' : 'text-slate-600'}`}>L</button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Active Ordering</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-[10px] text-slate-300 font-bold outline-none focus:border-sky-500/50 transition-all uppercase tracking-widest">
                  <option value="none">NATURAL ORDER</option>
                  <option value="date_desc">CHRONOLOGICAL (NEWEST)</option>
                  <option value="date_asc">CHRONOLOGICAL (OLDEST)</option>
                  <option value="risk_desc">THREAT LEVEL (MAX)</option>
                  <option value="miss_asc">PROXIMITY (CLOSEST)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Relative Speed</label>
                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button onClick={() => setVelocityFilter('all')} className={`flex-1 py-1 text-[10px] rounded transition-all ${velocityFilter === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-600'}`}>ALL</button>
                  <button onClick={() => setVelocityFilter('slow')} className={`flex-1 py-1 text-[10px] rounded transition-all ${velocityFilter === 'slow' ? 'bg-indigo-500/20 text-indigo-400 font-bold' : 'text-slate-600'}`}>SLW</button>
                  <button onClick={() => setVelocityFilter('fast')} className={`flex-1 py-1 text-[10px] rounded transition-all ${velocityFilter === 'fast' ? 'bg-indigo-500/20 text-indigo-400 font-bold' : 'text-slate-600'}`}>FST</button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Intelligence Context Panel */}
        <aside className="bg-sky-500/5 p-6 rounded-[2rem] border border-sky-500/20 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Info size={16} className="text-sky-400" />
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">System Intelligence</h3>
          </div>
          <div className="space-y-3">
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Closest Miss (km)</span>
              <span className="text-sm font-mono text-sky-400 font-bold">{(stats.closestMiss / 1000).toFixed(1)}k</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Avg Grid Velocity</span>
              <span className="text-sm font-mono text-emerald-400 font-bold">{Math.round(stats.avgVelocity).toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Potential Hazards</span>
              <span className="text-sm font-mono text-red-500 font-bold">{stats.hazardousCount}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-sky-500/10">
            <p className="text-[9px] text-slate-500 leading-relaxed uppercase font-bold">Planetary integrity stable. No immediate impact events projected within current detection window.</p>
          </div>
        </aside>
      </div>

      <div className={`flex items-center gap-4 border p-4 rounded-2xl animate-in slide-in-from-left duration-500 ${userRole === 'researcher' ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-slate-800/10 border-slate-800/20'}`}>
        <div className={`p-2 rounded-xl ${userRole === 'researcher' ? 'bg-indigo-500/20' : 'bg-slate-800/30'}`}>
          {userRole === 'researcher' ? <BrainCircuit size={20} className="text-indigo-400" /> : <ShieldAlert size={20} className="text-slate-400" />}
        </div>
        <div>
          <h4 className={`text-xs font-bold uppercase tracking-widest ${userRole === 'researcher' ? 'text-indigo-300' : 'text-slate-400'}`}>{userRole === 'researcher' ? 'Researcher Clearance Active' : 'Observer Feed Integrity'}</h4>
          <p className={`text-[10px] leading-relaxed font-medium ${userRole === 'researcher' ? 'text-indigo-300/60' : 'text-slate-500'}`}>
            {userRole === 'researcher' ? 'You are authorized to manually assess risk levels and override automated telemetry results.' : 'Items tagged as "REVIEWED" have been manually verified. You can apply filters to threats but cannot modify assessments.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {paginatedNeos.map((neo) => {
          const velocity = parseFloat(neo.close_approach_data[0]?.relative_velocity?.kilometers_per_hour || '0');
          const maxDiam = neo.estimated_diameter.meters.estimated_diameter_max;
          const isWatched = watchlist.includes(neo.id);
          const approachDate = neo.close_approach_data[0]?.close_approach_date || 'Unknown';
          const approachYear = approachDate.split('-')[0];
          const isHazard = neo.is_potentially_hazardous_asteroid;

          return (
            <div key={neo.id} className={`glass rounded-[2rem] border transition-all duration-500 group overflow-hidden ${isHazard ? 'border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.15)] ring-1 ring-red-500/20' : neo.is_verified ? 'border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.1)] ring-1 ring-indigo-500/20' : 'border-slate-800 hover:border-slate-700'}`}>
              <div className="p-6 space-y-5">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className={`font-space font-bold text-lg transition-colors ${isHazard ? 'text-red-200' : neo.is_verified ? 'text-indigo-200' : 'text-slate-200'}`}>{neo.name}</h4>
                      {neo.is_verified ? (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[9px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                          <ShieldCheck size={10} className="animate-pulse" /> Verified
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-500 text-[9px] font-black uppercase tracking-wider"><Search size={10} /> Pending</div>
                      )}
                      {isHazard && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-500 text-[9px] font-black uppercase tracking-wider animate-bounce"><Skull size={10} /> Hazard</div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-600 uppercase font-mono tracking-widest">TAG: {neo.neo_reference_id}</span>
                        <div className="flex items-center gap-1 text-[9px] text-emerald-500/70 font-bold bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10"><Calendar size={10} />{approachYear}</div>
                      </div>
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 rounded-md border text-[10px] font-black tracking-tighter transition-all ${neo.is_verified ? getRiskColor(neo.display_score!) : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                    {neo.is_verified ? getRiskLevel(neo.display_score!) : 'UNASSESSED'}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  <div className={`flex justify-between items-center p-3 rounded-xl border transition-all ${isHazard ? 'bg-red-950/20 border-red-500/10' : neo.is_verified ? 'bg-indigo-950/20 border-indigo-500/10' : 'bg-slate-950/40 border-slate-800/30'}`}>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Zap size={14} className={isHazard ? 'text-red-400' : neo.is_verified ? 'text-indigo-400' : 'text-slate-600'} /><span className="text-[10px] font-bold uppercase tracking-widest">Velocity</span>
                    </div>
                    <span className={`text-xs font-mono font-bold ${isHazard ? 'text-red-100' : neo.is_verified ? 'text-indigo-100' : 'text-slate-400'}`}>{Math.round(velocity).toLocaleString()} km/h</span>
                  </div>
                  <div className={`flex justify-between items-center p-3 rounded-xl border transition-all ${isHazard ? 'bg-red-950/20 border-red-500/10' : neo.is_verified ? 'bg-indigo-950/20 border-indigo-500/10' : 'bg-slate-950/40 border-slate-800/30'}`}>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Maximize2 size={14} className={isHazard ? 'text-red-400' : neo.is_verified ? 'text-emerald-400' : 'text-slate-600'} /><span className="text-[10px] font-bold uppercase tracking-widest">Diameter</span>
                    </div>
                    <span className={`text-xs font-mono font-bold ${isHazard ? 'text-red-100' : neo.is_verified ? 'text-emerald-100' : 'text-slate-400'}`}>{Math.round(maxDiam)} m</span>
                  </div>
                  <div className={`flex justify-between items-center p-3 rounded-xl border transition-all ${isHazard ? 'bg-red-950/20 border-red-500/10' : neo.is_verified ? 'bg-indigo-950/20 border-indigo-500/10' : 'bg-slate-950/40 border-slate-800/30'}`}>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Navigation size={14} className={isHazard ? 'text-red-400' : neo.is_verified ? 'text-sky-400' : 'text-slate-600'} /><span className="text-[10px] font-bold uppercase tracking-widest">Approach Date</span>
                    </div>
                    <span className={`text-xs font-mono font-bold ${isHazard ? 'text-red-100' : neo.is_verified ? 'text-sky-100' : 'text-slate-400'}`}>{approachDate}</span>
                  </div>
                </div>
                <div className="space-y-2 pt-2 border-t border-slate-800/50">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em]">
                    <span className={`flex items-center gap-1.5 ${isHazard ? 'text-red-400' : neo.is_verified ? 'text-indigo-400' : 'text-slate-600'}`}>{neo.is_verified ? <FileText size={12} /> : <EyeOff size={12} />}{neo.is_verified ? 'Verified Risk Analysis' : 'Pending Verification'}</span>
                    <span className={neo.is_verified ? (neo.display_score! > 75 ? 'text-red-400' : 'text-indigo-400') : 'text-slate-800'}>{neo.is_verified ? `${neo.display_score}%` : '--%'}</span>
                  </div>
                  <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                    {neo.is_verified ? <div className={`h-full transition-all duration-1000 ${neo.display_score! > 70 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : neo.display_score! > 40 ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${neo.display_score}%` }} /> : <div className="h-full w-full bg-slate-900/50 relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-800 to-transparent animate-[shimmer_2s_infinite]" /></div>}
                  </div>
                </div>
              </div>
              <div className={`p-4 flex justify-between items-center border-t transition-colors ${isHazard ? 'bg-red-950/30 border-red-500/20' : neo.is_verified ? 'bg-indigo-950/30 border-indigo-500/20' : 'bg-slate-900/40 border-slate-800'}`}>
                <a href={neo.nasa_jpl_url} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-slate-500 hover:text-sky-400 transition-colors uppercase tracking-widest flex items-center gap-2">NASA Datasheet <ArrowRight size={12} /></a>
                <div className="flex items-center gap-2">
                  {userRole === 'researcher' ? (
                    <>
                      <button onClick={() => setEditingNeo(neo)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black border transition-all flex items-center gap-2 ${isHazard ? 'bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/20' : neo.is_verified ? 'bg-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-500/20' : 'bg-sky-500 text-white border-sky-400 shadow-lg shadow-sky-500/20'}`}><Microscope size={14} /> {neo.is_verified ? 'Modify Assessment' : 'Start Review'}</button>
                      <button onClick={() => toggleWatchlist(neo.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all border ${isWatched ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-slate-900 border-slate-800 text-slate-600 hover:text-amber-500'}`}><Star size={16} className={isWatched ? 'fill-amber-400 animate-in zoom-in' : ''} /><span className="text-[10px] font-black uppercase tracking-widest">{isWatched ? 'Saved' : 'Watch'}</span></button>
                    </>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950/50 text-[9px] font-bold uppercase tracking-widest text-slate-600"><ShieldAlert size={12} /> Read Only Mode</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-8">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-3 glass rounded-2xl border-slate-800 disabled:opacity-20 hover:bg-slate-800 transition-all"><ChevronLeft size={20} /></button>
          <span className="text-[10px] font-mono font-bold text-slate-600 tracking-widest uppercase">Sector {currentPage} of {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-3 glass rounded-2xl border-slate-800 disabled:opacity-20 hover:bg-slate-800 transition-all"><ChevronRight size={20} /></button>
        </div>
      )}

      {editingNeo && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl" onClick={() => setEditingNeo(null)}></div>
          <div className="relative w-full max-w-xl glass p-10 rounded-[3rem] border border-indigo-500/30 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <div><h3 className="text-2xl font-space font-bold text-indigo-400">Analysis Terminal</h3><p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.3em]">Processing: {editingNeo.name}</p></div>
              <button onClick={() => setEditingNeo(null)} className="p-2 text-slate-600 hover:text-white transition-colors bg-slate-900 rounded-xl border border-slate-800"><X size={24} /></button>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-1"><span className="block text-[9px] text-slate-500 font-bold uppercase tracking-widest">Velocity</span><span className="text-sm font-mono text-indigo-300 font-bold">{Math.round(parseFloat(editingNeo.close_approach_data[0]?.relative_velocity?.kilometers_per_hour || '0')).toLocaleString()} <span className="text-[9px] opacity-40">km/h</span></span></div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-1"><span className="block text-[9px] text-slate-500 font-bold uppercase tracking-widest">Max Size</span><span className="text-sm font-mono text-emerald-300 font-bold">{Math.round(editingNeo.estimated_diameter.meters.estimated_diameter_max)} <span className="text-[9px] opacity-40">m</span></span></div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-1"><span className="block text-[9px] text-slate-500 font-bold uppercase tracking-widest">Date</span><span className="text-sm font-mono text-sky-300 font-bold">{editingNeo.close_approach_data[0]?.close_approach_date || 'Unknown'}</span></div>
            </div>
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); const formData = new FormData(e.currentTarget); saveOverride(editingNeo.id, parseInt(formData.get('risk_score') as string), formData.get('notes') as string); }}>
              <div className="space-y-4"><div className="flex justify-between items-center"><div className="flex items-center gap-2"><BrainCircuit size={14} className="text-sky-400" /><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assessed Threat Level</label></div><span className="text-2xl font-mono font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-xl" id="score-val">{overrides[editingNeo.id]?.score || editingNeo.risk_score}%</span></div><input type="range" name="risk_score" defaultValue={overrides[editingNeo.id]?.score || editingNeo.risk_score} onChange={(e) => { const val = document.getElementById('score-val'); if (val) val.textContent = `${e.target.value}%`; }} className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500" min="0" max="100" /></div>
              <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Researcher Justification</label><textarea name="notes" defaultValue={overrides[editingNeo.id]?.notes || ''} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm focus:border-indigo-500 outline-none transition-all h-24 placeholder:text-slate-800 resize-none" placeholder="Justify the assigned risk score based on visual or mathematical anomalies..."></textarea></div>
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex gap-3"><AlertTriangle className="text-amber-500 shrink-0" size={18} /><p className="text-[10px] text-amber-200/60 leading-relaxed uppercase font-black">Submitting this analysis will mark the telemetry as human-verified for all network observers.</p></div>
              <button type="submit" className="w-full py-5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-black transition-all shadow-xl shadow-indigo-500/20 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2"><ShieldCheck size={18} />Commit Verified Analysis</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
