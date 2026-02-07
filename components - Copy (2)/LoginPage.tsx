import React, { useState, useEffect } from 'react';
import { 
  Orbit, 
  Shield, 
  Microscope, 
  Mail, 
  Lock, 
  AlertCircle, 
  ChevronLeft,
  Cpu,
  Zap,
  Globe,
  Database,
  ArrowRight
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
  onBack: () => void;
}

interface RegisteredUser {
  id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onBack }) => {
  const [role, setRole] = useState<UserRole>('observer');
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The high-tech background image requested by the user
  const orbitalTechImage = "https://lh3.googleusercontent.com/gg-dl/AOI_d__JE3Ew73ju86zkFho0MPrA27KSsvvwD245NvrJYX9bAUf436Oyqe_AkhwMFgTQt0kdzs3H2EirouqDSUhEWMl-WiUtCRBdEBiVuFtZQS609T6Am19P058eq2TajYLFgT9Xe2O3hoiM4ImyeWf4-NjAc6oi4wuvUOksDRt8YamnyiqBcg=s1024-rj";
  const starFieldImage = "https://static.vecteezy.com/system/resources/thumbnails/000/556/930/small/RR-v-jan-2019-135.jpg";

  const getUsersRegistry = (): RegisteredUser[] => {
    const registry = localStorage.getItem('cosmic_users_registry');
    return registry ? JSON.parse(registry) : [];
  };

  const saveToRegistry = (user: RegisteredUser) => {
    const registry = getUsersRegistry();
    registry.push(user);
    localStorage.setItem('cosmic_users_registry', JSON.stringify(registry));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    setTimeout(() => {
      const registry = getUsersRegistry();

      if (isSignup) {
        const existingUser = registry.find(u => u.email === email);
        if (existingUser) {
          setError("CREDENTIAL CONFLICT: Email already registered.");
          setIsLoading(false);
          return;
        }

        const newUser: RegisteredUser = {
          id: Math.random().toString(36).substr(2, 9),
          username: email.split('@')[0],
          email: email,
          password: password,
          role: role
        };

        saveToRegistry(newUser);
        
        const profile: UserProfile = {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          watchlist: []
        };
        
        localStorage.setItem('cosmic_user', JSON.stringify(profile));
        onLogin(profile);
      } else {
        const userMatch = registry.find(u => u.email === email && u.password === password);
        
        if (!userMatch) {
          setError("ACCESS DENIED: Invalid credentials.");
          setIsLoading(false);
          return;
        }

        const profile: UserProfile = {
          id: userMatch.id,
          username: userMatch.username,
          email: userMatch.email,
          role: userMatch.role,
          watchlist: []
        };

        localStorage.setItem('cosmic_user', JSON.stringify(profile));
        onLogin(profile);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-6 relative overflow-y-auto custom-scrollbar">
      
      {/* CINEMATIC BACKGROUND SYSTEM */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {/* Deep Background: Subtle Stars */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{ 
            backgroundImage: `url(${starFieldImage})`,
            backgroundSize: '1000px',
            backgroundRepeat: 'repeat',
          }}
        />

        {/* Hero Background Layer: Large Rotating Tech Image */}
        <div className="absolute inset-0 w-full h-full flex items-center justify-center animate-in fade-in duration-[2500ms] zoom-in-110 ease-out">
          <img 
            src={orbitalTechImage} 
            alt="Technical Dashboard Visualization" 
            className="w-[115vmax] h-[115vmax] max-w-none object-cover opacity-90 mix-blend-screen animate-[spin_300s_linear_infinite]"
          />
          {/* Subtle Atmosphere Shading */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-500/10 via-transparent to-slate-950/80" />
          <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px]" />
        </div>
        
        {/* Dynamic Energy Pulsing */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[180px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[180px] animate-pulse delay-1000" />
      </div>

      {/* COMPACT LOGIN MODULE */}
      <div className="w-full max-w-sm z-10 flex flex-col items-center py-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
        
        {/* Header Branding */}
        <div className="mb-6 flex flex-col items-center animate-in fade-in slide-in-from-top duration-700">
           <div className="flex items-center gap-3 mb-2">
             <div className="w-9 h-9 bg-sky-600/20 rounded-xl flex items-center justify-center border border-sky-500/30 shadow-[0_0_20px_rgba(14,165,233,0.3)]">
               <Orbit className="text-sky-400 w-5 h-5 animate-spin-slow" />
             </div>
             <h1 className="text-xl font-space font-black tracking-[0.2em] text-white">COSMIC WATCH</h1>
           </div>
           <div className="flex items-center gap-2 text-[7px] font-bold text-slate-500 uppercase tracking-[0.5em] animate-pulse">
             <Database size={8} /> UPLINK SECURE // ALPHA-9
           </div>
        </div>

        {/* COMPACT FORM CARD */}
        <div className="glowing-border-container w-full shadow-[0_0_60px_rgba(14,165,233,0.3)]">
          <div className="glowing-border-content p-6 lg:p-8 border border-white/5 bg-slate-950/90 backdrop-blur-3xl rounded-[2.5rem]">
            
            {/* Header / Nav */}
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={onBack}
                className="flex items-center gap-1.5 text-slate-500 hover:text-sky-400 transition-all text-[8px] font-black uppercase tracking-widest group"
              >
                <ChevronLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
                Return
              </button>
              
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[7px] font-bold text-slate-500 uppercase tracking-widest">
                <span className="w-1 h-1 bg-amber-500 rounded-full animate-ping" />
                Auth: Required
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-lg font-space font-bold text-white tracking-tighter uppercase mb-1">
                {isSignup ? "Recruitment" : "Signal Link"}
              </h2>
              <p className="text-slate-500 text-[10px] font-medium tracking-wide">
                {isSignup ? "Initialize surveillance ID." : "Enter passkeys to bridge uplink."}
              </p>
            </div>

            {/* Role Selection Slider */}
            <div className="relative flex bg-slate-900/50 p-1 rounded-lg border border-white/5 mb-6 overflow-hidden">
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md transition-all duration-500 ease-out ${role === 'observer' ? 'left-1 bg-sky-600/80 shadow-[0_0_15px_rgba(14,165,233,0.3)]' : 'left-[calc(50%+1px)] bg-indigo-600/80 shadow-[0_0_15px_rgba(99,102,241,0.3)]'}`} 
              />
              <button 
                type="button"
                onClick={() => setRole('observer')}
                className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2.5 transition-colors font-black text-[8px] uppercase tracking-widest ${role === 'observer' ? 'text-white' : 'text-slate-600 hover:text-slate-400'}`}
              >
                <Globe size={10} /> Observer
              </button>
              <button 
                type="button"
                onClick={() => setRole('researcher')}
                className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2.5 transition-colors font-black text-[8px] uppercase tracking-widest ${role === 'researcher' ? 'text-white' : 'text-slate-600 hover:text-slate-400'}`}
              >
                <Microscope size={10} /> Researcher
              </button>
            </div>

            {error && (
              <div className="mb-4 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2.5 animate-in slide-in-from-top-2">
                <AlertCircle className="text-red-500 shrink-0" size={14} />
                <span className="text-[8px] font-black text-red-200 uppercase tracking-widest leading-tight">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Terminal ID (Email)</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-sky-400 transition-colors" size={16} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="agent@cosmic.watch"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3.5 pl-11 pr-4 text-xs focus:border-sky-500/50 outline-none transition-all placeholder:text-slate-800 text-white"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Neural Key</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={16} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3.5 pl-11 pr-4 text-xs focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-800 text-white"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className={`relative w-full py-4 rounded-lg font-black text-[9px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 group overflow-hidden ${
                    role === 'observer' ? 'bg-sky-600 hover:bg-sky-500 shadow-sky-500/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
                  } text-white disabled:opacity-50 active:scale-[0.98] shadow-lg border border-white/10`}
                >
                  <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[45deg] group-hover:left-[150%] transition-all duration-1000" />
                  
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Linking...</span>
                    </div>
                  ) : (
                    <>
                      {isSignup ? "Initialize Access" : "Establish Uplink"}
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center pt-4 border-t border-white/5 flex flex-col items-center gap-3">
              <button 
                type="button"
                onClick={() => { setIsSignup(!isSignup); setError(null); }}
                className="text-[8px] font-black text-slate-600 hover:text-sky-400 transition-all uppercase tracking-[0.1em]"
              >
                {isSignup ? "Return to Main Login" : "Initialize New Observation Channel"}
              </button>
              
              <div className="flex items-center gap-4 opacity-30">
                <div className="flex items-center gap-1 text-[7px] font-bold text-slate-500 uppercase tracking-widest">
                  <Shield size={10} /> Secure
                </div>
                <div className="flex items-center gap-1 text-[7px] font-bold text-slate-500 uppercase tracking-widest">
                  <Cpu size={10} /> AES-256
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Technical Signature */}
        <div className="mt-6 flex items-center gap-3 animate-in fade-in delay-1000">
           <span className="text-[6px] font-black text-slate-700 uppercase tracking-[0.4em]">STABLE_GRID_V4.2</span>
           <div className="w-0.5 h-0.5 bg-slate-800 rounded-full" />
           <span className="text-[6px] font-black text-slate-700 uppercase tracking-[0.4em]">LATENCY_26MS</span>
        </div>
      </div>

      <style>{`
        .animate-spin-slow {
          animation: spin 15s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;