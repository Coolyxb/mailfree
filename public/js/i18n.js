// Internationalization (i18n) system
class I18n {
  constructor() {
    this.currentLanguage = localStorage.getItem('language') || 'zh';
    this.translations = {};
    this.isInitialized = false;
    this.init();
  }

  async init() {
    console.log('I18n initializing with language:', this.currentLanguage);
    await this.loadTranslations();
    this.applyLanguage();
    this.setupLanguageSwitcher();
    this.isInitialized = true;
    
    // Ensure language switcher is updated after setup
    setTimeout(() => {
      this.updateLanguageSwitcher();
    }, 100);
  }

  async loadTranslations() {
    try {
      console.log('Loading translations for:', this.currentLanguage);
      const response = await fetch(`/js/locales/${this.currentLanguage}.json`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      this.translations = await response.json();
      console.log('Translations loaded:', this.translations);
    } catch (error) {
      console.error('Failed to load translations:', error);
      // Fallback to Chinese if English fails
      if (this.currentLanguage === 'en') {
        this.currentLanguage = 'zh';
        const response = await fetch(`/js/locales/zh.json`);
        this.translations = await response.json();
      }
    }
  }

  t(key, fallback = '') {
    const keys = key.split('.');
    let value = this.translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback || key;
      }
    }
    
    return typeof value === 'string' ? value : fallback || key;
  }

  async switchLanguage(lang) {
    if (lang === this.currentLanguage) return;
    
    this.currentLanguage = lang;
    localStorage.setItem('language', lang);
    
    await this.loadTranslations();
    this.applyLanguage();
    
    // Update language switcher button
    this.updateLanguageSwitcher();
  }

  applyLanguage() {
    console.log('Applying language:', this.currentLanguage);
    console.log('Available translations:', Object.keys(this.translations));
    
    // Update document title
    document.title = this.t('page.title');
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const text = this.t(key);
      console.log(`Updating element with key ${key}: ${text}`);
      
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.placeholder = text;
      } else {
        element.textContent = text;
      }
    });

    // Update elements with data-i18n-attr for attributes
    document.querySelectorAll('[data-i18n-attr]').forEach(element => {
      const attrData = element.getAttribute('data-i18n-attr');
      const [attr, key] = attrData.split(':');
      element.setAttribute(attr, this.t(key));
    });

    // Update elements with data-i18n-title for title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      element.title = this.t(key);
    });

    // Update elements with data-i18n-placeholder for placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      const text = this.t(key);
      console.log(`Updating placeholder with key ${key}: ${text}`);
      element.placeholder = text;
    });
  }

  setupLanguageSwitcher() {
    const switcher = document.getElementById('language-switcher');
    if (switcher) {
      console.log('Setting up language switcher');
      switcher.addEventListener('click', () => {
        const newLang = this.currentLanguage === 'zh' ? 'en' : 'zh';
        console.log('Switching language from', this.currentLanguage, 'to', newLang);
        this.switchLanguage(newLang);
      });
    } else {
      console.log('Language switcher not found');
    }
  }

  updateLanguageSwitcher() {
    const switcher = document.getElementById('language-switcher');
    if (switcher) {
      const text = switcher.querySelector('.btn-text');
      if (text) {
        if (this.currentLanguage === 'zh') {
          text.textContent = 'English';
        } else {
          text.textContent = '中文';
        }
        console.log('Updated language switcher text to:', text.textContent);
      } else {
        console.log('Language switcher text element not found');
      }
    } else {
      console.log('Language switcher not found for update');
    }
  }
}

// Initialize i18n when DOM is ready
function initializeI18n() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.i18n = new I18n();
    });
  } else {
    window.i18n = new I18n();
  }
}

initializeI18n();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = I18n;
}
