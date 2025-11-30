// Главный файл приложения - определяет текущую страницу и рендерит соответствующий компонент

(function() {
  'use strict';

  // Определяем текущую страницу по имени файла
  function getCurrentPage() {
    let path = window.location.pathname;
    let filename = path.split('/').pop();
    
    // Если путь пустой или это корень, используем index.html
    if (!filename || filename === '' || filename.endsWith('/')) {
      filename = 'index.html';
    }
    
    // Обработка для file:// протокола
    if (window.location.protocol === 'file:') {
      const hash = window.location.hash;
      if (hash) {
        filename = hash.substring(1);
      } else if (!filename || filename === '') {
        filename = 'index.html';
      }
    }
    
    const pageMap = {
      'index.html': 'HomePage',
      'about.html': 'AboutPage',
      'services.html': 'ServicesPage',
      'contacts.html': 'ContactsPage',
      'faq.html': 'FAQPage',
      'reviews.html': 'ReviewsPage',
      'privacy.html': 'PrivacyPage',
      'cabinet.html': 'CabinetPage'
    };
    
    return pageMap[filename] || 'HomePage';
  }

  // Функция для проверки загрузки всех компонентов
  function waitForComponents(pageName, callback, maxAttempts = 50, attempt = 0) {
    if (attempt >= maxAttempts) {
      console.error('Timeout waiting for components to load');
      return;
    }

    // Проверяем наличие React и ReactDOM
    if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
      setTimeout(() => waitForComponents(pageName, callback, maxAttempts, attempt + 1), 100);
      return;
    }

    // Проверяем наличие ErrorBoundary
    if (typeof ErrorBoundary === 'undefined') {
      setTimeout(() => waitForComponents(pageName, callback, maxAttempts, attempt + 1), 100);
      return;
    }

    // Проверяем наличие компонента страницы
    let PageComponent;
    switch(pageName) {
      case 'HomePage':
        PageComponent = typeof HomePage !== 'undefined' ? HomePage : null;
        break;
      case 'AboutPage':
        PageComponent = typeof AboutPage !== 'undefined' ? AboutPage : null;
        break;
      case 'ServicesPage':
        PageComponent = typeof ServicesPage !== 'undefined' ? ServicesPage : null;
        break;
      case 'ContactsPage':
        PageComponent = typeof ContactsPage !== 'undefined' ? ContactsPage : null;
        break;
      case 'FAQPage':
        PageComponent = typeof FAQPage !== 'undefined' ? FAQPage : null;
        break;
      case 'ReviewsPage':
        PageComponent = typeof ReviewsPage !== 'undefined' ? ReviewsPage : null;
        break;
      case 'PrivacyPage':
        PageComponent = typeof PrivacyPage !== 'undefined' ? PrivacyPage : null;
        break;
      case 'CabinetPage':
        PageComponent = typeof CabinetPage !== 'undefined' ? CabinetPage : null;
        break;
      default:
        PageComponent = typeof HomePage !== 'undefined' ? HomePage : null;
    }

    if (!PageComponent) {
      setTimeout(() => waitForComponents(pageName, callback, maxAttempts, attempt + 1), 100);
      return;
    }

    // Все компоненты загружены, вызываем callback
    callback(PageComponent);
  }

  // Функция для рендеринга страницы
  function renderPage() {
    const pageName = getCurrentPage();
    const root = document.getElementById('root');
    
    if (!root) {
      console.error('Root element not found');
      return;
    }

    // Ждем загрузки всех компонентов
    waitForComponents(pageName, function(PageComponent) {
      try {
        // Создаем корень React и рендерим страницу с ErrorBoundary
        const reactRoot = ReactDOM.createRoot(root);
        const ErrorBoundaryComponent = typeof ErrorBoundary !== 'undefined' ? ErrorBoundary : null;
        
        if (ErrorBoundaryComponent) {
          reactRoot.render(
            React.createElement(ErrorBoundaryComponent, null,
              React.createElement(PageComponent)
            )
          );
        } else {
          reactRoot.render(React.createElement(PageComponent));
        }
      } catch (error) {
        console.error('Error rendering page:', error);
        root.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>Ошибка загрузки</h1><p>Проверьте консоль браузера для деталей.</p></div>';
      }
    });
  }

  // Запускаем рендеринг после загрузки DOM и всех скриптов
  function init() {
    // Ждем полной загрузки страницы
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        // Даем время на загрузку и обработку всех скриптов с type="text/babel" Babel'ом
        setTimeout(renderPage, 1000);
      });
    } else {
      // DOM уже загружен, но скрипты могут еще загружаться
      setTimeout(renderPage, 1000);
    }
    
    // Дополнительная проверка после полной загрузки страницы
    window.addEventListener('load', function() {
      setTimeout(renderPage, 500);
    });
  }

  init();
})();

