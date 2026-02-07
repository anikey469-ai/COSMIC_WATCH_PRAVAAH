import React, { useState, useEffect, useRef } from 'react';
import { Send, X, User, Zap, Globe, Loader2 } from 'lucide-react';
import { UserProfile, ChatMessage } from '../types';
// Import GoogleGenAI according to guidelines
import { GoogleGenAI } from "@google/genai";

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ isOpen, onClose, user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', userId: 'system', username: 'DeepSpace_Net', text: 'Connection established. Welcome to the Global Monitoring Network.', timestamp: Date.now() - 100000 },
    { id: '2', userId: 'ai', username: 'CosmoAI', text: 'I am analyzing recent detections. Risk assessments are pending further telemetry.', timestamp: Date.now() - 50000 },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Use Gemini API to generate responses
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!user) {
      alert("Please sign in to participate in the chat.");
      return;
    }

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      // Initialize Gemini Client
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Fix: Upgraded to 'gemini-3-pro-preview' as it is recommended for STEM-related complex reasoning tasks.
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: currentInput,
        config: {
          systemInstruction: "You are CosmoAI, a high-level expert system for Near-Earth Object tracking and orbital analysis. Provide scientific, technical, and reassuring responses about asteroid threats and space exploration. Keep answers concise and informative.",
        }
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        userId: 'ai',
        username: 'CosmoAI',
        text: response.text || "Communication link failure. Unable to process telemetry.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Gemini Error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        userId: 'system',
        username: 'CommError',
        text: "Signal interference detected. AI offline.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`fixed right-0 top-0 h-full w-80 glass border-l border-slate-800 z-[60] flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center gap-2">
          <Globe className="text-sky-500" size={18} />
          <h3 className="font-space font-bold">Cosmic Comm</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.userId === user?.id ? 'items-end' : 'items-start'}`}>
            <div className="flex items-center gap-2 mb-1">
              {msg.userId === 'ai' && <Zap size={12} className="text-amber-500" />}
              <span className={`text-[10px] font-bold uppercase tracking-widest ${msg.userId === 'ai' ? 'text-amber-500' : msg.userId === 'system' ? 'text-slate-500' : 'text-sky-400'}`}>
                {msg.username}
              </span>
              <span className="text-[10px] text-slate-600">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.userId === user?.id ? 'bg-sky-500/20 text-sky-100 rounded-tr-none border border-sky-500/20' : msg.userId === 'ai' ? 'bg-amber-500/10 text-amber-100 rounded-tl-none border border-amber-500/20' : 'bg-slate-800/50 text-slate-300 rounded-tl-none border border-slate-700/50'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-slate-500 text-xs animate-pulse p-2">
            <Loader2 className="animate-spin" size={12} />
            <span>CosmoAI is processing...</span>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <form onSubmit={sendMessage} className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={user ? "Signal status..." : "Sign in to chat"}
            disabled={!user || isTyping}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-4 pr-12 text-sm focus:border-sky-500/50 outline-none transition-all disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={!user || !input.trim() || isTyping}
            className="absolute right-2 top-2 p-1.5 bg-sky-500 text-white rounded-lg hover:bg-sky-400 transition-colors disabled:bg-slate-800 flex items-center justify-center"
          >
            {isTyping ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          </button>
        </form>
        {!user && <p className="text-[10px] text-slate-500 mt-2 text-center uppercase tracking-widest">Auth Required</p>}
      </div>
    </div>
  );
};

export default ChatSidebar;