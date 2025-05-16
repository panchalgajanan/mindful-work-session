import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { useSettings } from "./SettingsContext";
import { ensureValidDate } from "@/lib/time-utils";

// Timer states
type TimerState = 'idle' | 'working' | 'break' | 'longBreak' | 'paused';

// Session data
export type SessionType = 'work' | 'break' | 'longBreak';

export type FocusSession = {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  type: SessionType;
  completed: boolean;
  aborted: boolean;
  abortReason?: string;
  pauseDuration: number; // in seconds
};

type FocusContextType = {
  timerState: TimerState;
  timeRemaining: number; // in seconds
  totalTime: number; // in seconds
  currentSession: FocusSession | null;
  sessionCount: number;
  blockedWebsitesActive: boolean;
  startTimer: (type?: SessionType) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  skipTimer: () => void;
  stopTimer: (reason?: string) => void;
  sessions: FocusSession[];
};

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export const useFocus = () => {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error("useFocus must be used within a FocusProvider");
  }
  return context;
};

export const FocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [blockedWebsitesActive, setBlockedWebsitesActive] = useState<boolean>(false);
  
  const timerRef = useRef<number | null>(null);
  const pauseStartTimeRef = useRef<Date | null>(null);
  const pauseAccumulated = useRef<number>(0);
  const notificationPermissionChecked = useRef<boolean>(false);

  // Request notification permission on first load
  useEffect(() => {
    if (!notificationPermissionChecked.current && typeof Notification !== 'undefined') {
      notificationPermissionChecked.current = true;
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }, []);

  // Load session data from localStorage with date handling
  useEffect(() => {
    if (user) {
      try {
        const savedSessions = localStorage.getItem(`focusflow_sessions_${user.id}`);
        if (savedSessions) {
          const parsed = JSON.parse(savedSessions);
          // Convert string dates to Date objects with validation
          const fixedSessions = parsed.map((s: any) => ({
            ...s,
            startTime: ensureValidDate(s.startTime),
            endTime: s.endTime ? ensureValidDate(s.endTime) : undefined
          }));
          setSessions(fixedSessions);
        }
      } catch (error) {
        console.error("Failed to load sessions", error);
      }
    } else {
      setSessions([]);
    }
  }, [user]);

  // Save session data to localStorage when it changes
  useEffect(() => {
    if (user && sessions.length > 0) {
      localStorage.setItem(`focusflow_sessions_${user.id}`, JSON.stringify(sessions));
    }
  }, [sessions, user]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  // Handle blocked websites
  useEffect(() => {
    setBlockedWebsitesActive(
      timerState === 'working' && settings.blocklist.enabled
    );
  }, [timerState, settings.blocklist.enabled]);

  // Timer countdown function
  const runTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }

    timerRef.current = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          if (timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
          
          // Timer completed
          if (timerState === 'working') {
            completeSession();
            
            const { autoStartBreaks, sessionsUntilLongBreak } = settings.pomodoro;
            if (autoStartBreaks) {
              const nextSessionType: SessionType = 
                (sessionCount + 1) % sessionsUntilLongBreak === 0 ? 'longBreak' : 'break';
              startTimer(nextSessionType);
            } else {
              showNotification('Work session completed! Time for a break.');
            }
          } else if (timerState === 'break' || timerState === 'longBreak') {
            completeSession();
            
            if (settings.pomodoro.autoStartWork) {
              startTimer('work');
            } else {
              showNotification('Break completed! Ready to get back to work?');
            }
          }
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const showNotification = (message: string) => {
    // Show in-app toast notification
    toast(message);
    
    // Play notification sound if enabled
    if (settings.notifications.soundEnabled) {
      const audio = new Audio('/notification.mp3');
      audio.volume = settings.notifications.volume / 100;
      audio.play().catch(err => console.error('Failed to play notification sound:', err));
    }
    
    // Show desktop notification if possible
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification("FocusFlow", {
          body: message,
          icon: "/favicon.ico"
        });
      } catch (error) {
        console.error("Failed to show desktop notification:", error);
      }
    }
  };

  // Calculate duration based on session type
  const getSessionDuration = (type: SessionType): number => {
    switch (type) {
      case 'work':
        return settings.pomodoro.workDuration * 60;
      case 'break':
        return settings.pomodoro.breakDuration * 60;
      case 'longBreak':
        return settings.pomodoro.longBreakDuration * 60;
      default:
        return settings.pomodoro.workDuration * 60;
    }
  };

  // Start a new timer session
  const startTimer = (type: SessionType = 'work') => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    
    const duration = getSessionDuration(type);
    
    // Update state
    setTimerState(type === 'work' ? 'working' : type === 'break' ? 'break' : 'longBreak');
    setTimeRemaining(duration);
    setTotalTime(duration);
    pauseAccumulated.current = 0;
    
    // Create a new session
    if (user) {
      const newSession: FocusSession = {
        id: crypto.randomUUID(),
        userId: user.id,
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
    }
    
    // Start the countdown
    runTimer();
    
    // Show notification
    if (type === 'work') {
      showNotification('Focus session started!');
    } else if (type === 'break') {
      showNotification('Break time started!');
    } else {
      showNotification('Long break started!');
    }
  };

  // Pause the timer
  const pauseTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setTimerState('paused');
    pauseStartTimeRef.current = new Date();
  };

  // Resume the timer
  const resumeTimer = () => {
    if (pauseStartTimeRef.current && currentSession) {
      const pauseDuration = Math.floor((new Date().getTime() - pauseStartTimeRef.current.getTime()) / 1000);
      pauseAccumulated.current += pauseDuration;
    }
    
    pauseStartTimeRef.current = null;
    
    if (currentSession) {
      setTimerState(
        currentSession.type === 'work' ? 'working' : 
        currentSession.type === 'break' ? 'break' : 'longBreak'
      );
      runTimer();
    }
  };

  // Skip the current timer
  const skipTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (currentSession) {
      // Mark current session as completed but not aborted
      const updatedSession: FocusSession = {
        ...currentSession,
        endTime: new Date(),
        completed: true,
        aborted: false,
        pauseDuration: pauseAccumulated.current + (pauseStartTimeRef.current ? 
          Math.floor((new Date().getTime() - pauseStartTimeRef.current.getTime()) / 1000) : 0)
      };
      
      setSessions(prev => [...prev, updatedSession]);
      
      // Determine the next session type
      if (currentSession.type === 'work') {
        const nextType: SessionType = 
          sessionCount % settings.pomodoro.sessionsUntilLongBreak === 0 ? 'longBreak' : 'break';
        startTimer(nextType);
      } else {
        startTimer('work');
      }
    } else {
      startTimer('work');
    }
  };

  // Complete the current session with auto-save
  const completeSession = () => {
    if (currentSession) {
      const updatedSession: FocusSession = {
        ...currentSession,
        endTime: new Date(),
        completed: true,
        aborted: false,
        pauseDuration: pauseAccumulated.current
      };
      
      // Auto-save session immediately
      const updatedSessions = [...sessions, updatedSession];
      setSessions(updatedSessions);
      
      // Save to localStorage immediately
      if (user) {
        localStorage.setItem(`focusflow_sessions_${user.id}`, JSON.stringify(updatedSessions));
      }
      
      setCurrentSession(null);
    }
  };

  // Stop the timer with auto-save
  const stopTimer = (reason?: string) => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (currentSession) {
      // Mark current session as aborted
      const updatedSession: FocusSession = {
        ...currentSession,
        endTime: new Date(),
        completed: false,
        aborted: true,
        abortReason: reason || 'Manually stopped',
        pauseDuration: pauseAccumulated.current + (pauseStartTimeRef.current ? 
          Math.floor((new Date().getTime() - pauseStartTimeRef.current.getTime()) / 1000) : 0)
      };
      
      // Auto-save immediately
      const updatedSessions = [...sessions, updatedSession];
      setSessions(updatedSessions);
      
      // Save to localStorage immediately
      if (user) {
        localStorage.setItem(`focusflow_sessions_${user.id}`, JSON.stringify(updatedSessions));
      }
    }
    
    setTimerState('idle');
    setTimeRemaining(0);
    setTotalTime(0);
    setCurrentSession(null);
    pauseStartTimeRef.current = null;
    pauseAccumulated.current = 0;
  };

  return (
    <FocusContext.Provider
      value={{
        timerState,
        timeRemaining,
        totalTime,
        currentSession,
        sessionCount,
        blockedWebsitesActive,
        startTimer,
        pauseTimer,
        resumeTimer,
        skipTimer,
        stopTimer,
        sessions
      }}
    >
      {children}
    </FocusContext.Provider>
  );
};
