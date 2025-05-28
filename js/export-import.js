/**
 * Wirdak - Islamic Dhikr Habit Tracking App
 * export-import.js - Data backup and restore functionality
 */

class DataBackupManager {
  constructor(storageManager) {
    this.storageManager = storageManager;
    this.appVersion = '1.0.0';
  }

  /**
   * Export all user data to a downloadable JSON file
   */
  async exportUserData() {
    try {
      // Collect all user data from storage
      const userData = {
        preferences: await this.storageManager.getPreferences(),
        progress: await this.storageManager.getProgress(),
        customDhikr: await this.storageManager.getCustomDhikr(),
        streaks: await this.storageManager.getStreaks(),
        achievements: await this.storageManager.getAchievements(),
        dailyRoutine: await this.storageManager.getDailyRoutine(),
        exportDate: new Date().toISOString(),
        appVersion: this.appVersion
      };
      
      // Create downloadable JSON file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], {type: 'application/json'});
      const url = URL.createObjectURL(dataBlob);
      
      // Trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `wirdak-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
      
      return {
        success: true,
        message: 'Data exported successfully'
      };
    } catch (error) {
      console.error('Export failed:', error);
      return {
        success: false,
        message: 'Failed to export data: ' + error.message
      };
    }
  }
  
  /**
   * Import user data from a JSON file
   * @param {File} file - The JSON file to import
   */
  importUserData(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const userData = JSON.parse(e.target.result);
          
          // Validate data structure
          if (this.validateBackupData(userData)) {
            // Restore data to storage
            await this.storageManager.savePreferences(userData.preferences);
            await this.storageManager.saveProgress(userData.progress);
            await this.storageManager.saveCustomDhikr(userData.customDhikr);
            await this.storageManager.saveStreaks(userData.streaks);
            await this.storageManager.saveAchievements(userData.achievements);
            
            // Handle dailyRoutine which might not exist in older backups
            if (userData.dailyRoutine) {
              await this.storageManager.saveDailyRoutine(userData.dailyRoutine);
            }
            
            resolve({
              success: true,
              message: 'Data imported successfully',
              importDate: new Date().toISOString(),
              originalExportDate: userData.exportDate || 'Unknown'
            });
          } else {
            reject(new Error('Invalid backup file format'));
          }
        } catch (error) {
          console.error('Import failed:', error);
          reject(new Error('Failed to import data: ' + error.message));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }
  
  /**
   * Validate the structure of imported backup data
   * @param {Object} data - The parsed backup data to validate
   */
  validateBackupData(data) {
    // Check for required properties
    const requiredProps = ['preferences', 'progress', 'customDhikr', 'streaks'];
    
    for (const prop of requiredProps) {
      if (!data.hasOwnProperty(prop)) {
        console.error(`Backup validation failed: missing ${prop}`);
        return false;
      }
    }
    
    // Validate preferences structure
    if (!data.preferences.hasOwnProperty('language') || 
        !data.preferences.hasOwnProperty('theme')) {
      console.error('Backup validation failed: invalid preferences structure');
      return false;
    }
    
    // Validate customDhikr is an array
    if (!Array.isArray(data.customDhikr)) {
      console.error('Backup validation failed: customDhikr is not an array');
      return false;
    }
    
    // Validate streaks structure
    if (!data.streaks.hasOwnProperty('currentStreak') || 
        !data.streaks.hasOwnProperty('longestStreak')) {
      console.error('Backup validation failed: invalid streaks structure');
      return false;
    }
    
    return true;
  }
  
  /**
   * Show success message after import
   */
  showImportSuccess() {
    const event = new CustomEvent('wirdak-import-success', {
      detail: {
        message: 'Data imported successfully! The app will reload to apply changes.'
      }
    });
    document.dispatchEvent(event);
  }
  
  /**
   * Show error message after import failure
   */
  showImportError(message) {
    const event = new CustomEvent('wirdak-import-error', {
      detail: {
        message: message || 'Failed to import data'
      }
    });
    document.dispatchEvent(event);
  }
}

// Will be initialized in app.js with the storageManager instance
