/**
 * Wirdak - Islamic Dhikr Habit Tracking App
 * notifications.js - User-controlled notification scheduling
 */

class NotificationManager {
  constructor(storageManager) {
    this.storageManager = storageManager;
    this.notificationPermission = 'default';
    this.scheduledNotifications = {};
  }

  /**
   * Initialize the notification system
   */
  async initialize() {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }
    
    // Get current permission status
    this.notificationPermission = Notification.permission;
    
    // Get user preferences
    const preferences = await this.storageManager.getPreferences();
    
    // If notifications are enabled in preferences, request permission if needed
    if (preferences.notificationsEnabled && this.notificationPermission === 'default') {
      await this.requestPermission();
    }
    
    // Schedule notifications based on user preferences
    if (preferences.notificationsEnabled && this.notificationPermission === 'granted') {
      this.scheduleAllNotifications();
    }
    
    return true;
  }
  
  /**
   * Request notification permission from user
   */
  async requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission;
      
      // Update user preferences based on permission result
      const preferences = await this.storageManager.getPreferences();
      preferences.notificationsEnabled = (permission === 'granted');
      await this.storageManager.savePreferences(preferences);
      
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }
  
  /**
   * Schedule all notifications based on user preferences
   */
  async scheduleAllNotifications() {
    // Clear any existing scheduled notifications
    this.clearAllScheduledNotifications();
    
    // Get user preferences
    const preferences = await this.storageManager.getPreferences();
    
    // If notifications are not enabled or permission not granted, exit
    if (!preferences.notificationsEnabled || this.notificationPermission !== 'granted') {
      return false;
    }
    
    // Schedule morning reminder
    if (preferences.morningReminderTime) {
      this.scheduleDailyNotification(
        'morning',
        preferences.morningReminderTime,
        preferences.language === 'ar' ? 'حان وقت أذكار الصباح' : 'Time for Morning Adhkar',
        preferences.language === 'ar' ? 'لا تنس قراءة أذكار الصباح للحصول على بركة يومك' : 'Don\'t forget to read your morning adhkar for a blessed day'
      );
    }
    
    // Schedule evening reminder
    if (preferences.eveningReminderTime) {
      this.scheduleDailyNotification(
        'evening',
        preferences.eveningReminderTime,
        preferences.language === 'ar' ? 'حان وقت أذكار المساء' : 'Time for Evening Adhkar',
        preferences.language === 'ar' ? 'لا تنس قراءة أذكار المساء قبل النوم' : 'Don\'t forget to read your evening adhkar before sleep'
      );
    }
    
    return true;
  }
  
  /**
   * Schedule a daily notification at a specific time
   */
  scheduleDailyNotification(id, timeString, title, body) {
    // Parse the time string (HH:MM)
    const [hours, minutes] = timeString.split(':').map(Number);
    
    // Calculate milliseconds until the notification time
    const now = new Date();
    const scheduledTime = new Date(now);
    scheduledTime.setHours(hours, minutes, 0, 0);
    
    // If the time has already passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    // Calculate delay in milliseconds
    const delay = scheduledTime.getTime() - now.getTime();
    
    // Schedule the notification
    const timerId = setTimeout(() => {
      this.showNotification(title, body);
      
      // Reschedule for the next day
      this.scheduleDailyNotification(id, timeString, title, body);
    }, delay);
    
    // Store the timer ID for later cancellation if needed
    this.scheduledNotifications[id] = timerId;
    
    console.log(`Scheduled ${id} notification for ${scheduledTime.toLocaleString()}`);
    return true;
  }
  
  /**
   * Show a notification to the user
   */
  showNotification(title, body) {
    if (this.notificationPermission !== 'granted') {
      console.log('Notification permission not granted');
      return false;
    }
    
    // Create and show the notification
    const notification = new Notification(title, {
      body: body,
      icon: '/assets/icons/icon-192x192.png',
      badge: '/assets/icons/badge-96x96.png',
      vibrate: [100, 50, 100],
      tag: 'wirdak-notification'
    });
    
    // Handle notification click
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    
    return true;
  }
  
  /**
   * Clear a specific scheduled notification
   */
  clearScheduledNotification(id) {
    if (this.scheduledNotifications[id]) {
      clearTimeout(this.scheduledNotifications[id]);
      delete this.scheduledNotifications[id];
      return true;
    }
    return false;
  }
  
  /**
   * Clear all scheduled notifications
   */
  clearAllScheduledNotifications() {
    for (const id in this.scheduledNotifications) {
      clearTimeout(this.scheduledNotifications[id]);
    }
    this.scheduledNotifications = {};
    return true;
  }
  
  /**
   * Update notification settings based on user preferences
   */
  async updateNotificationSettings(preferences) {
    // If notifications are now enabled and permission is granted, schedule them
    if (preferences.notificationsEnabled && this.notificationPermission === 'granted') {
      await this.scheduleAllNotifications();
    } 
    // If notifications are now disabled, clear all scheduled notifications
    else if (!preferences.notificationsEnabled) {
      this.clearAllScheduledNotifications();
    }
    
    return true;
  }
}

// Will be initialized in app.js with the storageManager instance
