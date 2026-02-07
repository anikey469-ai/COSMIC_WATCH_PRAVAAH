
import React, { useMemo } from 'react';
import { NearEarthObject } from '../types';
import { Trash2, AlertCircle, ExternalLink, Zap, Maximize2, Navigation, ShieldCheck, Clock } from 'lucide-react';

interface WatchlistProps {
  neos: NearEarthObject[];
  watchlist: string[];
  onRemove: (id: string) => void;
}

const Watchlist: React.FC<WatchlistProps> = ({ neos, watchlist, onRemove }) => {
  // We need to check the local storage for overrides because the risk score visibility depends on verification
  const overrides = useMemo(() => {
    const saved = localStorage.getItem('cosmic_researcher_overrides');
    return saved ? JSON.parse(saved) : {};
  }, []);

  const watchedNeos = neos.filter(n => watchlist.includes(n.id)).map(neo => {
    const override = overrides[neo.id];
    return {
      ...neo,
      is_verified: !!override,
      display_score: override ? override.score : neo.risk_score
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-slate-900/20 p-6 rounded-[2rem] border border-slate-800/50">
        <div className="space-y-1">
          <h2 className="text-2xl font-space font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600">Monitored Entities</h2>
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">
            {watchedNeos.length} OBJECTS UNDER HIGH-FREQUENCY SURVEILLANCE
          </p>
        </div>
      </div>

      {watchedNeos.length === 0 ? (
        <div className="glass rounded-[3rem] p-24 flex flex-col items-center justify-center text-center space-y-6 border-dashed border-2 border-slate-800">
          <div className="p-6 bg-slate-900 rounded-full border border-slate-800 shadow-2xl">
            <AlertCircle size={48} className="text-slate-700" />
          </div>
          <div>
            <h3 className="text-xl font-space font-bold text-slate-400 uppercase tracking-widest">Surveillance Deck Empty</h3>
            <p className="text-sm text-slate-600 max-w-xs mx-auto leading-relaxed mt-2">
              Add objects from the Telemetry Grid to begin real-time orbital analysis and risk tracking.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {watchedNeos.map((neo) => {
            const velocity = parseFloat(neo.close_approach_data[0]?.relative_velocity?.kilometers_per_hour || '0');
            const missDist = parseFloat(neo.close_approach_data[0]?.miss_distance?.kilometers || '0');
            const maxDiam = neo.estimated_diameter.meters.estimated_diameter_max;

            return (
              <div key={neo.id} className="glass p-8 rounded-[2.5rem] flex flex-col xl:flex-row items-center justify-between gap-8 hover:border-amber-500/30 transition-all border border-slate-800 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[50px] pointer-events-none"></div>
                
                <div className="flex items-center gap-8 w-full xl:w-auto">
                  <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center font-bold text-2xl border transition-all ${neo.is_potentially_hazardous_asteroid ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-sky-500/10 text-sky-500 border-sky-500/20'}`}>
                    {neo.name.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-space font-bold text-xl group-hover:text-amber-400 transition-colors">{neo.name}</h4>
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] text-slate-600 uppercase font-mono tracking-widest">OSG_REF: {neo.neo_reference_id}</p>
                      {/* Detailed Review Status for Watchlist */}
                      <div className={`flex items-center gap-1.5 py-0.5 px-2 rounded-md w-fit border ${neo.is_verified ? 'bg-indigo-500/5 border-indigo-500/20 text-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                        {neo.is_verified ? <ShieldCheck size={10} /> : <Clock size={10} />}
                        <span className="text-[8px] font-black uppercase tracking-[0.1em]">
                          {neo.is_verified ? 'Status: Reviewed' : 'Status: Pending Review'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full xl:w-auto flex-1 px-4">
                  <div className="space-y-1">
                    <span className="flex items-center gap-2 text-slate-500 text-[9px] uppercase font-black tracking-[0.2em] mb-1">
                      <Zap size={10} className="text-indigo-400" /> Velocity
                    </span>
                    <span className="text-sm font-mono text-slate-200 font-bold tracking-tighter">
                      {Math.round(velocity).toLocaleString()} <span className="text-[10px] opacity-40 uppercase">km/h</span>
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="flex items-center gap-2 text-slate-500 text-[9px] uppercase font-black tracking-[0.2em] mb-1">
                      <Maximize2 size={10} className="text-emerald-400" /> Diameter
                    </span>
                    <span className="text-sm font-mono text-slate-200 font-bold tracking-tighter">
                      {Math.round(maxDiam)} <span className="text-[10px] opacity-40 uppercase">meters</span>
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="flex items-center gap-2 text-slate-500 text-[9px] uppercase font-black tracking-[0.2em] mb-1">
                      <Navigation size={10} className="text-sky-400" /> Proximity
                    </span>
                    <span className="text-sm font-mono text-slate-200 font-bold tracking-tighter">
                      {(missDist / 1000000).toFixed(2)} <span className="text-[10px] opacity-40 uppercase">M km</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full xl:w-auto justify-end">
                  <div className={`px-6 py-2 bg-slate-900 border border-slate-800 rounded-2xl text-center hidden sm:block ${!neo.is_verified ? 'opacity-30' : ''}`}>
                     <span className="block text-[8px] text-slate-600 font-bold uppercase tracking-widest mb-1">AI Risk</span>
                     <span className={`${neo.is_verified ? 'text-amber-400' : 'text-slate-600'} font-mono font-black text-sm`}>
                       {neo.is_verified ? `${neo.display_score}%` : '---%'}
                     </span>
                  </div>
                  
                  <div className="flex gap-3">
                    <a 
                      href={neo.nasa_jpl_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-slate-400 hover:text-sky-400 transition-all flex items-center justify-center group/link"
                      title="View Scientific Datasheet"
                    >
                      <ExternalLink size={20} className="group-hover/link:scale-110 transition-transform" />
                    </a>
                    <button 
                      onClick={() => onRemove(neo.id)}
                      className="p-4 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-2xl text-red-500/60 hover:text-red-500 transition-all flex items-center justify-center group/trash"
                      title="End Surveillance"
                    >
                      <Trash2 size={20} className="group-hover/trash:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
            })}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
