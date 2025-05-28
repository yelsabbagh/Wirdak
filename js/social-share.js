/**
 * Wirdak - Islamic Dhikr Habit Tracking App
 * social-share.js - Social sharing functionality
 */

class SocialShareManager {
  constructor() {
    this.appUrl = window.location.href.split('?')[0]; // Remove any query parameters
  }

  /**
   * Get engaging messages for sharing
   */
  getEngagingMessages() {
    return {
      ar: [
        "🌙 اكتشف تطبيق وردك للمحافظة على الأذكار اليومية وبناء العادات الإسلامية بطريقة ممتعة ومشوقة! 📿",
        "✨ وردك - تطبيقك المثالي لتتبع الأذكار والقرآن يومياً، مع تذكيرات لطيفة وإحصائيات تحفيزية! 🕌",
        "🤲 ابدأ رحلتك الروحية مع وردك - تطبيق يساعدك على الاستمرار في الذكر والدعاء كل يوم! 🌟"
      ],
      en: [
        "🌙 Discover Wirdak - the perfect Islamic app for building daily dhikr habits and spiritual consistency! 📿",
        "✨ Transform your spiritual routine with Wirdak - track Quran reading, morning/evening adhkar with beautiful progress tracking! 🕌", 
        "🤲 Join thousands of Muslims building consistent dhikr habits with Wirdak - your daily spiritual companion! 🌟"
      ]
    };
  }
  
  /**
   * Share to WhatsApp
   */
  shareToWhatsApp(language = 'en') {
    const messages = this.getEngagingMessages();
    const message = messages[language][Math.floor(Math.random() * messages[language].length)];
    const url = this.appUrl;
    const shareText = `${message}\n\n${url}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Wirdak - وردك',
        text: shareText,
        url: url
      }).catch(error => {
        console.error('Error sharing:', error);
        this.fallbackShare('whatsapp', shareText);
      });
    } else {
      this.fallbackShare('whatsapp', shareText);
    }
  }
  
  /**
   * Share to Telegram
   */
  shareToTelegram(language = 'en') {
    const messages = this.getEngagingMessages();
    const message = messages[language][Math.floor(Math.random() * messages[language].length)];
    const url = this.appUrl;
    const shareText = message;
    
    if (navigator.share) {
      navigator.share({
        title: 'Wirdak - وردك',
        text: shareText,
        url: url
      }).catch(error => {
        console.error('Error sharing:', error);
        this.fallbackShare('telegram', shareText, url);
      });
    } else {
      this.fallbackShare('telegram', shareText, url);
    }
  }
  
  /**
   * Share to Twitter
   */
  shareToTwitter(language = 'en') {
    const messages = this.getEngagingMessages();
    const message = messages[language][Math.floor(Math.random() * messages[language].length)];
    const url = this.appUrl;
    const hashtags = language === 'ar' ? 'أذكار,إسلام,وردك' : 'Islamic,Dhikr,Muslim,Wirdak';
    
    if (navigator.share) {
      navigator.share({
        title: 'Wirdak - وردك',
        text: message,
        url: url
      }).catch(error => {
        console.error('Error sharing:', error);
        this.fallbackShare('twitter', message, url, hashtags);
      });
    } else {
      this.fallbackShare('twitter', message, url, hashtags);
    }
  }
  
  /**
   * Share to Facebook
   */
  shareToFacebook() {
    const url = this.appUrl;
    
    if (navigator.share) {
      navigator.share({
        title: 'Wirdak - وردك',
        url: url
      }).catch(error => {
        console.error('Error sharing:', error);
        this.fallbackShare('facebook', '', url);
      });
    } else {
      this.fallbackShare('facebook', '', url);
    }
  }
  
  /**
   * Fallback sharing method when Web Share API is not available
   */
  fallbackShare(platform, text, url = this.appUrl, hashtags = '') {
    let shareUrl;
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${hashtags}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      default:
        console.error('Unknown platform:', platform);
        return;
    }
    
    // Open in new window
    window.open(shareUrl, '_blank');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SocialShareManager;
}
