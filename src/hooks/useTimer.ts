import { useState, useRef, useEffect } from "react";
import { SessionType } from "@/contexts/FocusContext";

type TimerState = 'idle' | 'working' | 'break' | 'longBreak' | 'paused';

interface UseTimerOptions {
  onComplete: () => void;
}

export function useTimer({ onComplete }: UseTimerOptions) {
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  
  const timerRef = useRef<number | null>(null);
  const pauseStartTimeRef = useRef<Date | null>(null);
  const pauseAccumulated = useRef<number>(0);
  const isCompleting = useRef<boolean>(false);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  // Run the timer countdown
  const runTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }

    timerRef.current = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1 && !isCompleting.current) {
          isCompleting.current = true;
          
          // Clear the interval immediately
          if (timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
          
          // Set state to idle
          setTimerState('idle');
          setTimeRemaining(0);
          
          // Call onComplete in the next tick
          Promise.resolve().then(() => {
            onComplete();
            isCompleting.current = false;
          });
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start a new timer
  const startTimer = (duration: number, type: SessionType) => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    isCompleting.current = false;
    
    // Update state
    setTimerState(type === 'work' ? 'working' : type === 'break' ? 'break' : 'longBreak');
    setTimeRemaining(duration);
    setTotalTime(duration);
    pauseAccumulated.current = 0;
    
    // Start the countdown
    runTimer();
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
  const resumeTimer = (type: SessionType) => {
    if (pauseStartTimeRef.current) {
      const pauseDuration = Math.floor((new Date().getTime() - pauseStartTimeRef.current.getTime()) / 1000);
      pauseAccumulated.current += pauseDuration;
    }
    
    pauseStartTimeRef.current = null;
    
    setTimerState(
      type === 'work' ? 'working' : 
      type === 'break' ? 'break' : 'longBreak'
    );
    runTimer();
  };

  // Reset the timer
  const resetTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    isCompleting.current = false;
    setTimerState('idle');
    setTimeRemaining(0);
    setTotalTime(0);
    pauseStartTimeRef.current = null;
  };

  // Get accumulated pause time
  const getPauseDuration = () => {
    const currentPause = pauseStartTimeRef.current ? 
      Math.floor((new Date().getTime() - pauseStartTimeRef.current.getTime()) / 1000) : 0;
    
    return pauseAccumulated.current + currentPause;
  };

  return {
    timerState,
    timeRemaining,
    totalTime,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    getPauseDuration,
  };
}
