
import { useState, useEffect } from "react";
import { AlertCircle, Pause, Play, SkipForward, AlertOctagon, AlertTriangle, Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
  
  const { settings, updateNotificationSettings } = useSettings();
  
  const [progress, setProgress] = useState(100);
  const [showAbortDialog, setShowAbortDialog] = useState(false);
  const [abortReason, setAbortReason] = useState("");
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);

  // Check notification permission on load
  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setNotificationPermission(Notification.permission);
    }
  }, []);
  
  // Request notification permission
  const requestNotificationPermission = () => {
    if (typeof Notification !== 'undefined') {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
      });
    }
  };

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
          <h2 className="text-3xl font-bold mb-4 text-focus-primary bg-gradient-to-r from-focus-primary to-focus-secondary bg-clip-text text-transparent">
            {timerEmoji} {timerTitle}
          </h2>
          
          <div className="relative w-64 h-64 mx-auto mb-8">
            {/* Progress ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle 
                className="text-gray-200 dark:text-gray-700" 
                strokeWidth="4"
                stroke="currentColor"
                fill="transparent"
                r="46" 
                cx="50" 
                cy="50" 
              />
              {/* Progress circle */}
              <circle 
                className={cn(
                  "transition-all duration-300 ease-in-out",
                  timerState === 'working' ? "text-focus-primary" : "text-focus-secondary"
                )}
                strokeWidth="6"
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="46" 
                cx="50" 
                cy="50" 
                strokeDasharray={`${2 * Math.PI * 46}px`}
                strokeDashoffset={`${((100 - progress) / 100) * 2 * Math.PI * 46}px`}
              />
            </svg>
            
            {/* Timer display */}
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-focus-primary to-focus-secondary bg-clip-text text-transparent">
                  {formatTime(timeRemaining)}
                </div>
                {currentSession && (
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-3 font-medium">
                    {sessionTypeLabels[currentSession.type]} Session
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Desktop notifications permission */}
          {timerState === 'idle' && notificationPermission !== 'granted' && (
            <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-focus-primary" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Enable desktop notifications for timer updates
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={requestNotificationPermission}
                className="border-focus-primary text-focus-primary hover:bg-focus-primary/10"
              >
                Enable
              </Button>
            </div>
          )}
          
          {/* Timer controls */}
          <div className="flex items-center justify-center gap-4">
            {timerState === 'idle' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                <Button
                  size="lg"
                  className="bg-focus-primary hover:bg-focus-secondary text-white focus-button shadow-lg transform transition-transform hover:scale-105"
                  onClick={() => startTimer('work')}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Work ({settings.pomodoro.workDuration}m)
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  className="border-focus-secondary text-focus-secondary hover:bg-focus-light/20 focus-button shadow-md transform transition-transform hover:scale-105"
                  onClick={() => startTimer('break')}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Break ({settings.pomodoro.breakDuration}m)
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  className="border-focus-accent text-focus-accent hover:bg-focus-light/20 focus-button shadow-md transform transition-transform hover:scale-105"
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
                    className="bg-focus-primary hover:bg-focus-secondary text-white col-span-2 md:col-span-1 focus-button shadow-lg transform transition-transform hover:scale-105"
                    onClick={resumeTimer}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Resume
                  </Button>
                ) : (
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-focus-primary text-focus-primary hover:bg-focus-light/20 col-span-2 md:col-span-1 focus-button shadow-md transform transition-transform hover:scale-105"
                    onClick={pauseTimer}
                  >
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </Button>
                )}
                
                <Button
                  size="lg"
                  variant="outline"
                  className="border-focus-accent text-focus-accent hover:bg-focus-light/20 col-span-1 focus-button shadow-md transform transition-transform hover:scale-105"
                  onClick={skipTimer}
                >
                  <SkipForward className="mr-2 h-4 w-4" />
                  Skip
                </Button>
                
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-red-400 text-red-500 hover:bg-red-50 col-span-1 focus-button shadow-md transform transition-transform hover:scale-105"
                  onClick={() => setShowAbortDialog(true)}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Abort
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Sound Toggle & Notification settings */}
        <Card className="w-full mb-6 border-blue-100 dark:border-blue-900 shadow-lg overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-focus-primary/20 to-focus-secondary/20">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-focus-primary" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2 mb-1">
                  {settings.notifications.soundEnabled ? (
                    <Bell className="h-4 w-4 text-focus-primary" />
                  ) : (
                    <BellOff className="h-4 w-4 text-gray-500" />
                  )}
                  <span>Timer Sound Notifications</span>
                </Label>
                <div className="text-sm text-muted-foreground">
                  {settings.notifications.soundEnabled 
                    ? "Sound notifications are enabled"
                    : "Sound notifications are disabled"
                  }
                </div>
              </div>
              <Switch
                checked={settings.notifications.soundEnabled}
                onCheckedChange={(checked) => 
                  updateNotificationSettings({ soundEnabled: checked })
                }
                className="data-[state=checked]:bg-focus-primary"
              />
            </div>

            {settings.notifications.soundEnabled && (
              <div className="pl-3 pb-2">
                <Label className="text-sm mb-2 block">Volume ({settings.notifications.volume}%)</Label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.notifications.volume}
                  onChange={(e) => updateNotificationSettings({ volume: Number(e.target.value) })}
                  className="w-full accent-focus-primary h-2 bg-blue-100 dark:bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Blocked websites section */}
        <Card className="w-full mb-6 border-blue-100 dark:border-blue-900 shadow-lg overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-focus-primary/20 to-focus-secondary/20">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertOctagon className="h-5 w-5 text-focus-primary" />
              Distraction Blocking
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
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
                  "data-[state=checked]:bg-focus-primary",
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
          <DialogContent className="border-red-200 dark:border-red-900/50">
            <DialogHeader>
              <DialogTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Abort Session
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Why are you ending this focus session early?
              </p>
              <Textarea
                placeholder="What distracted you? (optional)"
                value={abortReason}
                onChange={(e) => setAbortReason(e.target.value)}
                className="min-h-24 border-gray-300 dark:border-gray-700"
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
