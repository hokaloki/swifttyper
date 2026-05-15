import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Keyboard } from '../components/Keyboard';
import { useTypingTest } from '../hooks/useTypingTest';
import { charsMatch } from '../lib/typingUtils';
import { cn } from '../lib/utils';
import { RotateCcw, ChevronRight, Award, Zap, Target, Activity, Cpu } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const DEFAULT_SENTENCE = "The quick brown fox jumps over the lazy dog";

export default function LearningMode() {
  const [repetitions, setRepetitions] = useState(1);
  const [fullText, setFullText] = useState(() => Array(1).fill(DEFAULT_SENTENCE).join(" "));

  useEffect(() => {
    setFullText(Array(repetitions).fill(DEFAULT_SENTENCE).join(" "));
  }, [repetitions]);

  const onSessionComplete = useCallback(async (stats: any) => {
    if (auth.currentUser) {
      try {
        await addDoc(collection(db, "sessions"), {
          userId: auth.currentUser.uid,
          mode: "learning",
          ...stats,
          timestamp: serverTimestamp()
        });
      } catch (e) {
        console.error("Failed to save session", e);
      }
    }
  }, []);

  const {
    userInput,
    currentChar,
    activeFinger,
    isFinished,
    isWaiting,
    isError,
    errors,
    handleKey,
    reset,
    wpm,
    accuracy
  } = useTypingTest(fullText, onSessionComplete);

  const handleKeyRef = useRef(handleKey);
  const resetRef = useRef(reset);
  const isWaitingRef = useRef(isWaiting);
  handleKeyRef.current = handleKey;
  resetRef.current = reset;
  isWaitingRef.current = isWaiting;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (e.key === " " && isWaitingRef.current) {
        e.preventDefault();
      }

      if (e.key === "Backspace") return;
      if (e.key === "Tab") {
        e.preventDefault();
        resetRef.current();
        return;
      }

      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        resetRef.current();
        return;
      }

      if (e.key.length === 1 || e.key === "Enter") {
        handleKeyRef.current(e.key);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-h-screen terminal-bg p-8 pt-32 flex flex-col items-center">
      <div className="scanline" />
      
      <header className="w-full max-w-5xl flex justify-between items-center mb-12 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.3)]">
            <Activity className="text-black w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic">Practice.Protocol</h1>
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.4em] font-bold">Mechanical Conditioning Active</p>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800">
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Iter</span>
            <select 
              value={repetitions} 
              onChange={(e) => {
                setRepetitions(Number(e.target.value));
                reset();
              }}
              className="bg-transparent text-zinc-100 outline-none cursor-pointer text-xs font-black uppercase tracking-tighter"
            >
              {[1, 3, 5, 10].map(n => <option key={n} value={n} className="bg-zinc-900">{n}x Cycle</option>)}
            </select>
          </div>
          <button 
            onClick={reset}
            className="p-3 hover:bg-zinc-800 rounded-xl border border-zinc-800 transition-all text-zinc-500 hover:text-primary"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="w-full max-w-5xl grid grid-cols-3 gap-10 mb-16 relative z-10 px-10">
        <div className="text-center group">
          <div className="text-[10px] text-zinc-600 uppercase tracking-[0.4em] mb-4 font-black group-hover:text-primary transition-colors">Velocity</div>
          <div className="text-7xl font-mono font-black text-primary tabular-nums tracking-tighter drop-shadow-[0_0_10px_rgba(234,179,8,0.2)]">{Math.round(wpm)}</div>
        </div>
        <div className="text-center group border-x border-zinc-800/50">
          <div className="text-[10px] text-zinc-600 uppercase tracking-[0.4em] mb-4 font-black group-hover:text-white transition-colors">Precision</div>
          <div className="text-7xl font-mono font-black text-zinc-100 tabular-nums tracking-tighter">
            {Math.round(accuracy)}<span className="text-3xl text-zinc-700 ml-1">%</span>
          </div>
        </div>
        <div className="text-center group">
          <div className="text-[10px] text-zinc-600 uppercase tracking-[0.4em] mb-4 font-black group-hover:text-red-500 transition-colors">Errors</div>
          <div className="text-7xl font-mono font-black text-red-500/80 tabular-nums tracking-tighter">{errors}</div>
        </div>
      </div>

      {/* Typing Area */}
      <section 
        className={cn(
          "w-full max-w-5xl relative mb-20 group z-10 px-10 py-16 bg-zinc-900/10 rounded-[3rem] border transition-all duration-300 backdrop-blur-3xl shadow-inner",
          isError ? "border-red-500/50 bg-red-500/5" : "border-zinc-800/40 hover:border-zinc-700/60"
        )}
      >
        <div className="relative font-mono text-4xl leading-[1.6] tracking-wide text-zinc-700 min-h-[160px] select-none text-center">
          <div className="max-w-4xl mx-auto">
            {fullText.split('').map((char, index) => {
            let status: 'pending' | 'correct' | 'incorrect' | 'current' = 'pending';
            if (index < userInput.length) {
              status = charsMatch(userInput[index], char) ? 'correct' : 'incorrect';
            } else if (index === userInput.length) {
              status = 'current';
            }

            return (
              <span 
                key={index} 
                className={cn(
                  "relative transition-all duration-75 inline-block",
                  status === 'correct' && "text-zinc-200 drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]",
                  status === 'incorrect' && "text-red-400/80 line-through decoration-red-500/50",
                  status === 'current' && !isError && "text-primary bg-primary/10 underline decoration-primary decoration-4 underline-offset-8",
                  status === 'current' && isError && "text-red-500 bg-red-500/10 underline decoration-red-500 decoration-4 underline-offset-8 animate-shake",
                  status === 'pending' && "text-zinc-800"
                )}
              >
                {status === 'current' && (
                  <motion.span 
                    layoutId="cursor"
                    className={cn(
                      "absolute -left-[1px] top-0 bottom-0 w-[4px] rounded-full shadow-[0_0_15px_currentColor]",
                      isError ? "bg-red-500" : "bg-primary"
                    )}
                    animate={{ 
                      opacity: [1, 0.5, 1],
                      height: ["100%", "90%", "100%"]
                    }}
                    transition={{ 
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
                {char === ' ' ? '\u00A0' : char}
                {status === 'correct' && index === userInput.length - 1 && (
                  <motion.div
                    initial={{ scale: 1.5, opacity: 1 }}
                    animate={{ scale: 1, opacity: 0 }}
                    className="absolute inset-0 bg-primary/30 rounded blur-sm pointer-events-none"
                  />
                )}
              </span>
            );
          })}
          </div>
        </div>
        
        <AnimatePresence>
          {isWaiting && !isFinished && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-6 right-10 flex items-center gap-3"
            >
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
              <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em]">Awaiting Input_</p>
            </motion.div>
          )}

          {isFinished && (
            <motion.div 
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
              className="absolute inset-0 bg-bg-dark/80 flex flex-col items-center justify-center z-40 rounded-[3rem] border border-primary/20 shadow-[0_0_100px_rgba(234,179,8,0.05)]"
            >
              <Award className="w-20 h-20 text-primary mb-6 drop-shadow-[0_0_20px_rgba(234,179,8,0.4)]" />
              <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-10 text-white">Simulation Wrap</h2>
              
              <div className="grid grid-cols-2 gap-20 mb-16">
                <ResultCard label="Final Velocity" value={Math.round(wpm)} unit="WPM" color="primary" />
                <ResultCard label="Mechanical Precision" value={Math.round(accuracy)} unit="%" color="white" />
              </div>
              
              <button 
                onClick={reset}
                className="bg-primary hover:bg-primary/90 text-black font-black px-16 py-5 rounded-2xl transition-all flex items-center gap-4 shadow-[0_0_40px_rgba(234,179,8,0.2)] hover:scale-105 active:scale-95"
              >
                <RotateCcw className="w-5 h-5" />
                NEW CYCLE
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Visual Guides */}
      <div className="w-full max-w-5xl relative z-10">
        <Keyboard activeKey={currentChar} activeFinger={activeFinger} />
      </div>
      
      <footer className="mt-auto py-12 text-zinc-700 text-[9px] uppercase font-mono tracking-[0.5em] opacity-40 hover:opacity-100 transition-opacity cursor-default">
        Velocity.OS // Kernel 4.2.0-STABLE // Link Verified
      </footer>
    </div>
  );
}

function KeyCap({ label }: { label: string }) {
  return (
    <div className="bg-zinc-900 border-2 border-zinc-800 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-zinc-100 shadow-[0_8px_0_rgb(24,24,27)] transform active:translate-y-1 active:shadow-[0_4px_0_rgb(24,24,27)] transition-all">
      {label}
    </div>
  );
}

function ResultCard({ label, value, unit, color }: { label: string, value: number, unit: string, color: string }) {
  return (
    <div className="text-center group">
      <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] mb-3 group-hover:text-zinc-400 transition-colors">{label}</p>
      <p className={cn(
        "text-7xl font-black font-mono tracking-tighter drop-shadow-2xl",
        color === 'primary' ? 'text-primary' : 'text-white'
      )}>
        {value} <span className="text-2xl font-black italic opacity-40">{unit}</span>
      </p>
    </div>
  );
}
