import React from 'react';
import { useFirebase } from '../lib/FirebaseProvider';
import { motion } from 'motion/react';
import { Keyboard, Zap, Trophy, History, Play, Users, Globe, Smartphone, ShieldCheck, Target, Activity, Cpu, Database, ChevronRight, LineChart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const { user, signIn } = useFirebase();

  return (
    <div className="min-h-screen terminal-bg flex flex-col pt-32 pb-20">
      <div className="scanline" />
      
      {/* Hero Section */}
      <section className="relative px-8 mb-20 overflow-visible">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
          <div className="flex-1 space-y-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em]"
            >
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              Velocity Engine v4.2 Online
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-7xl lg:text-[11rem] font-black uppercase italic tracking-tighter leading-[0.8] text-white"
            >
              Swift<br />
              <span className="text-primary drop-shadow-[0_0_30px_rgba(234,179,8,0.4)]">Typer</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-xl text-zinc-500 text-lg font-black uppercase tracking-tight leading-relaxed opacity-60"
            >
              The ultimate high-velocity training environment. 
              Refine your mechanical throughput to absolute perfection.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-8 pt-6"
            >
              <Link 
                to="/learn"
                className="bg-primary text-black px-14 py-6 rounded-2xl font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(234,179,8,0.3)] flex items-center gap-4 group"
              >
                Start Training
                <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Link>
              {!user && (
                <button 
                  onClick={signIn}
                  className="bg-white/5 border border-white/10 text-white px-10 py-6 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center gap-4 group"
                >
                  <Activity className="w-5 h-5 text-primary group-hover:animate-pulse" />
                  Sync Identity
                </button>
              )}
            </motion.div>
          </div>
          
          <div className="flex-1 relative hidden lg:block overflow-visible">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center opacity-10">
              <div className="w-[600px] h-[600px] border-[20px] border-primary rounded-full animate-[spin_60s_linear_infinite] border-dotted" />
            </div>
            <div className="relative z-10 grid grid-cols-2 gap-8">
              <StatCard icon={<Activity className="text-primary" />} label="Peak Velocity" value="168" unit="WPM" />
              <StatCard icon={<ShieldCheck className="text-emerald-500" />} label="Auth Status" value="ENCRYPTED" />
              <StatCard icon={<LineChart className="text-blue-500" />} label="Avg Precision" value="99.2" unit="%" />
              <StatCard icon={<Cpu className="text-purple-500" />} label="Core Latency" value="1.2" unit="MS" />
            </div>
          </div>
        </div>
      </section>

      {/* Industrial Features Grid */}
      <section className="px-8 py-40 border-t border-zinc-800/50 bg-black/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-10 rounded-3xl bg-zinc-900/40 border border-zinc-800/60 hover:border-primary/50 transition-all">
              <div className="w-14 h-14 bg-zinc-800/50 rounded-2xl flex items-center justify-center mb-8 border border-zinc-700/50 group-hover:bg-primary group-hover:text-black transition-all">
                <Keyboard className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-tighter mb-4 text-white">Adaptive Learning</h3>
              <p className="text-zinc-500 font-medium leading-relaxed">System-generated modules that focus on your mechanical weak points, automatically adjusting for real-time performance.</p>
            </div>
            
            <div className="group p-10 rounded-3xl bg-zinc-900/40 border border-zinc-800/60 hover:border-emerald-500/50 transition-all">
              <div className="w-14 h-14 bg-zinc-800/50 rounded-2xl flex items-center justify-center mb-8 border border-zinc-700/50 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-tighter mb-4 text-white">Combat Simulation</h3>
              <p className="text-zinc-500 font-medium leading-relaxed">High-intensity typing game mode designed to test your accuracy under pressure in an arcade-style environment.</p>
            </div>
            
            <div className="group p-10 rounded-3xl bg-zinc-900/40 border border-zinc-800/60 hover:border-blue-500/50 transition-all">
              <div className="w-14 h-14 bg-zinc-800/50 rounded-2xl flex items-center justify-center mb-8 border border-zinc-700/50 group-hover:bg-blue-500 group-hover:text-black transition-all">
                <LineChart className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-tighter mb-4 text-white">Deep Analytics</h3>
              <p className="text-zinc-500 font-medium leading-relaxed">Comprehensive visual tracking of your progression, identifying patterns across every session in the cloud.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer System Status */}
      <footer className="mt-auto px-8 py-10 border-t border-zinc-900 bg-[#070708]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Mainframe Link</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Type-Sensing Loop</span>
            </div>
          </div>
          
          <div className="text-[10px] font-mono text-zinc-700 flex gap-10">
            <span>&copy;2026 STYPER SYSTEMS</span>
            <span className="hidden sm:inline">AUTH_ENCRYPTION: AES-256</span>
            <span className="hidden sm:inline">REGION: GLOBAL_NODE_01</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ icon, label, value, unit }: { icon: React.ReactNode, label: string, value: string, unit?: string }) {
  return (
    <div className="bg-zinc-900/80 backdrop-blur-3xl border border-zinc-800/80 p-8 rounded-[2.5rem] relative group hover:border-zinc-700/50 transition-all">
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
          {icon}
        </div>
        <div className="flex gap-1">
          <div className="w-1 h-3 bg-zinc-800 rounded-full" />
          <div className="w-1 h-5 bg-zinc-800 rounded-full" />
          <div className="w-1 h-2 bg-zinc-800 rounded-full" />
        </div>
      </div>
      <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-black font-mono text-white tracking-tighter">{value}</span>
        {unit && <span className="text-sm font-bold text-zinc-600 uppercase italic">{unit}</span>}
      </div>
    </div>
  );
}
