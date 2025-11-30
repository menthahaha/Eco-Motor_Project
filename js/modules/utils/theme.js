// Утилита для управления темой (светлая/темная)

// Получение текущей темы из localStorage или системных настроек
function getTheme() {
  try {
    const savedTheme = localStorage.getItem('eco_motor_theme');
    if (savedTheme) {
      return savedTheme;
    }
    // Проверяем системные настройки
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  } catch (error) {
    console.error('Error getting theme:', error);
    return 'light';
  }
}

// Установка темы
function setTheme(theme) {
  try {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.setAttribute('data-theme', 'dark');
    } else {
      html.removeAttribute('data-theme');
    }
    localStorage.setItem('eco_motor_theme', theme);
    
    // Вызываем событие для уведомления других компонентов
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    
    return true;
  } catch (error) {
    console.error('Error setting theme:', error);
    return false;
  }
}

// Переключение темы
function toggleTheme() {
  const currentTheme = getTheme();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  return setTheme(newTheme);
}

// Инициализация темы при загрузке страницы
function initTheme() {
  const theme = getTheme();
  setTheme(theme);
}

// Экспорт функций
if (typeof window !== 'undefined') {
  window.ThemeUtils = {
    getTheme,
    setTheme,
    toggleTheme,
    initTheme
  };
  
  // Инициализируем тему при загрузке
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }
}


