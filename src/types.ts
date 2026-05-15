export interface TypingStats {
  wpm: number;
  accuracy: number;
  errorCount: number;
  duration: number;
}

export interface UserSession {
  id: string;
  userId: string;
  mode: 'learning' | 'game';
  wpm: number;
  accuracy: number;
  errorCount: number;
  duration: number;
  timestamp: any; // Firestore Timestamp
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  createdAt: any;
  settings: {
    theme: 'light' | 'dark';
    focusMode: boolean;
  };
}

export interface GlobalUserStats {
  userId: string;
  topWpm: number;
  avgWpm: number;
  avgAccuracy: number;
  totalSessions: number;
  totalPracticeTime: number;
  lastActive: any;
}
