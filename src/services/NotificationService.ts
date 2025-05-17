
type NotificationOptions = {
  soundEnabled: boolean;
  volume: number;
};

class NotificationService {
  static showNotification(message: string, options: NotificationOptions = { soundEnabled: false, volume: 50 }) {
    // Show desktop notification if browser supports it and user gave permission
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('FocusFlow', {
          body: message,
          icon: '/favicon.ico'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('FocusFlow', {
              body: message,
              icon: '/favicon.ico'
            });
          }
        });
      }
    }
    
    if (options.soundEnabled) {
      // Play notification sound
      const audio = new Audio('/notification.mp3');
      audio.volume = options.volume / 100;
      audio.play().catch(err => console.error('Failed to play notification sound:', err));
    }
  }

  static requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
}

export default NotificationService;
