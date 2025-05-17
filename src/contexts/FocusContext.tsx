import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { useSettings } from "./SettingsContext";
import { useTimer } from "@/hooks/useTimer";
import { useSessionManager } from "@/hooks/useSessionManager";
import NotificationService from "@/services/NotificationService";

// Timer states
export type TimerState = 'idle' | 'working' | 'break' | 'longBreak' | 'paused';

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
  const [blockedWebsitesActive, setBlockedWebsitesActive] = useState<boolean>(false);
  
  // Initialize session manager
  const { 
    currentSession, 
    sessions, 
    sessionCount, 
    createSession, 
    completeSession, 
    abortSession,
    resetCurrentSession
  } = useSessionManager({ 
    userId: user?.id 
  });

  // Initialize timer with completion handler
  const { 
    timerState, 
    timeRemaining, 
    totalTime, 
    startTimer: startTimerInternal, 
    pauseTimer: pauseTimerInternal,
    resumeTimer: resumeTimerInternal,
    resetTimer,
    getPauseDuration
  } = useTimer({
    onComplete: completeCurrentSession
  });

  // Handle blocked websites
  useEffect(() => {
    setBlockedWebsitesActive(
      timerState === 'working' && settings.blocklist.enabled
    );
  }, [timerState, settings.blocklist.enabled]);

  // Helper function to complete the current session
  function completeCurrentSession() {
    if (currentSession) {
      const updatedSession = completeSession(getPauseDuration());
      
      // Show appropriate notification
      if (currentSession.type === 'work') {
        showNotification('Work session completed! Time for a break.');
        
        if (settings.pomodoro.autoStartBreaks) {
          const nextSessionType: SessionType = 
            (sessionCount + 1) % settings.pomodoro.sessionsUntilLongBreak === 0 ? 'longBreak' : 'break';
          
          // Reset current session and timer state
          resetCurrentSession();
          resetTimer();
          
          // Start next session after a short delay
          setTimeout(() => {
            startTimer(nextSessionType);
          }, 1000);
        } else {
          // Reset states
          resetTimer();
          resetCurrentSession();
        }
      } else if (currentSession.type === 'break' || currentSession.type === 'longBreak') {
        showNotification('Break completed! Ready to get back to work?');
        
        if (settings.pomodoro.autoStartWork) {
          // Reset current session and timer state
          resetCurrentSession();
          resetTimer();
          
          // Start next session after a short delay
          setTimeout(() => {
            startTimer('work');
          }, 1000);
        } else {
          // Reset states
          resetTimer();
          resetCurrentSession();
        }
      }
    }
  }

  // Show notification and toast
  const showNotification = (message: string) => {
    // Show toast notification
    toast(message);
    
    // Show desktop notification with sound if enabled
    NotificationService.showNotification(message, {
      soundEnabled: settings.notifications.soundEnabled,
      volume: settings.notifications.volume
    });
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
    const duration = getSessionDuration(type);
    
    // Create a new session
    createSession(type, duration);
    
    // Start the timer
    startTimerInternal(duration, type);
    
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
    pauseTimerInternal();
  };

  // Resume the timer
  const resumeTimer = () => {
    if (currentSession) {
      resumeTimerInternal(currentSession.type);
    }
  };

  // Skip the current timer
  const skipTimer = () => {
    if (currentSession) {
      // Mark current session as completed but not aborted
      completeSession(getPauseDuration());
      
      // Determine the next session type
      if (currentSession.type === 'work') {
        const nextType: SessionType = 
          sessionCount % settings.pomodoro.sessionsUntilLongBreak === 0 ? 'longBreak' : 'break';
        
        resetTimer();
        resetCurrentSession();
        startTimer(nextType);
      } else {
        resetTimer();
        resetCurrentSession();
        startTimer('work');
      }
    } else {
      startTimer('work');
    }
  };

  // Stop the timer completely
  const stopTimer = (reason?: string) => {
    if (currentSession) {
      // Mark current session as aborted
      abortSession(getPauseDuration(), reason);
    }
    
    resetTimer();
    resetCurrentSession();
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
