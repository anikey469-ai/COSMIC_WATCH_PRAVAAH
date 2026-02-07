import React from 'react';
import { X, ShieldCheck, Info, Lock } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md glass p-8 rounded-3xl border border-slate-700 shadow-2xl animate-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-200">
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-sky-500/20 text-sky-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-sky-500/20">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-space font-bold">System Configuration</h2>
          <p className="text-sm text-slate-500 mt-1">Telemetry connection parameters</p>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="text-emerald-500" size={18} />
              <h4 className="font-bold text-emerald-400 text-sm">Authorized Uplink Active</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The NASA NeoWs connection is currently managed via the **Global Command Uplink**. Manual key rotation is disabled for your clearance level.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-slate-800 rounded-xl bg-slate-900/50">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Uplink Status</span>
              <span className="text-xs text-emerald-400 font-mono">SECURE / ACTIVE</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-slate-800 rounded-xl bg-slate-900/50">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Data Provider</span>
              <span className="text-xs text-sky-400 font-mono">NASA NeoWs API</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
            <Info className="text-sky-500 shrink-0 mt-0.5" size={16} />
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Real-time monitoring is optimized for high-frequency tracking. If you experience signal drops, please contact the network administrator.
            </p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 mt-8 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all border border-slate-700"
        >
          Return to Terminal
        </button>

        <p className="mt-6 text-[10px] text-slate-600 text-center uppercase tracking-widest leading-relaxed">
          Uplink ID: CW-ALPHA-992-SECURE
        </p>
      </div>
    </div>
  );
};

export default SettingsModal;