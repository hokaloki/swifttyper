import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Zap, Target, Award, Play, RotateCcw, Home, Trophy, Activity, ShieldAlert, Cpu } from 'lucide-react';

interface Word {
  id: string;
  text: string;
  x: number;
  y: number;
  speed: number;
}

const COMMON_WORDS = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also"
];

export default function WordDropGame() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [words, setWords] = useState<Word[]>([]);
  const [userInput, setUserInput] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);

  const requestRef = useRef<number>(null);
  const spawnTimerRef = useRef<NodeJS.Timeout>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const spawnWord = useCallback(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.offsetWidth;
    const word = COMMON_WORDS[Math.floor(Math.random() * COMMON_WORDS.length)];
    const newWord: Word = {
      id: Math.random().toString(36).substr(2, 9),
      text: word,
      x: Math.random() * (width - 200) + 100,
      y: -50,
      speed: (1 + level * 0.25) * (Math.random() * 0.5 + 0.8)
    };
    setWords(prev => [...prev, newWord]);
  }, [level]);

  const updateWords = useCallback(() => {
    if (gameOver || !isPlaying) return;

    setWords(prev => {
      const next = prev.map(w => ({ ...w, y: w.y + w.speed }));
      const missed = next.some(w => w.y > 580);
      
      if (missed) {
        setGameOver(true);
        setIsPlaying(false);
        return next;
      }
      return next;
    });

    requestRef.current = requestAnimationFrame(updateWords);
  }, [gameOver, isPlaying]);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      requestRef.current = requestAnimationFrame(updateWords);
      spawnTimerRef.current = setInterval(spawnWord, Math.max(2000 - level * 150, 600));
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, [isPlaying, gameOver, level, spawnWord, updateWords]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().trim();
    setUserInput(val);

    const matchIndex = words.findIndex(w => w.text.toLowerCase() === val);
    if (matchIndex !== -1) {
      const match = words[matchIndex];
      setScore(prev => prev + match.text.length * (combo + 1) * level);
      setCombo(prev => prev + 1);
      setWords(prev => prev.filter((_, i) => i !== matchIndex));
      setUserInput("");
      
      if (score > 0 && score % 400 === 0) {
        setLevel(prev => prev + 1);
      }
    }
  };

  const startGame = () => {
    setScore(0);
    setWords([]);
    setUserInput("");
    setGameOver(false);
    setIsPlaying(true);
    setLevel(1);
    setCombo(0);
  };

  useEffect(() => {
    if (gameOver && auth.currentUser) {
      addDoc(collection(db, "sessions"), {
        userId: auth.currentUser.uid,
        mode: "game",
        score,
        level,
        timestamp: serverTimestamp()
      });
    }
  }, [gameOver, score, level]);

  return (
    <div className="min-h-screen terminal-bg flex flex-col items-center p-8 pt-40 overflow-hidden">
      <div className="scanline" />
      
      <header className="w-full max-w-5xl flex justify-between items-center mb-12 relative z-10">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-primary text-black rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.3)]">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter transition-all hover:text-primary cursor-default leading-none mb-1">Combat.Word</h1>
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.5em] font-black">Engagement Routine Active</p>
          </div>
        </div>

        <div className="flex items-center gap-12">
          <StatDisplay label="Intensity" value={`LV.${level}`} />
          <StatDisplay label="Performance" value={score.toLocaleString()} highlight />
          <StatDisplay label="Combo" value={`x${combo}`} />
        </div>
      </header>

      <div 
        ref={containerRef}
        className="w-full max-w-5xl h-[600px] bg-zinc-900/10 rounded-[3rem] border border-zinc-800/40 relative shadow-inner mb-12 backdrop-blur-3xl overflow-hidden z-10"
      >
        <AnimatePresence>
          {words.map(word => (
            <motion.div
              key={word.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, top: word.y, left: word.x }}
              exit={{ scale: 1.5, opacity: 0, filter: 'blur(10px)' }}
              transition={{ duration: 0.1, ease: "linear" }}
              className="absolute px-6 py-3 bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/30 rounded-2xl shadow-2xl flex items-center gap-3 group"
            >
              <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
              <span className="text-2xl font-mono font-black tracking-tighter text-white uppercase">{word.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-dark/40 backdrop-blur-2xl rounded-3xl z-30 border border-white/5">
            <button 
              onClick={startGame}
              className="group bg-primary hover:bg-white text-black font-black px-16 py-6 rounded-2xl transition-all flex items-center gap-5 transform hover:scale-105 shadow-[0_0_60px_rgba(234,179,8,0.2)]"
            >
              <Play className="fill-current w-7 h-7" />
              <span className="text-xl uppercase tracking-widest italic">Engage Simulation</span>
            </button>
          </div>
        )}

        {gameOver && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-bg-dark/80 backdrop-blur-3xl rounded-3xl z-40 p-20"
          >
            <ShieldAlert className="w-20 h-20 text-red-500 mb-6 drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]" />
            <h2 className="text-8xl font-black text-red-500/90 mb-4 italic uppercase tracking-tighter scale-x-110 drop-shadow-[0_0_30px_rgba(239,68,68,0.2)]">Terminated</h2>
            <p className="text-zinc-600 mb-16 font-mono uppercase text-[10px] tracking-[0.8em] font-black">Target escaped sim perimeter</p>
            
            <div className="grid grid-cols-2 gap-20 mb-16">
              <div className="text-center">
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Final Score</p>
                <p className="text-7xl font-black text-white font-mono tracking-tighter">{score.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Peak Intensity</p>
                <p className="text-7xl font-black text-white font-mono tracking-tighter">LV.{level}</p>
              </div>
            </div>
            
            <button 
              onClick={startGame}
              className="bg-primary text-black font-black px-16 py-5 rounded-2xl hover:bg-white transition-all flex items-center gap-4 shadow-[0_0_40px_rgba(234,179,8,0.2)] group"
            >
              <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              RE-INITIALIZE
            </button>
          </motion.div>
        )}
        
        {/* Perimeter Warning Line */}
        <div className="absolute bottom-4 left-0 right-0 h-px bg-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
      </div>

      <div className="w-full max-w-lg mb-12 relative z-10">
        <div className="relative group">
          <input
            type="text"
            value={userInput}
            onChange={handleInput}
            autoFocus
            disabled={!isPlaying || gameOver}
            placeholder={isPlaying ? "Awaiting command..." : "System Standby"}
            className="w-full bg-zinc-950/50 border border-zinc-800/60 rounded-[1.5rem] px-10 py-8 text-4xl font-mono text-center outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all shadow-2xl placeholder:text-zinc-800 placeholder:uppercase placeholder:text-[10px] placeholder:tracking-[1em]"
          />
          {isPlaying && (
            <div className="absolute top-1/2 -translate-y-1/2 right-10 flex items-center gap-4">
              <div className="w-2.5 h-2.5 bg-primary rounded-full animate-ping" />
              <div className="flex gap-1.5 h-8 items-center">
                {[...Array(5)].map((_, i) => (
                  <motion.div 
                    key={i}
                    animate={{ height: [6, 24, 6] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                    className="w-[3px] bg-primary/40 rounded-full"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <footer className="mt-auto py-12 text-zinc-700 text-[10px] uppercase font-mono tracking-[1em] text-center opacity-30 hover:opacity-100 transition-opacity flex items-center gap-8">
        <div className="flex items-center gap-2">
          <Cpu className="w-3 h-3" />
          M.I.P v4.2.0
        </div>
        <div className="w-1 h-1 bg-zinc-800 rounded-full" />
        <span>Sync Ready</span>
      </footer>
    </div>
  );
}

function StatDisplay({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className="text-center group cursor-default">
      <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2 group-hover:text-primary transition-colors">{label}</p>
      <p className={cn(
        "text-4xl font-black font-mono tracking-tighter",
        highlight ? "text-primary drop-shadow-[0_0_10px_rgba(234,179,8,0.2)]" : "text-zinc-200"
      )}>{value}</p>
    </div>
  );
}
