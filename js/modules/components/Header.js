function Header() {
  try {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isAboutOpen, setIsAboutOpen] = React.useState(false);
    const [isDarkTheme, setIsDarkTheme] = React.useState(() => {
      return window.ThemeUtils ? window.ThemeUtils.getTheme() === 'dark' : false;
    });
    
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Определяем, активна ли страница из раздела "О компании"
    const isAboutSectionActive = currentPage === 'about.html' || currentPage === 'faq.html' || currentPage === 'contacts.html';

    // Обработчик переключения темы
    const handleThemeToggle = () => {
      if (window.ThemeUtils) {
        const newTheme = window.ThemeUtils.toggleTheme();
        setIsDarkTheme(newTheme === 'dark');
      }
    };

    // Слушаем изменения темы
    React.useEffect(() => {
      const handleThemeChange = (e) => {
        setIsDarkTheme(e.detail.theme === 'dark');
      };
      
      window.addEventListener('themechange', handleThemeChange);
      
      // Проверяем текущую тему при монтировании
      if (window.ThemeUtils) {
        setIsDarkTheme(window.ThemeUtils.getTheme() === 'dark');
      }
      
      return () => {
        window.removeEventListener('themechange', handleThemeChange);
      };
    }, []);

    // Закрытие выпадающих меню при клике вне области
    React.useEffect(() => {
      const handleClickOutside = (e) => {
        if (!e.target.closest('.dropdown-menu') && !e.target.closest('button')) {
          setIsAboutOpen(false);
        }
      };

      if (isAboutOpen) {
        document.addEventListener('click', handleClickOutside);
      }

      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }, [isAboutOpen]);

    // Обработчик для закрытия меню при клике на ссылку
    const handleAboutLinkClick = () => {
      setIsAboutOpen(false);
    };

    return (
      <header className="bg-[var(--bg-primary)] shadow-md sticky top-0 z-50 border-b border-[var(--border-color)] transition-colors duration-300" data-name="header" data-file="components/Header.js">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <a href="index.html" className="flex items-center">
              <span className="text-xl font-bold" style={{ color: '#f59e0b' }}>ЭКО-МОТОР</span>
            </a>

            <nav className="hidden lg:flex items-center space-x-6">
              <a href="index.html" className={`hover:text-[var(--primary-color)] transition ${currentPage === 'index.html' ? 'text-[var(--primary-color)] font-semibold' : ''}`}>Главная</a>
              <div className="relative dropdown-menu">
                <button onClick={() => setIsAboutOpen(!isAboutOpen)} className={`flex items-center space-x-1 hover:text-[var(--primary-color)] transition ${isAboutSectionActive ? 'text-[var(--primary-color)] font-semibold' : ''}`}>
                  <span>О компании</span>
                  <div className="icon-chevron-down text-sm"></div>
                </button>
                {isAboutOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-lg rounded-lg py-2 w-48 z-50">
                    <a href="about.html" onClick={handleAboutLinkClick} className={`block px-4 py-2 hover:bg-[var(--bg-secondary)] transition-colors ${currentPage === 'about.html' ? 'text-[var(--primary-color)] font-semibold' : ''}`}>О компании</a>
                    <a href="faq.html" onClick={handleAboutLinkClick} className={`block px-4 py-2 hover:bg-[var(--bg-secondary)] transition-colors ${currentPage === 'faq.html' ? 'text-[var(--primary-color)] font-semibold' : ''}`}>FAQ</a>
                    <a href="contacts.html" onClick={handleAboutLinkClick} className={`block px-4 py-2 hover:bg-[var(--bg-secondary)] transition-colors ${currentPage === 'contacts.html' ? 'text-[var(--primary-color)] font-semibold' : ''}`}>Контакты</a>
                  </div>
                )}
              </div>
              <a href="services.html" className={`hover:text-[var(--primary-color)] transition ${currentPage === 'services.html' ? 'text-[var(--primary-color)] font-semibold' : ''}`}>Услуги</a>
              <a href="reviews.html" className={`hover:text-[var(--primary-color)] transition ${currentPage === 'reviews.html' ? 'text-[var(--primary-color)] font-semibold' : ''}`}>Отзывы</a>
              <button 
                onClick={handleThemeToggle}
                className="p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors"
                title={isDarkTheme ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
                aria-label="Переключить тему"
              >
                <div className={`icon-${isDarkTheme ? 'sun' : 'moon'} text-xl`}></div>
              </button>
              <a href="cabinet.html" className="btn-primary">Личный кабинет</a>
            </nav>

            <div className="flex items-center space-x-4 lg:hidden">
              <button 
                onClick={handleThemeToggle}
                className="p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors"
                title={isDarkTheme ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
                aria-label="Переключить тему"
              >
                <div className={`icon-${isDarkTheme ? 'sun' : 'moon'} text-xl`}></div>
              </button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <div className={`icon-${isMenuOpen ? 'x' : 'menu'} text-2xl`}></div>
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="lg:hidden pb-4 border-t border-[var(--border-color)] mt-4 pt-4">
              <a href="index.html" className="block py-2 hover:text-[var(--primary-color)] transition-colors">Главная</a>
              <div>
                <button onClick={() => setIsAboutOpen(!isAboutOpen)} className={`w-full flex items-center justify-between py-2 hover:text-[var(--primary-color)] transition-colors ${isAboutSectionActive ? 'text-[var(--primary-color)] font-semibold' : ''}`}>
                  <span>О компании</span>
                  <div className={`icon-chevron-down text-sm transition-transform ${isAboutOpen ? 'transform rotate-180' : ''}`}></div>
                </button>
                {isAboutOpen && (
                  <div className="pl-4 space-y-1">
                    <a href="about.html" onClick={handleAboutLinkClick} className={`block py-2 hover:text-[var(--primary-color)] transition-colors ${currentPage === 'about.html' ? 'text-[var(--primary-color)] font-semibold' : ''}`}>О компании</a>
                    <a href="faq.html" onClick={handleAboutLinkClick} className={`block py-2 hover:text-[var(--primary-color)] transition-colors ${currentPage === 'faq.html' ? 'text-[var(--primary-color)] font-semibold' : ''}`}>FAQ</a>
                    <a href="contacts.html" onClick={handleAboutLinkClick} className={`block py-2 hover:text-[var(--primary-color)] transition-colors ${currentPage === 'contacts.html' ? 'text-[var(--primary-color)] font-semibold' : ''}`}>Контакты</a>
                  </div>
                )}
              </div>
              <a href="services.html" className="block py-2 hover:text-[var(--primary-color)] transition-colors">Услуги</a>
              <a href="reviews.html" className="block py-2 hover:text-[var(--primary-color)] transition-colors">Отзывы</a>
              <a href="cabinet.html" className="block py-2 text-[var(--primary-color)] font-semibold">Личный кабинет</a>
            </div>
          )}
        </div>
      </header>
    );
  } catch (error) {
    console.error('Header component error:', error);
    return null;
  }
}

