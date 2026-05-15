import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFirebase } from '../lib/FirebaseProvider';
import { Zap, LayoutDashboard, Keyboard, Trophy, LineChart, LogOut, LogIn, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

export function Navbar() {
  const { user, signIn, logout } = useFirebase();
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'System', icon: <LayoutDashboard size={14} /> },
    { to: '/learn', label: 'Practice', icon: <Keyboard size={14} /> },
    { to: '/game', label: 'Combat', icon: <Trophy size={14} /> },
    { to: '/analytics', label: 'Stats', icon: <LineChart size={14} /> },
  ];

  return (
    <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-5xl px-4 pointer-events-none">
      <div className="bg-zinc-900/40 backdrop-blur-3xl border border-zinc-800/60 p-2 rounded-2xl flex items-center justify-between gap-8 pointer-events-auto shadow-2xl">
        <Link to="/" className="flex items-center gap-3 group px-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.3)]">
            <Zap size={16} className="text-black fill-current" />
          </div>
          <div className="hidden sm:block">
            <span className="font-black italic text-sm tracking-tighter uppercase text-white">Swift<span className="text-primary">Typer</span></span>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none">Kernel 4.2</span>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-1 flex-1 justify-center">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "px-6 py-2.5 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative group",
                location.pathname === item.to 
                  ? "text-primary bg-primary/5 border border-primary/10" 
                  : "text-zinc-500 hover:text-zinc-200"
              )}
            >
              <span className={cn(
                "transition-transform",
                location.pathname === item.to ? "scale-110" : "group-hover:scale-110"
              )}>
                {item.icon}
              </span>
              <span className="hidden md:inline-block">{item.label}</span>
              {location.pathname === item.to && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4 px-4">
          {user ? (
            <button 
              onClick={logout}
              className="group flex items-center gap-3 p-1.5 pr-4 rounded-xl bg-zinc-950/50 border border-zinc-800 transition-all hover:border-red-500/50"
            >
              <img src={user.photoURL || ''} alt="" className="w-7 h-7 rounded-lg border border-zinc-800" />
              <div className="text-right hidden sm:block">
                <div className="text-[8px] text-zinc-600 uppercase font-black leading-none mb-0.5 tracking-widest">Logout</div>
                <div className="text-[10px] font-black text-zinc-400 leading-none">{user.displayName?.split(' ')[0]}</div>
              </div>
            </button>
          ) : (
            <button 
              onClick={signIn}
              className="bg-primary hover:bg-white text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] flex items-center gap-2 group"
            >
              <LogIn size={14} className="group-hover:translate-x-1 transition-transform" />
              Initialize
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
