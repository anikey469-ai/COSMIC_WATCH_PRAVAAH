
import React, { useState } from 'react';
import { X, Mail, Lock, User, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    // Fix: Added missing 'role' property to comply with UserProfile interface.
    const mockUser: UserProfile = {
      id: Math.random().toString(36).substr(2, 9),
      username: username || email.split('@')[0],
      email: email,
      role: 'observer',
      watchlist: []
    };
    localStorage.setItem('cosmic_user', JSON.stringify(mockUser));
    onSuccess(mockUser);
  };

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
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-space font-bold">{isLogin ? 'Access Command Center' : 'Recruit New Observer'}</h2>
          <p className="text-sm text-slate-500 mt-1">Join the global Near-Earth surveillance network</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Callsign / Username"
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-sky-500 outline-none transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="email" 
              placeholder="Observer Email"
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-sky-500 outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="password" 
              placeholder="Neural Passkey"
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-sky-500 outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-sky-500/20"
          >
            {isLogin ? 'Establish Link' : 'Initialize Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-slate-400 hover:text-sky-400 transition-colors uppercase tracking-widest font-bold"
          >
            {isLogin ? 'No Credentials? Register' : 'Existing Observer? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
