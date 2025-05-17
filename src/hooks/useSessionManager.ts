
import { useState, useEffect } from "react";
import { FocusSession, SessionType } from "@/contexts/FocusContext";

interface UseSessionManagerOptions {
  userId: string | undefined;
}

export function useSessionManager({ userId }: UseSessionManagerOptions) {
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [sessionCount, setSessionCount] = useState<number>(0);

  // Load session data from localStorage
  useEffect(() => {
    if (userId) {
      try {
        const savedSessions = localStorage.getItem(`focusflow_sessions_${userId}`);
        if (savedSessions) {
          const parsed = JSON.parse(savedSessions);
          // Convert string dates to Date objects
          const fixedSessions = parsed.map((s: any) => ({
            ...s,
            startTime: new Date(s.startTime),
            endTime: s.endTime ? new Date(s.endTime) : undefined
          }));
          setSessions(fixedSessions);
        }
      } catch (error) {
        console.error("Failed to load sessions", error);
      }
    } else {
      setSessions([]);
    }
  }, [userId]);

  // Save session data to localStorage when it changes
  useEffect(() => {
    if (userId && sessions.length > 0) {
      localStorage.setItem(`focusflow_sessions_${userId}`, JSON.stringify(sessions));
    }
  }, [sessions, userId]);

  // Create a new session
  const createSession = (type: SessionType, duration: number): FocusSession | null => {
    if (!userId) return null;
    
    const newSession: FocusSession = {
      id: crypto.randomUUID(),
      userId: userId,
      startTime: new Date(),
      duration: duration,
      type: type,
      completed: false,
      aborted: false,
      pauseDuration: 0
    };
    
    setCurrentSession(newSession);
    
    if (type === 'work') {
      setSessionCount(prev => prev + 1);
    }
    
    return newSession;
  };

  // Complete the current session
  const completeSession = (pauseDuration: number) => {
    if (!currentSession) return;
    
    const updatedSession: FocusSession = {
      ...currentSession,
      endTime: new Date(),
      completed: true,
      aborted: false,
      pauseDuration
    };
    
    setSessions(prev => [...prev, updatedSession]);
    return updatedSession;
  };

  // Abort the current session
  const abortSession = (pauseDuration: number, reason?: string) => {
    if (!currentSession) return;
    
    const updatedSession: FocusSession = {
      ...currentSession,
      endTime: new Date(),
      completed: false,
      aborted: true,
      abortReason: reason || 'Manually stopped',
      pauseDuration
    };
    
    setSessions(prev => [...prev, updatedSession]);
    return updatedSession;
  };

  // Reset the current session
  const resetCurrentSession = () => {
    setCurrentSession(null);
  };

  return {
    currentSession,
    sessions,
    sessionCount,
    createSession,
    completeSession,
    abortSession,
    resetCurrentSession
  };
}
