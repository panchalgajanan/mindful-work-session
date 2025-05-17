interface NotificationOptions {
  soundEnabled: boolean;
  volume: number;
}

class NotificationService {
  private static instance: NotificationService;
  private audioContext: AudioContext | null = null;
  private notificationSound: AudioBuffer | null = null;

  private constructor() {
    // Initialize audio context
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.audioContext = new AudioContext();
      this.loadNotificationSound();
    }
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Show a notification with optional sound
  async showNotification(message: string, options: NotificationOptions) {
    // Show browser notification if permission is granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Focus Flow', {
        body: message,
        icon: '/favicon.ico'
      });
    }

    // Play sound if enabled
    if (options.soundEnabled && this.audioContext && this.notificationSound) {
      await this.playSound(options.volume);
    }
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Load notification sound
  private async loadNotificationSound() {
    if (!this.audioContext) return;

    try {
      const response = await fetch('/notification-sound.mp3');
      const arrayBuffer = await response.arrayBuffer();
      this.notificationSound = await this.audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.error('Error loading notification sound:', error);
    }
  }

  // Play notification sound
  private async playSound(volume: number) {
    if (!this.audioContext || !this.notificationSound) return;

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = this.notificationSound;
      gainNode.gain.value = volume / 100; // Convert volume (0-100) to gain (0-1)
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start(0);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }
}

export default NotificationService;
