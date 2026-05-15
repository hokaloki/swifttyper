import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Finger, FINGER_COLORS } from '../lib/typingUtils';

interface FingerGuideProps {
  activeFinger?: Finger;
}

const FINGER_LABELS: Record<Finger, string> = {
  lp: 'Left Pinky',
  lr: 'Left Ring',
  lm: 'Left Middle',
  li: 'Left Index',
  lt: 'Left Thumb',
  rp: 'Right Pinky',
  rr: 'Right Ring',
  rm: 'Right Middle',
  ri: 'Right Index',
  rt: 'Right Thumb',
};

const FINGER_POSITIONS: Record<Finger, { cx: number; cy: number }> = {
  lp: { cx: 16, cy: 45 },
  lr: { cx: 31, cy: 35 },
  lm: { cx: 46, cy: 30 },
  li: { cx: 61, cy: 37 },
  lt: { cx: 76, cy: 60 },
  rt: { cx: 116, cy: 60 },
  ri: { cx: 131, cy: 37 },
  rm: { cx: 146, cy: 30 },
  rr: { cx: 161, cy: 35 },
  rp: { cx: 176, cy: 45 },
};

const LEFT_FINGERS: Finger[] = ['lp', 'lr', 'lm', 'li', 'lt'];
const RIGHT_FINGERS: Finger[] = ['rt', 'ri', 'rm', 'rr', 'rp'];

const FINGER_RECTS: { finger: Finger; x: number; y: number; h: number }[] = [
  { finger: 'lp', x: 10, y: 40, h: 30 },
  { finger: 'lr', x: 25, y: 30, h: 40 },
  { finger: 'lm', x: 40, y: 25, h: 45 },
  { finger: 'li', x: 55, y: 32, h: 38 },
  { finger: 'lt', x: 70, y: 55, h: 25 },
  { finger: 'rt', x: 110, y: 55, h: 25 },
  { finger: 'ri', x: 125, y: 32, h: 38 },
  { finger: 'rm', x: 140, y: 25, h: 45 },
  { finger: 'rr', x: 155, y: 30, h: 40 },
  { finger: 'rp', x: 170, y: 40, h: 30 },
];

export const FingerGuide: React.FC<FingerGuideProps> = ({ activeFinger }) => {
  const activeColor = activeFinger ? FINGER_COLORS[activeFinger] : undefined;
  const activePos = activeFinger ? FINGER_POSITIONS[activeFinger] : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col items-center gap-4 shrink-0"
    >
      <motion.div
        animate={{ borderColor: activeColor ? `${activeColor}44` : 'rgba(63,63,70,0.6)' }}
        className="relative p-5 rounded-2xl border bg-zinc-900/40 backdrop-blur-sm"
      >
        <div className="text-[9px] text-zinc-500 uppercase tracking-[0.3em] font-black text-center mb-3">
          Finger Map
        </motion.div>
        <svg width="200" height="100" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[200px]">
          {FINGER_RECTS.map(({ finger, x, y, h }) => {
            const isActive = finger === activeFinger;
            const color = FINGER_COLORS[finger];
            return (
              <rect
                key={finger}
                x={x}
                y={y}
                width={12}
                height={h}
                rx={6}
                fill={isActive ? color : '#27272a'}
                stroke={isActive ? color : '#3f3f46'}
                strokeWidth={isActive ? 2 : 1}
                opacity={isActive ? 1 : activeFinger ? 0.35 : 0.6}
                style={isActive ? { filter: `drop-shadow(0 0 8px ${color}88)` } : undefined}
              />
            );
          })}

          {activePos && activeColor && (
            <motion.circle
              key={activeFinger}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              cx={activePos.cx}
              cy={activePos.cy}
              r={8}
              fill={activeColor}
              fillOpacity={0.35}
              stroke={activeColor}
              strokeWidth={2}
            />
          )}
        </svg>

        <AnimatePresence mode="wait">
          {activeFinger && (
            <motion.div
              key={activeFinger}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-3 text-center"
            >
              <span
                className="text-[10px] font-black uppercase tracking-widest"
                style={{ color: activeColor }}
              >
                {FINGER_LABELS[activeFinger]}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="flex gap-1">
        {[...LEFT_FINGERS, ...RIGHT_FINGERS].map((finger) => (
          <motion.div
            key={finger}
            animate={{
              scale: finger === activeFinger ? 1.3 : 1,
              backgroundColor: finger === activeFinger ? FINGER_COLORS[finger] : '#27272a',
            }}
            className="w-2 h-2 rounded-full"
            title={FINGER_LABELS[finger]}
          />
        ))}
      </div>
    </motion.div>
  );
};
