
import { useState, useEffect } from "react";
import { AlertCircle, Pause, Play, SkipForward, AlertOctagon, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/layout/Layout";
import { useFocus, SessionType } from "@/contexts/FocusContext";
import { useSettings } from "@/contexts/SettingsContext";
import { formatTime } from "@/lib/time-utils";
import { cn } from "@/lib/utils";

const Timer = () => {
  const { 
    timerState, 
    timeRemaining, 
    totalTime,
    currentSession,
    blockedWebsitesActive,
    startTimer, 
    pauseTimer, 
    resumeTimer, 
    skipTimer, 
    stopTimer 
  } = useFocus();
  
  const { settings } = useSettings();
  
  const [progress, setProgress] = useState(100);
  const [showAbortDialog, setShowAbortDialog] = useState(false);
  const [abortReason, setAbortReason] = useState("");
  
  // Calculate progress percentage
  useEffect(() => {
    if (totalTime > 0) {
      setProgress((timeRemaining / totalTime) * 100);
    } else {
      setProgress(100);
    }
  }, [timeRemaining, totalTime]);
  
  // Set timer title with emoji based on current state
  let timerTitle = "Start Focus Timer";
  let timerEmoji = "🔍";
  
  if (timerState === 'working') {
    timerTitle = "Focus Time";
    timerEmoji = "🧠";
  } else if (timerState === 'break') {
    timerTitle = "Short Break";
    timerEmoji = "☕";
  } else if (timerState === 'longBreak') {
    timerTitle = "Long Break";
    timerEmoji = "🌴";
  } else if (timerState === 'paused') {
    timerTitle = "Timer Paused";
    timerEmoji = "⏸️";
  }
  
  // Handle abort session
  const handleAbort = () => {
    stopTimer(abortReason);
    setShowAbortDialog(false);
    setAbortReason("");
  };

  const sessionTypeLabels: Record<SessionType, string> = {
    'work': 'Work',
    'break': 'Break',
    'longBreak': 'Long Break'
  };

  return (
    <Layout title="Focus Timer" fullWidth>
      <div className="flex flex-col items-center justify-center max-w-2xl mx-auto py-6">
        {/* Timer Display */}
        <div className="w-full text-center mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-focus-primary">
            {timerEmoji} {timerTitle}
          </h2>
          
          <div 
            className="timer-container w-64 h-64 mx-auto mb-6"
            style={{ 
              '--progress': `${progress}%`,
              '--progress-color': timerState === 'working' 
                ? 'var(--focus-primary, #2A6B84)' 
                : 'var(--focus-secondary, #3C8DAD)'
            } as React.CSSProperties}
          >
            <div className="absolute inset-3 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl font-bold text-focus-primary">
                  {formatTime(timeRemaining)}
                </div>
                {currentSession && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {sessionTypeLabels[currentSession.type]} Session
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Timer controls */}
          <div className="flex items-center justify-center gap-4">
            {timerState === 'idle' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                <Button
                  size="lg"
                  className="bg-focus-primary hover:bg-focus-secondary text-white focus-button"
                  onClick={() => startTimer('work')}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Work ({settings.pomodoro.workDuration}m)
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  className="border-focus-secondary text-focus-secondary hover:bg-focus-light/20 focus-button"
                  onClick={() => startTimer('break')}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Break ({settings.pomodoro.breakDuration}m)
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  className="border-focus-accent text-focus-accent hover:bg-focus-light/20 focus-button"
                  onClick={() => startTimer('longBreak')}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Long Break ({settings.pomodoro.longBreakDuration}m)
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                {timerState === 'paused' ? (
                  <Button 
                    size="lg"
                    className="bg-focus-primary hover:bg-focus-secondary text-white col-span-2 md:col-span-1 focus-button"
                    onClick={resumeTimer}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Resume
                  </Button>
                ) : (
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-focus-primary text-focus-primary hover:bg-focus-light/20 col-span-2 md:col-span-1 focus-button"
                    onClick={pauseTimer}
                  >
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </Button>
                )}
                
                <Button
                  size="lg"
                  variant="outline"
                  className="border-focus-accent text-focus-accent hover:bg-focus-light/20 col-span-1 focus-button"
                  onClick={skipTimer}
                >
                  <SkipForward className="mr-2 h-4 w-4" />
                  Skip
                </Button>
                
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-red-400 text-red-500 hover:bg-red-50 col-span-1 focus-button"
                  onClick={() => setShowAbortDialog(true)}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Abort
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Blocked websites section */}
        <Card className="w-full mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertOctagon className="h-5 w-5 text-focus-primary" />
              Distraction Blocking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-0.5">
                <Label className="text-base">Block Distracting Websites</Label>
                <div className="text-sm text-muted-foreground">
                  {settings.blocklist.enabled 
                    ? "Blocking is enabled during work sessions"
                    : "Website blocking is currently disabled"
                  }
                </div>
              </div>
              <Switch
                checked={settings.blocklist.enabled}
                disabled={timerState === 'working'}
                className={cn(
                  timerState === 'working' && "opacity-50 cursor-not-allowed"
                )}
              />
            </div>
            
            <div className="p-4 bg-focus-light/30 dark:bg-focus-primary/10 rounded-lg">
              <div className="flex items-center mb-3">
                <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                <span className="text-sm font-medium">
                  {blockedWebsitesActive 
                    ? "Blocked websites (active now):"
                    : "Websites that will be blocked during work sessions:"
                  }
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {settings.blocklist.websites.length > 0 ? (
                  settings.blocklist.websites.map((site) => (
                    <div 
                      key={site}
                      className={cn(
                        "text-xs px-2 py-1 rounded-md",
                        blockedWebsitesActive
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      )}
                    >
                      {site}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No websites in blocklist. Add some in Settings.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Abort Dialog */}
        <Dialog open={showAbortDialog} onOpenChange={setShowAbortDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Abort Session</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Why are you ending this focus session early?
              </p>
              <Textarea
                placeholder="What distracted you? (optional)"
                value={abortReason}
                onChange={(e) => setAbortReason(e.target.value)}
                className="min-h-24"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAbortDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleAbort}>
                End Session
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Timer;
