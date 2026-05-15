export type Finger = 
  | 'lp' | 'lr' | 'lm' | 'li' | 'lt'
  | 'rp' | 'rr' | 'rm' | 'ri' | 'rt';

export const FINGER_COLORS: Record<Finger, string> = {
  lp: '#ef4444',
  lr: '#f97316',
  lm: '#eab308',
  li: '#84cc16',
  lt: '#22c55e',
  rt: '#14b8a6',
  ri: '#06b6d4',
  rm: '#3b82f6',
  rr: '#8b5cf6',
  rp: '#ec4899',
};

export function charsMatch(typed: string, expected: string): boolean {
  if (!typed || !expected) return false;
  return typed.toLowerCase() === expected.toLowerCase();
}

export function getFingerForKey(key: string): Finger | undefined {
  if (!key) return undefined;
  return KEY_TO_FINGER[key] ?? KEY_TO_FINGER[key.toLowerCase()];
}

export const KEY_TO_FINGER: { [key: string]: Finger } = {
  // Left Hand
  'q': 'lp', 'a': 'lp', 'z': 'lp', '`': 'lp', '1': 'lp',
  'w': 'lr', 's': 'lr', 'x': 'lr', '2': 'lr',
  'e': 'lm', 'd': 'lm', 'c': 'lm', '3': 'lm',
  'r': 'li', 'f': 'li', 'v': 'li', '4': 'li',
  't': 'li', 'g': 'li', 'b': 'li', '5': 'li',
  ' ': 'lt', // Left thumb for space by default in many schools, but we can allow both.
  
  // Right Hand
  'y': 'ri', 'h': 'ri', 'n': 'ri', '6': 'ri',
  'u': 'ri', 'j': 'ri', 'm': 'ri', '7': 'ri',
  'i': 'rm', 'k': 'rm', ',': 'rm', '8': 'rm',
  'o': 'rr', 'l': 'rr', '.': 'rr', '9': 'rr',
  'p': 'rp', ';': 'rp', '/': 'rp', '0': 'rp', '-': 'rp', '=': 'rp', '[': 'rp', ']': 'rp', "'": 'rp', '\\': 'rp',
};

// Map capitalized versions too
Object.keys(KEY_TO_FINGER).forEach(key => {
  if (key.length === 1) {
    KEY_TO_FINGER[key.toUpperCase()] = KEY_TO_FINGER[key];
  }
});

export function calculateWpm(chars: number, startTime: number, endTime: number): number {
  const minutes = (endTime - startTime) / 60000;
  if (minutes <= 0) return 0;
  return (chars / 5) / minutes;
}

export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 100;
  return (correct / total) * 100;
}
