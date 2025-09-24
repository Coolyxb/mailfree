// Internationalization (i18n) system
class I18n {
  constructor() {
    this.currentLanguage = localStorage.getItem('language') || 'zh';
    this.translations = {};
    this.init();
  }

  async init() {
    await this.loadTranslations();
    this.applyLanguage();
    this.setupLanguageSwitcher();
    
    // Ensure language switcher is updated after setup
    setTimeout(() => {
      this.updateLanguageSwitcher();
    }, 100);
  }

  async loadTranslations() {
    try {
      const response = await fetch(`/js/locales/${this.currentLanguage}.json`);
      this.translations = await response.json();
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
    // Update document title
    document.title = this.t('page.title');
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const text = this.t(key);
      
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
      element.placeholder = this.t(key);
    });
  }

  setupLanguageSwitcher() {
    const switcher = document.getElementById('language-switcher');
    if (switcher) {
      switcher.addEventListener('click', () => {
        const newLang = this.currentLanguage === 'zh' ? 'en' : 'zh';
        this.switchLanguage(newLang);
      });
    }
  }

  updateLanguageSwitcher() {
    const switcher = document.getElementById('language-switcher');
    if (switcher) {
      const text = switcher.querySelector('.btn-text');
      
      if (this.currentLanguage === 'zh') {
        text.textContent = 'English';
      } else {
        text.textContent = '中文';
      }
    }
  }
}

// Initialize i18n immediately
window.i18n = new I18n();

// Also initialize when DOM is loaded as a fallback
document.addEventListener('DOMContentLoaded', () => {
  if (!window.i18n) {
    window.i18n = new I18n();
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = I18n;
}
