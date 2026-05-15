import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { FINGER_COLORS, getFingerForKey, Finger } from '../lib/typingUtils';
import { FingerGuide } from './FingerGuide';

interface KeyProps {
  label: string;
  active?: boolean;
  pressed?: boolean;
  finger?: Finger;
  activeFinger?: Finger;
  className?: string;
}

const Key: React.FC<KeyProps> = ({ label, active, pressed, finger, activeFinger, className }) => {
  const isFingerKey = finger !== undefined && finger === activeFinger;
  const fingerColor = finger ? FINGER_COLORS[finger] : undefined;

  return (
    <motion.div
      initial={false}
      animate={{
        backgroundColor: active
          ? '#EAB308'
          : pressed
            ? '#404040'
            : isFingerKey
              ? '#1a1a1a'
              : '#27272a',
        borderColor: active
          ? '#EAB308'
          : pressed
            ? '#525252'
            : isFingerKey && fingerColor
              ? fingerColor
              : fingerColor
                ? `${fingerColor}33`
                : '#3f3f46',
        color: active ? '#000' : pressed ? '#ffffff' : isFingerKey && fingerColor ? fingerColor : '#71717a',
        boxShadow: active
          ? '0 0 20px rgba(234,179,8,0.4)'
          : pressed
            ? 'inset 0 2px 4px rgba(0,0,0,0.5)'
            : isFingerKey && fingerColor
              ? `0 0 12px ${fingerColor}44`
              : '0 2px 0 rgba(0,0,0,0.1)',
        scale: pressed ? 0.93 : active ? 1.05 : 1,
        y: pressed ? 2 : 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 600,
        damping: 30,
        mass: 0.8,
      }}
      className={cn(
        'h-10 flex items-center justify-center rounded-lg text-[10px] font-black font-sans border transition-all relative overflow-hidden',
        className
      )}
    >
      {isFingerKey && fingerColor && (
        <div
          className="absolute bottom-0 left-1 right-1 h-1 rounded-full opacity-80"
          style={{ backgroundColor: fingerColor }}
        />
      )}
      <span className="relative z-10">{label.toUpperCase()}</span>
      {active && (
        <motion.div
          layoutId="active-glow"
          className="absolute inset-0 bg-primary opacity-10 blur-xl"
        />
      )}
    </motion.div>
  );
};

interface KeyboardProps {
  activeKey?: string;
  activeFinger?: Finger;
}

const KEYBOARD_ROWS = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
  ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
  ['Space'],
];

const KEY_WIDTHS: { [key: string]: string } = {
  Backspace: 'w-20',
  Tab: 'w-16',
  '\\': 'w-16',
  Caps: 'w-20',
  Enter: 'w-24',
  Shift: 'w-28',
  Space: 'w-64',
};

const PHYSICAL_KEY_MAP: { [label: string]: string } = {
  Caps: 'capslock',
  Space: ' ',
};

export const Keyboard: React.FC<KeyboardProps> = ({ activeKey, activeFinger }) => {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.add(e.key.toLowerCase());
        return next;
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.delete(e.key.toLowerCase());
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const normalize = (k: string) => k.toLowerCase();
  const currentKeyNormalized = activeKey ? normalize(activeKey) : null;

  return (
    <div className="p-6 bg-zinc-950/30 rounded-3xl border border-zinc-800/60 backdrop-blur-3xl shadow-inner group w-full">
      <motion.div
        animate={{
          borderColor: activeFinger ? `${FINGER_COLORS[activeFinger]}44` : 'rgba(63,63,70,0.4)',
        }}
        className="flex flex-col xl:flex-row gap-8 items-center justify-center"
      >
        <FingerGuide activeFinger={activeFinger} />

        <motion.div
          animate={{
            boxShadow: activeFinger
              ? `0 0 40px ${FINGER_COLORS[activeFinger]}15`
              : 'none',
          }}
          className="flex flex-col gap-2 flex-1 min-w-0"
        >
          {KEYBOARD_ROWS.map((row, i) => (
            <div
              key={i}
              className={cn(
                'flex gap-2',
                i === 0 ? 'justify-start' : i === 1 ? 'pl-2' : i === 2 ? 'pl-4' : i === 3 ? 'pl-6' : 'justify-center'
              )}
            >
              {row.map((key, j) => {
                const keyNorm = normalize(key);
                const physicalKey = PHYSICAL_KEY_MAP[key] || keyNorm;
                const lookupKey = key === 'Space' ? ' ' : keyNorm;

                const isActive =
                  (currentKeyNormalized === keyNorm) || (key === 'Space' && activeKey === ' ');

                const isPressed = pressedKeys.has(physicalKey);
                const finger = getFingerForKey(lookupKey);

                return (
                  <Key
                    key={`${i}-${j}`}
                    label={key === 'Space' ? '␣' : key}
                    active={isActive}
                    pressed={isPressed}
                    finger={finger}
                    activeFinger={activeFinger}
                    className={KEY_WIDTHS[key] || 'w-10'}
                  />
                );
              })}
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};
