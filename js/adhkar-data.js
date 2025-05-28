/**
 * Wirdak - Islamic Dhikr Habit Tracking App
 * adhkar-data.js - Processes and provides access to Hisn Al-Muslim data
 */

class AdhkarDataManager {
  constructor() {
    this.allAdhkar = [];
    this.categories = {};
    this.highlightedCategories = ['morning', 'evening', 'sleep'];
    this.initialized = false;
  }

  /**
   * Initialize the data manager by loading and processing the JSON data
   */
  async initialize() {
    try {
      const response = await fetch('/data/hisn-al-muslim.json');
      const data = await response.json();
      this.processData(data);
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Adhkar data:', error);
      return false;
    }
  }

  /**
   * Process the raw JSON data into a more usable format
   */
  processData(data) {
    // Reset collections
    this.allAdhkar = [];
    this.categories = {};
    
    // Process each page of data
    data.forEach(page => {
      const category = page.category;
      
      // Create category if it doesn't exist
      if (!this.categories[category]) {
        this.categories[category] = {
          title: {
            ar: category,
            en: this.translateCategoryToEnglish(category)
          },
          icon: this.getCategoryIcon(category),
          dhikr: []
        };
      }
      
      // Process each dhikr in the page
      page.thikrs.forEach((dhikr, index) => {
        const processedDhikr = {
          id: `${this.slugify(category)}_${index}`,
          arabic: dhikr.text,
          transliteration: '', // Not available in the source data
          translation: '', // Not available in the source data
          category: this.mapCategory(category),
          audioUrl: dhikr.audio_url,
          count: this.extractCount(dhikr.text),
          benefits: '',
          occasion: '',
          order: index,
          source: this.extractSource(dhikr.text),
          isHighlighted: this.isHighlightedCategory(category)
        };
        
        // Add to collections
        this.allAdhkar.push(processedDhikr);
        this.categories[category].dhikr.push(processedDhikr);
      });
    });
  }
  
  /**
   * Map Arabic category names to standardized category keys
   */
  mapCategory(arabicCategory) {
    const categoryMap = {
      'أذكار الصباح والمساء': 'morning_evening',
      'أذكار الصباح': 'morning',
      'أذكار المساء': 'evening',
      'أذكار النوم': 'sleep'
    };
    
    return categoryMap[arabicCategory] || this.slugify(arabicCategory);
  }
  
  /**
   * Check if a category is in the highlighted categories list
   */
  isHighlightedCategory(category) {
    const normalizedCategory = this.mapCategory(category);
    return this.highlightedCategories.includes(normalizedCategory) || 
           normalizedCategory === 'morning_evening';
  }
  
  /**
   * Extract the recommended count from dhikr text if available
   */
  extractCount(text) {
    // Look for patterns like (ثلاثَ مرَّاتٍ) or (مائة مرَّةٍ)
    const countMatches = text.match(/\(([^)]*مرَّات|مرَّةٍ|مرة|مرات)[^)]*\)/);
    
    if (countMatches) {
      if (countMatches[0].includes('ثلاث')) return 3;
      if (countMatches[0].includes('أربع')) return 4;
      if (countMatches[0].includes('سبع')) return 7;
      if (countMatches[0].includes('عشر')) return 10;
      if (countMatches[0].includes('مائة')) return 100;
      if (countMatches[0].includes('ثلاثاً وثلاثين')) return 33;
      if (countMatches[0].includes('أربعاً وثلاثين')) return 34;
    }
    
    return 1; // Default count
  }
  
  /**
   * Extract the source reference from dhikr text if available
   */
  extractSource(text) {
    // Look for patterns like (رواه البخاري) or (آل عمران: 173)
    const sourceMatches = text.match(/\(\((.*?)\)\)|\(\*\*(.*?)\*\*\)/);
    if (sourceMatches) {
      return sourceMatches[1] || sourceMatches[2] || '';
    }
    return '';
  }
  
  /**
   * Get an appropriate icon for each category
   */
  getCategoryIcon(category) {
    const iconMap = {
      'أذكار الصباح والمساء': '🌅',
      'أذكار الصباح': '🌅',
      'أذكار المساء': '🌆',
      'أذكار النوم': '🌙',
      'دعاء ُلبْس الثوب': '👕',
      'دعاء ُلبْس الثوب الجديد': '👚',
      'الدعاء لمن لبس ثوبا جديدا': '👗',
      'دعاء دخول الخلاء': '🚪',
      'دعاء الخروج من الخلاء': '🚶',
      'الذكر قبل الوضوء': '💧',
      'الذكر بعد الفراغ من الوضوء': '✨'
    };
    
    return iconMap[category] || '📿';
  }
  
  /**
   * Translate Arabic category names to English
   */
  translateCategoryToEnglish(arabicCategory) {
    const translationMap = {
      'أذكار الصباح والمساء': 'Morning and Evening Adhkar',
      'أذكار الصباح': 'Morning Adhkar',
      'أذكار المساء': 'Evening Adhkar',
      'أذكار النوم': 'Sleep Adhkar',
      'دعاء ُلبْس الثوب': 'Dua for Wearing Clothes',
      'دعاء ُلبْس الثوب الجديد': 'Dua for Wearing New Clothes',
      'الدعاء لمن لبس ثوبا جديدا': 'Dua for Someone Wearing New Clothes',
      'دعاء دخول الخلاء': 'Dua for Entering the Bathroom',
      'دعاء الخروج من الخلاء': 'Dua for Leaving the Bathroom',
      'الذكر قبل الوضوء': 'Dhikr Before Ablution',
      'الذكر بعد الفراغ من الوضوء': 'Dhikr After Ablution'
    };
    
    return translationMap[arabicCategory] || arabicCategory;
  }
  
  /**
   * Convert a string to a URL-friendly slug
   */
  slugify(text) {
    return text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '_');
  }
  
  /**
   * Get all adhkar data
   */
  getAllAdhkar() {
    return this.allAdhkar;
  }
  
  /**
   * Get adhkar by category
   */
  getAdhkarByCategory(category) {
    return this.allAdhkar.filter(dhikr => dhikr.category === category);
  }
  
  /**
   * Get highlighted categories (morning, evening, sleep)
   */
  getHighlightedCategories() {
    return Object.keys(this.categories)
      .filter(key => this.isHighlightedCategory(key))
      .map(key => this.categories[key]);
  }
  
  /**
   * Get all categories
   */
  getAllCategories() {
    return this.categories;
  }
}

// Create a singleton instance
const adhkarDataManager = new AdhkarDataManager();
