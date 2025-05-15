
import { useState } from "react";
import { Clock, AlertOctagon, Bell, Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/layout/Layout";
import { useSettings } from "@/contexts/SettingsContext";
import { toast } from "sonner";

const Settings = () => {
  const {
    settings,
    updatePomodoroSettings,
    updateBlocklistSettings,
    updateNotificationSettings,
    addBlockedWebsite,
    removeBlockedWebsite
  } = useSettings();

  const [newWebsite, setNewWebsite] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const handleAddWebsite = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic URL validation
    if (!newWebsite.trim()) {
      return;
    }
    
    // Strip http/https and www for consistency
    let formattedSite = newWebsite.trim()
      .replace(/^(https?:\/\/)?(www\.)?/, '')
      .split('/')[0]; // Take only the domain part
    
    addBlockedWebsite(formattedSite);
    setNewWebsite("");
    setHasChanges(true);
    toast.success(`Added ${formattedSite} to blocklist`);
  };

  const handleRemoveWebsite = (website: string) => {
    removeBlockedWebsite(website);
    setHasChanges(true);
    toast.info(`Removed ${website} from blocklist`);
  };

  return (
    <Layout title="Settings">
      <Tabs defaultValue="timer" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="timer" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Timer Settings</span>
          </TabsTrigger>
          <TabsTrigger value="blocklist" className="flex items-center gap-2">
            <AlertOctagon className="h-4 w-4" />
            <span>Blocklist</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="timer">
          <Card>
            <CardHeader>
              <CardTitle>Pomodoro Timer Settings</CardTitle>
              <CardDescription>
                Customize your work and break intervals to match your productivity style
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="workDuration">Work Session Duration (minutes)</Label>
                  <Input
                    id="workDuration"
                    type="number"
                    min="1"
                    max="120"
                    value={settings.pomodoro.workDuration}
                    onChange={(e) => {
                      updatePomodoroSettings({ workDuration: Number(e.target.value) });
                      setHasChanges(true);
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="breakDuration">Short Break Duration (minutes)</Label>
                  <Input
                    id="breakDuration"
                    type="number"
                    min="1"
                    max="60"
                    value={settings.pomodoro.breakDuration}
                    onChange={(e) => {
                      updatePomodoroSettings({ breakDuration: Number(e.target.value) });
                      setHasChanges(true);
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="longBreakDuration">Long Break Duration (minutes)</Label>
                  <Input
                    id="longBreakDuration"
                    type="number"
                    min="1"
                    max="120"
                    value={settings.pomodoro.longBreakDuration}
                    onChange={(e) => {
                      updatePomodoroSettings({ longBreakDuration: Number(e.target.value) });
                      setHasChanges(true);
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sessionsUntilLongBreak">Sessions until Long Break</Label>
                  <Input
                    id="sessionsUntilLongBreak"
                    type="number"
                    min="1"
                    max="10"
                    value={settings.pomodoro.sessionsUntilLongBreak}
                    onChange={(e) => {
                      updatePomodoroSettings({ sessionsUntilLongBreak: Number(e.target.value) });
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-start Breaks</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically start breaks after work sessions end
                    </p>
                  </div>
                  <Switch
                    checked={settings.pomodoro.autoStartBreaks}
                    onCheckedChange={(checked) => {
                      updatePomodoroSettings({ autoStartBreaks: checked });
                      setHasChanges(true);
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-start Work</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically start work sessions after breaks end
                    </p>
                  </div>
                  <Switch
                    checked={settings.pomodoro.autoStartWork}
                    onCheckedChange={(checked) => {
                      updatePomodoroSettings({ autoStartWork: checked });
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {hasChanges && (
                <div className="w-full flex justify-end">
                  <div className="text-sm text-green-600 dark:text-green-400 flex items-center">
                    <Check className="h-4 w-4 mr-1" />
                    Settings saved automatically
                  </div>
                </div>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="blocklist">
          <Card>
            <CardHeader>
              <CardTitle>Website Blocklist</CardTitle>
              <CardDescription>
                Manage websites that will be blocked during focus sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Website Blocking</Label>
                  <p className="text-sm text-muted-foreground">
                    Block distracting websites during work sessions
                  </p>
                </div>
                <Switch
                  checked={settings.blocklist.enabled}
                  onCheckedChange={(checked) => {
                    updateBlocklistSettings({ enabled: checked });
                    setHasChanges(true);
                    
                    if (checked) {
                      toast.info("Website blocking enabled");
                    } else {
                      toast.info("Website blocking disabled");
                    }
                  }}
                />
              </div>
              
              <Separator />
              
              <div>
                <form onSubmit={handleAddWebsite} className="flex items-center gap-2 mb-4">
                  <Input
                    placeholder="Add website (e.g. facebook.com)"
                    value={newWebsite}
                    onChange={(e) => setNewWebsite(e.target.value)}
                  />
                  <Button type="submit" size="sm" className="shrink-0">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </form>
                
                <div className="p-4 bg-focus-light/30 dark:bg-focus-primary/10 rounded-lg min-h-24">
                  <h3 className="font-medium mb-3">Blocked Websites:</h3>
                  
                  {settings.blocklist.websites.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {settings.blocklist.websites.map((site) => (
                        <div 
                          key={site}
                          className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full 
                                   flex items-center gap-2 text-sm border border-gray-200 dark:border-gray-700"
                        >
                          {site}
                          <button 
                            onClick={() => handleRemoveWebsite(site)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No websites in blocklist. Add some using the form above.
                    </p>
                  )}
                </div>
                
                <p className="mt-4 text-xs text-muted-foreground">
                  Note: In this demo version, website blocking is simulated and doesn't actually block websites.
                  In a production app, this would integrate with browser extensions or system APIs.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Customize alerts and sounds for your focus sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Sound Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sounds when sessions start and end
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.soundEnabled}
                  onCheckedChange={(checked) => {
                    updateNotificationSettings({ soundEnabled: checked });
                    setHasChanges(true);
                    
                    if (checked) {
                      toast.info("Sound notifications enabled");
                    } else {
                      toast.info("Sound notifications disabled");
                    }
                  }}
                />
              </div>
              
              {settings.notifications.soundEnabled && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Volume</Label>
                    <span className="text-sm">{settings.notifications.volume}%</span>
                  </div>
                  <Slider
                    value={[settings.notifications.volume]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(value) => {
                      updateNotificationSettings({ volume: value[0] });
                      setHasChanges(true);
                    }}
                  />
                </div>
              )}
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notify Before Session End</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified shortly before a session ends
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.notifyBeforeEnd}
                  onCheckedChange={(checked) => {
                    updateNotificationSettings({ notifyBeforeEnd: checked });
                    setHasChanges(true);
                  }}
                />
              </div>
              
              {settings.notifications.notifyBeforeEnd && (
                <div className="space-y-2">
                  <Label htmlFor="notifyBeforeEndTime">
                    Notification Time (seconds before end)
                  </Label>
                  <Input
                    id="notifyBeforeEndTime"
                    type="number"
                    min="5"
                    max="60"
                    value={settings.notifications.notifyBeforeEndTime}
                    onChange={(e) => {
                      updateNotificationSettings({
                        notifyBeforeEndTime: Number(e.target.value)
                      });
                      setHasChanges(true);
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Settings;
