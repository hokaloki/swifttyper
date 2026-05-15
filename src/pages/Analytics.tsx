import React, { useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { motion } from 'motion/react';
import { TrendingUp, Clock, Target, Zap, Activity, Calendar, History, Trophy, Database, Cpu } from 'lucide-react';
import { UserSession } from '../types';
import { cn } from '../lib/utils';

export default function Analytics() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      if (!auth.currentUser) return;
      
      const q = query(
        collection(db, "sessions"),
        where("userId", "==", auth.currentUser.uid),
        orderBy("timestamp", "asc"),
        limit(50)
      );
      
      try {
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserSession));
        setSessions(data);
      } catch (e) {
        console.error("Error fetching sessions", e);
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, []);

  const chartData = sessions.map(s => ({
    time: s.timestamp?.toDate().toLocaleDateString() || '',
    wpm: s.wpm,
    accuracy: s.accuracy,
    score: s.score || 0
  }));

  const avgWpm = sessions.length > 0 ? sessions.reduce((acc, s) => acc + (s.wpm || 0), 0) / sessions.length : 0;
  const avgAccuracy = sessions.length > 0 ? sessions.reduce((acc, s) => acc + (s.accuracy || 0), 0) / sessions.length : 0;
  const topWpm = sessions.length > 0 ? Math.max(...sessions.map(s => s.wpm || 0)) : 0;

  if (loading) return (
    <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center text-white p-8">
      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
      <p className="text-[10px] font-black uppercase tracking-[0.8em] animate-pulse">Syncing Protocols...</p>
    </div>
  );

  return (
    <div className="min-h-screen terminal-bg p-8 pt-40">
      <div className="scanline" />
      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                <Database className="text-black w-6 h-6" />
              </div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter transition-all hover:text-primary cursor-default">Diagnostic.Center</h1>
            </div>
            <p className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.5em]">Neuro-Mechanical Performance Logs</p>
          </div>
          
          <div className="flex gap-10">
             <QuickStat icon={<Cpu className="w-4 h-4" />} label="Cores" value="ACTV" />
             <QuickStat icon={<Activity className="w-4 h-4" />} label="Status" value="SYNCED" />
          </div>
        </header>

        {/* Analytic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <AnalyticCard 
            title="Avg Velocity" 
            value={Math.round(avgWpm)} 
            unit="WPM"
            sub="Mean operational output"
            icon={<Zap className="text-primary" />}
          />
          <AnalyticCard 
            title="Max Velocity" 
            value={Math.round(topWpm)} 
            unit="WPM"
            sub="Peak mechanical throughput"
            icon={<TrendingUp className="text-white" />}
          />
          <AnalyticCard 
            title="Precision" 
            value={Math.round(avgAccuracy)} 
            unit="%"
            sub="Target acquisition accuracy"
            icon={<Target className="text-zinc-400" />}
          />
          <AnalyticCard 
            title="Cycles" 
            value={sessions.length} 
            sub="Total conditioning sessions"
            icon={<History className="text-zinc-600" />}
          />
        </div>

        {/* Main Chart Section */}
        <div className="mb-16">
          <div className="bg-zinc-900/10 p-10 rounded-[2.5rem] border border-zinc-800/40 shadow-inner backdrop-blur-3xl">
            <div className="flex justify-between items-center mb-12">
              <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 flex items-center gap-4">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                Velocity Progression Curve
              </h3>
              <div className="flex gap-2">
                 <div className="w-8 h-1 bg-primary rounded-full" />
                 <div className="w-8 h-1 bg-zinc-800 rounded-full" />
              </div>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EAB308" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#EAB308" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#ffffff" vertical={false} opacity={0.03} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#475569', fontWeight: 900 }} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#475569', fontWeight: 900 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#070708', border: '1px solid #27272a', borderRadius: '16px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    itemStyle={{ color: '#EAB308' }}
                    cursor={{ stroke: '#EAB308', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="wpm" 
                    stroke="#EAB308" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorWpm)"
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Module Experience Log */}
        <div className="bg-zinc-900/10 rounded-[2.5rem] border border-zinc-800/40 shadow-2xl overflow-hidden backdrop-blur-3xl">
          <div className="p-10 border-b border-zinc-800/20 flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">Tactical Engagement Log_</h3>
            <span className="text-zinc-600 font-mono text-[9px] uppercase tracking-widest">{sessions.length} ENTRIES FOUND</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-black/40 text-zinc-600 font-black text-[10px] uppercase tracking-[0.4em]">
                <tr>
                  <th className="px-10 py-6">Timestamp</th>
                  <th className="px-10 py-6">Module</th>
                  <th className="px-10 py-6 text-center">Velocity</th>
                  <th className="px-10 py-6 text-center">Precision</th>
                  <th className="px-10 py-6 text-right">Integrity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/20">
                {sessions.slice().reverse().map((s) => (
                  <tr key={s.id} className="hover:bg-primary/[0.02] transition-colors group cursor-default">
                    <td className="px-10 py-6">
                      <div className="font-mono text-xs text-zinc-600 group-hover:text-zinc-300 transition-colors uppercase tracking-widest">
                        {s.timestamp?.toDate().toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className={cn(
                        "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm",
                        s.mode === 'game' 
                          ? "bg-white/5 text-white border-white/10" 
                          : "bg-primary/5 text-primary border-primary/10"
                      )}>
                        {s.mode}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className="text-xl font-black font-mono text-zinc-100 group-hover:text-primary transition-colors">{Math.round(s.wpm)}</span>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className="text-xl font-black font-mono text-zinc-100">{Math.round(s.accuracy)}<span className="text-xs text-zinc-600 ml-0.5">%</span></span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center justify-end gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400 transition-colors">
                          {s.accuracy > 95 ? "Optimal" : s.accuracy > 80 ? "Stable" : "Degraded"}
                        </span>
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          s.accuracy > 95 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : s.accuracy > 80 ? "bg-primary/40" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                        )} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <footer className="mt-20 py-12 text-center">
        <p className="text-zinc-800 text-[10px] font-mono uppercase tracking-[1em]">Operational Diagnostics v4.2.0-STABLE</p>
      </footer>
    </div>
  );
}

function AnalyticCard({ title, value, unit, sub, icon }: { title: string, value: string | number, unit?: string, sub: string, icon: React.ReactNode }) {
  return (
    <div className="bg-zinc-900/10 p-10 group transition-all hover:bg-zinc-900/20 rounded-[2.5rem] border border-zinc-800/40 backdrop-blur-3xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
        {icon}
      </div>
      <div className="flex justify-between items-start mb-10">
        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 group-hover:border-primary/50 transition-colors">
          {icon}
        </div>
      </div>
      <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4 group-hover:text-primary transition-colors">{title}</p>
      <div className="flex items-baseline gap-2 mb-2">
        <h3 className="text-5xl font-black text-zinc-100 tracking-tighter tabular-nums group-hover:scale-105 transition-transform">{value}</h3>
        {unit && <span className="text-xl font-black italic tracking-tighter text-zinc-700">{unit}</span>}
      </div>
      <p className="text-zinc-700 text-[9px] font-black uppercase tracking-widest leading-relaxed">{sub}</p>
    </div>
  );
}

function QuickStat({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-zinc-700">{icon}</div>
      <div>
        <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter leading-none">{value}</p>
      </div>
    </div>
  );
}
