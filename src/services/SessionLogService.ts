import { FocusSession, SessionType } from "@/contexts/FocusContext";

interface SessionStats {
  totalSessions: number;
  completedSessions: number;
  abortedSessions: number;
  totalFocusTime: number;
  averageSessionLength: number;
  completionRate: number;
}

interface DailyStats {
  date: string;
  sessions: number;
  focusTime: number;
  completedSessions: number;
}

class SessionLogService {
  private static instance: SessionLogService;
  private sessions: Map<string, FocusSession[]> = new Map(); // Map of userId to sessions
  private currentUserId: string | null = null;

  private constructor() {}

  static getInstance(): SessionLogService {
    if (!SessionLogService.instance) {
      SessionLogService.instance = new SessionLogService();
    }
    return SessionLogService.instance;
  }

  // Set the current user and load their sessions
  setCurrentUser(userId: string | null) {
    this.currentUserId = userId;
    if (userId) {
      this.loadUserSessions(userId);
    }
  }

  // Load sessions for a specific user
  private loadUserSessions(userId: string) {
    const savedSessions = localStorage.getItem(`focus_sessions_${userId}`);
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions).map((session: any) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined
      }));
      this.sessions.set(userId, parsedSessions);
    } else {
      this.sessions.set(userId, []);
    }
  }

  // Get current user's sessions
  private getCurrentUserSessions(): FocusSession[] {
    if (!this.currentUserId) return [];
    return this.sessions.get(this.currentUserId) || [];
  }

  // Log a new session
  logSession(session: FocusSession) {
    if (!this.currentUserId) return;

    const userSessions = this.sessions.get(this.currentUserId) || [];
    userSessions.push(session);
    this.sessions.set(this.currentUserId, userSessions);
    this.saveUserSessions(this.currentUserId);
  }

  // Get all sessions for current user
  getAllSessions(): FocusSession[] {
    return this.getCurrentUserSessions();
  }

  // Get sessions for a specific date range
  getSessionsInRange(startDate: Date, endDate: Date): FocusSession[] {
    return this.getCurrentUserSessions().filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= startDate && sessionDate <= endDate;
    });
  }

  // Get today's sessions
  getTodaySessions(): FocusSession[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return this.getSessionsInRange(today, tomorrow);
  }

  // Get this week's sessions
  getWeekSessions(): FocusSession[] {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    
    return this.getSessionsInRange(startOfWeek, endOfWeek);
  }

  // Calculate overall statistics
  getStats(): SessionStats {
    const workSessions = this.getCurrentUserSessions().filter(s => s.type === 'work');
    const completedSessions = workSessions.filter(s => s.completed);
    const abortedSessions = workSessions.filter(s => s.aborted);
    
    const totalFocusTime = workSessions.reduce((total, session) => {
      if (session.endTime) {
        const duration = Math.floor(
          (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000
        );
        return total + duration - (session.pauseDuration || 0);
      }
      return total;
    }, 0);

    return {
      totalSessions: workSessions.length,
      completedSessions: completedSessions.length,
      abortedSessions: abortedSessions.length,
      totalFocusTime,
      averageSessionLength: workSessions.length > 0 
        ? Math.round(totalFocusTime / workSessions.length / 60) 
        : 0,
      completionRate: workSessions.length > 0
        ? Math.round((completedSessions.length / workSessions.length) * 100)
        : 0
    };
  }

  // Get daily statistics for the last 7 days
  getDailyStats(): DailyStats[] {
    const stats: DailyStats[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      
      const daySessions = this.getSessionsInRange(date, nextDate);
      const workSessions = daySessions.filter(s => s.type === 'work');
      
      const focusTime = workSessions.reduce((total, session) => {
        if (session.endTime) {
          const duration = Math.floor(
            (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000
          );
          return total + duration - (session.pauseDuration || 0);
        }
        return total;
      }, 0);

      stats.push({
        date: date.toISOString().split('T')[0],
        sessions: workSessions.length,
        focusTime: Math.round(focusTime / 60), // Convert to minutes
        completedSessions: workSessions.filter(s => s.completed).length
      });
    }
    
    return stats;
  }

  // Save sessions for a specific user
  private saveUserSessions(userId: string) {
    const userSessions = this.sessions.get(userId) || [];
    localStorage.setItem(`focus_sessions_${userId}`, JSON.stringify(userSessions));
  }

  // Clear all sessions for current user
  clearSessions() {
    if (!this.currentUserId) return;
    this.sessions.set(this.currentUserId, []);
    localStorage.removeItem(`focus_sessions_${this.currentUserId}`);
  }
}

export default SessionLogService; 