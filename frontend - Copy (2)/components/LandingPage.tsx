import React from 'react';
import { 
  Orbit, 
  ArrowRight, 
  ShieldCheck, 
  Database, 
  Activity, 
  Globe, 
  Zap, 
  AlertTriangle, 
  Microscope, 
  Info,
  Cpu,
  BarChart3
} from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const globeImage = "https://media.istockphoto.com/id/175205370/photo/view-of-earth-from-space-with-clipping-path.jpg?s=612x612&w=0&k=20&c=H8QtLFn-wnTh1leECdU390XQzzjLy1ZCAJiUcESZFlw=";

  return (
    <div className="min-h-screen w-full bg-transparent flex flex-col items-center selection:bg-sky-500/30 overflow-y-auto custom-scrollbar relative z-10">
      {/* Hero Section */}
      <section className="min-h-screen w-full flex flex-col lg:flex-row items-center justify-center px-8 lg:px-24 py-20 relative shrink-0">
        
        <div className="w-full lg:w-2/3 z-10 space-y-10">
          <div className="animate-in fade-in slide-in-from-left delay-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sky-600/20 rounded-2xl flex items-center justify-center border border-sky-500/30 shadow-[0_0_25px_rgba(14,165,233,0.3)]">
                <Orbit className="text-sky-400 w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-sky-400 font-bold text-[10px] uppercase tracking-[0.5em] leading-none mb-1">Deep Space Network</span>
                <span className="text-slate-500 font-bold text-[8px] uppercase tracking-[0.2em]">Uplink Status: Optimized // Sector A-9</span>
              </div>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-left delay-300">
            <h1 className="text-6xl lg:text-9xl font-space font-bold text-white leading-[0.9] tracking-tighter">
              Cosmic <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600">Watch</span>
            </h1>
            <p className="mt-8 text-slate-400 text-lg lg:text-2xl font-medium leading-relaxed max-w-xl border-l-2 border-sky-500/20 pl-6">
              Establish a direct uplink with NASA NeoWs telemetry. Monitoring 35,000+ near-earth objects with real-time risk evaluation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 animate-in fade-in slide-in-from-left delay-500">
            <button 
              onClick={onEnter}
              className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center gap-6 shadow-2xl shadow-blue-600/30 group active:scale-95"
            >
              LOGIN / INITIALIZE
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </button>
            
            <div className="flex items-center gap-4 px-8 py-5 glass rounded-2xl border border-white/5 group">
              <div className="relative">
                <ShieldCheck className="text-emerald-500" size={24} />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">System Integrity</span>
                <span className="text-white font-bold text-xs tracking-widest uppercase">Verified Secure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Focal Point */}
        <div className="w-full lg:w-1/3 h-full relative flex items-center justify-center lg:justify-end py-20 lg:py-0 z-10">
          <div className="relative animate-in fade-in zoom-in delay-700">
            {/* Pulsing Aura */}
            <div className="absolute inset-0 bg-sky-500/20 rounded-full blur-[120px] animate-pulse" />
            
            <div className="relative z-10 p-4">
              <img 
                src={globeImage} 
                alt="Revolving Earth" 
                className="w-80 h-80 lg:w-[450px] lg:h-[450px] object-contain drop-shadow-[0_0_80px_rgba(56,189,248,0.4)] rounded-full animate-[spin_120s_linear_infinite]"
              />
            </div>
            
            {/* Tech Overlays */}
            <div className="absolute -inset-10 border border-sky-500/10 rounded-full animate-[spin_60s_linear_infinite] pointer-events-none" />
            <div className="absolute -inset-20 border border-white/5 rounded-full animate-[spin_90s_linear_infinite_reverse] pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Data Ticker */}
      <div className="w-full glass border-y border-white/5 py-4 overflow-hidden relative z-20">
        <div className="flex items-center gap-20 whitespace-nowrap animate-marquee">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-20">
              <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                <Activity size={12} className="text-sky-500" /> SENSOR_GRID: [OPTIMAL]
              </span>
              <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                <Zap size={12} className="text-amber-500" /> LATENCY: 31MS
              </span>
              <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                <Globe size={12} className="text-emerald-500" /> SCAN_RADIUS: 7.5M KM
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;