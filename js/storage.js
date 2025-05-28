/**
 * Wirdak - Islamic Dhikr Habit Tracking App
 * storage.js - LocalStorage/IndexedDB wrapper for data persistence
 */

class StorageManager {
  constructor() {
    this.dbName = 'wirdak_db';
    this.dbVersion = 1;
    this.db = null;
    this.isIndexedDBSupported = 'indexedDB' in window;
    this.storageKeys = {
      PREFERENCES: 'wirdak_preferences',
      PROGRESS: 'wirdak_progress',
      CUSTOM_DHIKR: 'wirdak_custom_dhikr',
      STREAKS: 'wirdak_streaks',
      ACHIEVEMENTS: 'wirdak_achievements',
      DAILY_ROUTINE: 'wirdak_daily_routine'
    };
  }

  /**
   * Initialize the storage system
   */
  async initialize() {
    // Always set up localStorage as fallback
    this.ensureLocalStorageInitialized();
    
    // Try to set up IndexedDB if supported
    if (this.isIndexedDBSupported) {
      try {
        await this.initializeIndexedDB();
        console.log('IndexedDB initialized successfully');
        return true;
      } catch (error) {
        console.error('Failed to initialize IndexedDB, falling back to localStorage:', error);
        return false;
      }
    } else {
      console.log('IndexedDB not supported, using localStorage only');
      return true;
    }
  }

  /**
   * Initialize IndexedDB database
   */
  initializeIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = (event) => {
        reject(new Error('IndexedDB error: ' + event.target.errorCode));
      };
      
      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores for different data types
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences');
        }
        
        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress');
        }
        
        if (!db.objectStoreNames.contains('customDhikr')) {
          db.createObjectStore('customDhikr', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('streaks')) {
          db.createObjectStore('streaks');
        }
        
        if (!db.objectStoreNames.contains('achievements')) {
          db.createObjectStore('achievements', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('dailyRoutine')) {
          db.createObjectStore('dailyRoutine');
        }
      };
    });
  }

  /**
   * Ensure localStorage has initial values for all keys
   */
  ensureLocalStorageInitialized() {
    if (!localStorage.getItem(this.storageKeys.PREFERENCES)) {
      localStorage.setItem(this.storageKeys.PREFERENCES, JSON.stringify({
        language: this.detectUserLanguage(),
        theme: 'light',
        notificationsEnabled: true,
        morningReminderTime: '07:00',
        eveningReminderTime: '17:00',
        autoPlayAudio: false
      }));
    }
    
    if (!localStorage.getItem(this.storageKeys.PROGRESS)) {
      localStorage.setItem(this.storageKeys.PROGRESS, JSON.stringify({}));
    }
    
    if (!localStorage.getItem(this.storageKeys.CUSTOM_DHIKR)) {
      localStorage.setItem(this.storageKeys.CUSTOM_DHIKR, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(this.storageKeys.STREAKS)) {
      localStorage.setItem(this.storageKeys.STREAKS, JSON.stringify({
        currentStreak: 0,
        longestStreak: 0,
        lastCompletionDate: null
      }));
    }
    
    if (!localStorage.getItem(this.storageKeys.ACHIEVEMENTS)) {
      localStorage.setItem(this.storageKeys.ACHIEVEMENTS, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(this.storageKeys.DAILY_ROUTINE)) {
      localStorage.setItem(this.storageKeys.DAILY_ROUTINE, JSON.stringify({
        morning: [],
        evening: [],
        sleep: [],
        personalDaily: []
      }));
    }
  }

  /**
   * Detect user's preferred language
   */
  detectUserLanguage() {
    const userLang = navigator.language || navigator.userLanguage;
    return userLang.startsWith('ar') ? 'ar' : 'en';
  }

  /**
   * Get data from storage
   */
  async getData(key, defaultValue = null) {
    // Try IndexedDB first if available
    if (this.isIndexedDBSupported && this.db) {
      try {
        const store = this.mapKeyToStore(key);
        const value = await this.getFromIndexedDB(store, key);
        return value !== undefined ? value : defaultValue;
      } catch (error) {
        console.warn('IndexedDB get failed, falling back to localStorage:', error);
      }
    }
    
    // Fallback to localStorage
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.error('localStorage get failed:', error);
      return defaultValue;
    }
  }

  /**
   * Save data to storage
   */
  async setData(key, value) {
    // Try IndexedDB first if available
    if (this.isIndexedDBSupported && this.db) {
      try {
        const store = this.mapKeyToStore(key);
        await this.saveToIndexedDB(store, key, value);
      } catch (error) {
        console.warn('IndexedDB save failed, falling back to localStorage:', error);
      }
    }
    
    // Always save to localStorage as backup
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('localStorage save failed:', error);
      return false;
    }
  }

  /**
   * Get data from IndexedDB
   */
  getFromIndexedDB(storeName, key) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB not initialized'));
        return;
      }
      
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = (event) => {
        reject(new Error('IndexedDB get error: ' + event.target.errorCode));
      };
    });
  }

  /**
   * Save data to IndexedDB
   */
  saveToIndexedDB(storeName, key, value) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB not initialized'));
        return;
      }
      
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(value, key);
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = (event) => {
        reject(new Error('IndexedDB save error: ' + event.target.errorCode));
      };
    });
  }

  /**
   * Map storage key to IndexedDB store name
   */
  mapKeyToStore(key) {
    const mapping = {
      [this.storageKeys.PREFERENCES]: 'preferences',
      [this.storageKeys.PROGRESS]: 'progress',
      [this.storageKeys.CUSTOM_DHIKR]: 'customDhikr',
      [this.storageKeys.STREAKS]: 'streaks',
      [this.storageKeys.ACHIEVEMENTS]: 'achievements',
      [this.storageKeys.DAILY_ROUTINE]: 'dailyRoutine'
    };
    
    return mapping[key] || 'preferences';
  }

  /**
   * Get user preferences
   */
  async getPreferences() {
    return this.getData(this.storageKeys.PREFERENCES, {
      language: this.detectUserLanguage(),
      theme: 'light',
      notificationsEnabled: true,
      morningReminderTime: '07:00',
      eveningReminderTime: '17:00',
      autoPlayAudio: false
    });
  }

  /**
   * Save user preferences
   */
  async savePreferences(preferences) {
    return this.setData(this.storageKeys.PREFERENCES, preferences);
  }

  /**
   * Get progress data
   */
  async getProgress() {
    return this.getData(this.storageKeys.PROGRESS, {});
  }

  /**
   * Save progress data
   */
  async saveProgress(progress) {
    return this.setData(this.storageKeys.PROGRESS, progress);
  }

  /**
   * Get custom dhikr list
   */
  async getCustomDhikr() {
    return this.getData(this.storageKeys.CUSTOM_DHIKR, []);
  }

  /**
   * Save custom dhikr list
   */
  async saveCustomDhikr(customDhikr) {
    return this.setData(this.storageKeys.CUSTOM_DHIKR, customDhikr);
  }

  /**
   * Get streak data
   */
  async getStreaks() {
    return this.getData(this.storageKeys.STREAKS, {
      currentStreak: 0,
      longestStreak: 0,
      lastCompletionDate: null
    });
  }

  /**
   * Save streak data
   */
  async saveStreaks(streaks) {
    return this.setData(this.storageKeys.STREAKS, streaks);
  }

  /**
   * Get achievements list
   */
  async getAchievements() {
    return this.getData(this.storageKeys.ACHIEVEMENTS, []);
  }

  /**
   * Save achievements list
   */
  async saveAchievements(achievements) {
    return this.setData(this.storageKeys.ACHIEVEMENTS, achievements);
  }

  /**
   * Get daily routine configuration
   */
  async getDailyRoutine() {
    return this.getData(this.storageKeys.DAILY_ROUTINE, {
      morning: [],
      evening: [],
      sleep: [],
      personalDaily: []
    });
  }

  /**
   * Save daily routine configuration
   */
  async saveDailyRoutine(dailyRoutine) {
    return this.setData(this.storageKeys.DAILY_ROUTINE, dailyRoutine);
  }
}

// Create a singleton instance
const storageManager = new StorageManager();
