
import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";

// Define types for settings
type PomodoroSettings = {
  workDuration: number;  // in minutes
  breakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
};

type BlocklistSettings = {
  enabled: boolean;
  websites: string[];
  apps: string[];
};

type NotificationSettings = {
  soundEnabled: boolean;
  volume: number; // 0-100
  notifyBeforeEnd: boolean;
  notifyBeforeEndTime: number; // seconds before end
};

type AppSettings = {
  theme: 'light' | 'dark' | 'system';
  pomodoro: PomodoroSettings;
  blocklist: BlocklistSettings;
  notifications: NotificationSettings;
};

type SettingsContextType = {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updatePomodoroSettings: (newSettings: Partial<PomodoroSettings>) => void;
  updateBlocklistSettings: (newSettings: Partial<BlocklistSettings>) => void;
  updateNotificationSettings: (newSettings: Partial<NotificationSettings>) => void;
  addBlockedWebsite: (website: string) => void;
  removeBlockedWebsite: (website: string) => void;
};

// Default settings
const defaultSettings: AppSettings = {
  theme: 'system',
  pomodoro: {
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    autoStartBreaks: true,
    autoStartWork: true
  },
  blocklist: {
    enabled: true,
    websites: ['facebook.com', 'twitter.com', 'instagram.com', 'reddit.com'],
    apps: []
  },
  notifications: {
    soundEnabled: true,
    volume: 80,
    notifyBeforeEnd: true,
    notifyBeforeEndTime: 10
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  // Load settings from localStorage when user changes
  useEffect(() => {
    if (user) {
      const savedSettings = localStorage.getItem(`focusflow_settings_${user.id}`);
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
        } catch (error) {
          console.error("Failed to parse saved settings", error);
          setSettings(defaultSettings);
        }
      } else {
        // If no saved settings, use defaults
        setSettings(defaultSettings);
      }
    } else {
      // Reset to defaults when user logs out
      setSettings(defaultSettings);
    }
  }, [user]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`focusflow_settings_${user.id}`, JSON.stringify(settings));
    }
  }, [settings, user]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  const updatePomodoroSettings = (newPomodoroSettings: Partial<PomodoroSettings>) => {
    setSettings(prev => ({
      ...prev,
      pomodoro: {
        ...prev.pomodoro,
        ...newPomodoroSettings
      }
    }));
  };

  const updateBlocklistSettings = (newBlocklistSettings: Partial<BlocklistSettings>) => {
    setSettings(prev => ({
      ...prev,
      blocklist: {
        ...prev.blocklist,
        ...newBlocklistSettings
      }
    }));
  };

  const updateNotificationSettings = (newNotificationSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        ...newNotificationSettings
      }
    }));
  };

  const addBlockedWebsite = (website: string) => {
    if (!website.trim()) return;
    
    setSettings(prev => ({
      ...prev,
      blocklist: {
        ...prev.blocklist,
        websites: [...prev.blocklist.websites.filter(site => 
          site.toLowerCase() !== website.toLowerCase()
        ), website.trim()]
      }
    }));
  };

  const removeBlockedWebsite = (website: string) => {
    setSettings(prev => ({
      ...prev,
      blocklist: {
        ...prev.blocklist,
        websites: prev.blocklist.websites.filter(
          site => site.toLowerCase() !== website.toLowerCase()
        )
      }
    }));
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updatePomodoroSettings,
        updateBlocklistSettings,
        updateNotificationSettings,
        addBlockedWebsite,
        removeBlockedWebsite
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
