function CabinetPage() {
  try {
    // Проверяем, авторизован ли пользователь при загрузке
    const [isLoggedIn, setIsLoggedIn] = React.useState(() => {
      return window.StorageUtils ? window.StorageUtils.isUserLoggedIn() : false;
    });
    const [showRegister, setShowRegister] = React.useState(false);
    const [selectedCell, setSelectedCell] = React.useState(null);
    const [currentUser, setCurrentUser] = React.useState(() => {
      return window.StorageUtils ? window.StorageUtils.getCurrentUser() : null;
    });

    // Инициализация ячеек - все изначально свободные
    const [cells, setCells] = React.useState(() => {
      return Array.from({ length: 40 }, (_, i) => ({
        id: i + 1,
        status: 'available'
      }));
    });

    // Функция для обновления статусов ячеек на основе бронирований
    const updateCellsStatus = React.useCallback(() => {
      if (window.StorageUtils) {
        // Получаем все активные бронирования
        const allBookings = window.StorageUtils.getBookings();
        const activeBookings = allBookings.filter(b => b.status === 'active');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Обновляем статусы ячеек на основе бронирований
        setCells(prevCells => {
          return prevCells.map(cell => {
            // Проверяем, есть ли активное бронирование для этой ячейки
            // Показываем ячейку как занятую, если она забронирована (даже если период еще не начался)
            const booking = activeBookings.find(b => {
              if (b.cellId !== cell.id) return false;
              
              // Если есть период (startDate и endDate), проверяем, не закончился ли он
              if (b.startDate && b.endDate) {
                const startDate = new Date(b.startDate);
                const endDate = new Date(b.endDate);
                endDate.setHours(23, 59, 59, 999);
                
                // Бронирование активно, если период еще не закончился (endDate >= today)
                return today <= endDate;
              }
              
              // Если нет периода, но есть дата (старый формат), проверяем её
              if (b.date) {
                const bookingDate = new Date(b.date);
                bookingDate.setHours(0, 0, 0, 0);
                // Считаем, что бронирование активно, если дата сегодня или в будущем
                return bookingDate >= today;
              }
              
              // Если нет ни периода, ни даты, считаем активным
              return true;
            });
            
            if (booking) {
              // Если это бронирование текущего пользователя - показываем как забронированную
              if (currentUser && booking.userEmail === currentUser.email) {
                return { ...cell, status: 'booked' };
              } else {
                // Если это бронирование другого пользователя - показываем как занятую
                return { ...cell, status: 'occupied' };
              }
            }
            return { ...cell, status: 'available' };
          });
        });
      }
    }, [currentUser]);

    // Загрузка бронирований при монтировании компонента и при изменении currentUser
    React.useEffect(() => {
      updateCellsStatus();
    }, [updateCellsStatus]);

    const LoginForm = () => {
      const [formData, setFormData] = React.useState({ email: '', password: '' });
      const [errors, setErrors] = React.useState({ email: '', password: '' });
      const [emailSuggestions, setEmailSuggestions] = React.useState([]);
      const [emailSelected, setEmailSelected] = React.useState(false);
      const [showPassword, setShowPassword] = React.useState(false);
      const [passwordChecks, setPasswordChecks] = React.useState({
        length: false,
        hasLetters: false,
        hasUpperCase: false,
        hasDigit: false,
        hasSpecialChar: false
      });

      const handleEmailChange = (e) => {
        // Если email был выбран из списка, не позволяем редактировать
        if (emailSelected) {
          return;
        }
        
        let value = e.target.value;
        
        // Если email уже содержит @, проверяем, не пытается ли пользователь редактировать локальную часть после @
        if (value.includes('@')) {
          const parts = value.split('@');
          if (parts.length > 2) {
            // Если больше одного @, оставляем только первый
            value = parts[0] + '@' + parts.slice(1).join('@');
          }
        }
        
        // Фильтруем кириллицу и другие недопустимые символы (разрешаем только латиницу, цифры и специальные символы для email)
        // Разрешенные символы: a-z, A-Z, 0-9, @, ., _, -, +
        value = value.replace(/[^a-zA-Z0-9@._+-]/g, '');
        
        // Если email уже содержит @, не позволяем редактировать локальную часть после @
        if (value.includes('@')) {
          const [localPart, ...domainParts] = value.split('@');
          const domain = domainParts.join('@');
          // Фильтруем только домен (не позволяем редактировать локальную часть после выбора)
          const filteredDomain = domain.replace(/[^a-zA-Z0-9._-]/g, '');
          value = localPart + '@' + filteredDomain;
        }
        
        setFormData({...formData, email: value});
        
        // Валидация email в реальном времени
        if (value.length > 0 && !value.includes('@')) {
          // Показываем подсказки, если пользователь еще не ввел @
          const commonDomains = ['gmail.com', 'mail.ru', 'yandex.ru', 'outlook.com', 'yahoo.com'];
          setEmailSuggestions(commonDomains.map(domain => `${value}@${domain}`));
        } else {
          setEmailSuggestions([]);
        }
        
        if (value.includes('@')) {
          const validationResult = window.ValidationUtils ? window.ValidationUtils.validateEmail(value) : { valid: true, error: '' };
          setErrors({...errors, email: validationResult.valid ? '' : validationResult.error});
        } else {
          setErrors({...errors, email: ''});
        }
      };

      const handlePasswordChange = (e) => {
        const value = e.target.value;
        setFormData({...formData, password: value});
        
        // Валидация в реальном времени с детальными проверками
        if (value.length === 0) {
          setErrors({...errors, password: ''});
          setPasswordChecks({
            length: false,
            hasLetters: false,
            hasUpperCase: false,
            hasDigit: false,
            hasSpecialChar: false
          });
        } else {
          const validationResult = window.ValidationUtils ? window.ValidationUtils.validatePassword(value) : {
            valid: value.length >= 8,
            error: value.length < 8 ? 'Минимум 8 символов' : '',
            checks: {
              length: value.length >= 8,
              hasLetters: /[a-zA-Z]/.test(value),
              hasUpperCase: /[A-Z]/.test(value),
              hasDigit: /[0-9]/.test(value),
              hasSpecialChar: /[!@#$%^&*()_+=\-]/.test(value)
            }
          };
          
          setPasswordChecks(validationResult.checks);
          
          // Показываем ошибку только если пароль не соответствует требованиям
          if (value.length > 0 && !validationResult.valid) {
            setErrors({...errors, password: validationResult.error});
          } else if (validationResult.valid) {
            setErrors({...errors, password: ''});
          }
        }
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Проверяем, не авторизован ли уже пользователь
        if (isLoggedIn) {
          setErrors({...errors, email: '', password: 'Вы уже авторизованы'});
          return;
        }
        
        const emailValidation = window.ValidationUtils ? window.ValidationUtils.validateEmail(formData.email) : { valid: formData.email.includes('@'), error: '' };
        const passwordValidation = window.ValidationUtils ? window.ValidationUtils.validatePassword(formData.password) : {
          valid: formData.password.length >= 8,
          error: formData.password.length === 0 ? 'Пароль обязателен для заполнения' : 'Пароль не соответствует требованиям',
          checks: passwordChecks
        };
        
        if (!emailValidation.valid) {
          setErrors({...errors, email: emailValidation.error || 'Введите корректный email адрес', password: ''});
          return;
        }
        
        if (!passwordValidation.valid) {
          setErrors({...errors, password: passwordValidation.error});
          setPasswordChecks(passwordValidation.checks);
          return;
        }
        
        // Попытка входа
        if (window.StorageUtils) {
          // Дополнительная проверка перед попыткой входа
          if (window.StorageUtils.isUserLoggedIn()) {
            setErrors({...errors, email: '', password: 'Вы уже авторизованы. Пожалуйста, выйдите из текущей сессии'});
            return;
          }
          
          const loginResult = await window.StorageUtils.loginUser(formData.email, formData.password);
          if (loginResult.success) {
            setIsLoggedIn(true);
            setCurrentUser(loginResult.user);
          } else {
            setErrors({...errors, password: loginResult.error || 'Ошибка входа'});
          }
        } else {
          // Если утилиты не загружены, просто переключаем состояние (для обратной совместимости)
          setIsLoggedIn(true);
        }
      };

      return (
        <div className="card max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-[var(--text-dark)]">Вход в личный кабинет</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input 
                type="email" 
                placeholder="example@mail.ru" 
                required 
                readOnly={emailSelected}
                className={`w-full px-4 py-3 border rounded-xl ${errors.email ? 'border-red-500' : 'border-[var(--border-color)]'} ${emailSelected ? 'bg-[var(--bg-secondary)] cursor-not-allowed' : 'bg-[var(--bg-primary)]'} text-[var(--text-dark)]`}
                value={formData.email}
                onChange={handleEmailChange}
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
              {emailSuggestions.length > 0 && formData.email.length > 0 && !formData.email.includes('@') && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  {emailSuggestions.slice(0, 3).map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFormData({...formData, email: suggestion});
                        setEmailSuggestions([]);
                        setEmailSelected(true);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[var(--bg-secondary)] first:rounded-t-lg last:rounded-b-lg text-[var(--text-dark)] bg-[var(--bg-primary)]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Пароль" 
                required 
                className={`w-full px-4 py-3 pr-12 border rounded-xl bg-[var(--bg-primary)] text-[var(--text-dark)] ${errors.password ? 'border-red-500' : passwordChecks.length && passwordChecks.hasLetters && passwordChecks.hasUpperCase && passwordChecks.hasDigit && passwordChecks.hasSpecialChar ? 'border-green-500' : 'border-[var(--border-color)]'}`}
                value={formData.password}
                onChange={handlePasswordChange}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 z-10 text-[var(--text-light)] hover:text-[var(--text-dark)] transition-colors focus:outline-none cursor-pointer"
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                style={{ lineHeight: '1.5rem' }}
              >
                {showPassword ? (
                  <div className="icon-eye-off text-xl"></div>
                ) : (
                  <div className="icon-eye text-xl"></div>
                )}
              </button>
              {formData.password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-xs">
                    <span className={`mr-2 ${passwordChecks.length ? 'text-green-500' : 'text-[var(--text-light)]'}`}>
                      {passwordChecks.length ? '✓' : '○'}
                    </span>
                    <span className={passwordChecks.length ? 'text-green-500' : 'text-[var(--text-light)]'}>
                      Минимум 8 символов
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <span className={`mr-2 ${passwordChecks.hasLetters ? 'text-green-500' : 'text-[var(--text-light)]'}`}>
                      {passwordChecks.hasLetters ? '✓' : '○'}
                    </span>
                    <span className={passwordChecks.hasLetters ? 'text-green-500' : 'text-[var(--text-light)]'}>
                      Латинские буквы
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <span className={`mr-2 ${passwordChecks.hasUpperCase ? 'text-green-500' : 'text-[var(--text-light)]'}`}>
                      {passwordChecks.hasUpperCase ? '✓' : '○'}
                    </span>
                    <span className={passwordChecks.hasUpperCase ? 'text-green-500' : 'text-[var(--text-light)]'}>
                      Заглавная буква
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <span className={`mr-2 ${passwordChecks.hasDigit ? 'text-green-500' : 'text-[var(--text-light)]'}`}>
                      {passwordChecks.hasDigit ? '✓' : '○'}
                    </span>
                    <span className={passwordChecks.hasDigit ? 'text-green-500' : 'text-[var(--text-light)]'}>
                      Цифра
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <span className={`mr-2 ${passwordChecks.hasSpecialChar ? 'text-green-500' : 'text-[var(--text-light)]'}`}>
                      {passwordChecks.hasSpecialChar ? '✓' : '○'}
                    </span>
                    <span className={passwordChecks.hasSpecialChar ? 'text-green-500' : 'text-[var(--text-light)]'}>
                      Спецсимвол (!@#$%^&*()_+=-)
                    </span>
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
            <button type="submit" className="btn-primary w-full">Войти</button>
          </form>
          <div className="mt-4 text-center">
            <button onClick={() => setShowRegister(true)} className="text-[var(--primary-color)]">
              Нет аккаунта? Зарегистрироваться
            </button>
          </div>
        </div>
      );
    };

    const RegisterForm = () => {
      const [formData, setFormData] = React.useState({ name: '', email: '', phone: '', password: '' });
      const [errors, setErrors] = React.useState({ name: '', email: '', phone: '', password: '' });
      const [emailSuggestions, setEmailSuggestions] = React.useState([]);
      const [emailSelected, setEmailSelected] = React.useState(false);
      const [showPassword, setShowPassword] = React.useState(false);
      const [passwordChecks, setPasswordChecks] = React.useState({
        length: false,
        hasLetters: false,
        hasUpperCase: false,
        hasDigit: false,
        hasSpecialChar: false
      });

      const handleEmailChange = (e) => {
        // Если email был выбран из списка, не позволяем редактировать
        if (emailSelected) {
          return;
        }
        
        let value = e.target.value;
        
        // Если email уже содержит @, проверяем, не пытается ли пользователь редактировать локальную часть после @
        if (value.includes('@')) {
          const parts = value.split('@');
          if (parts.length > 2) {
            // Если больше одного @, оставляем только первый
            value = parts[0] + '@' + parts.slice(1).join('@');
          }
        }
        
        // Фильтруем кириллицу и другие недопустимые символы (разрешаем только латиницу, цифры и специальные символы для email)
        // Разрешенные символы: a-z, A-Z, 0-9, @, ., _, -, +
        value = value.replace(/[^a-zA-Z0-9@._+-]/g, '');
        
        // Если email уже содержит @, не позволяем редактировать локальную часть после @
        if (value.includes('@')) {
          const [localPart, ...domainParts] = value.split('@');
          const domain = domainParts.join('@');
          // Фильтруем только домен (не позволяем редактировать локальную часть после выбора)
          const filteredDomain = domain.replace(/[^a-zA-Z0-9._-]/g, '');
          value = localPart + '@' + filteredDomain;
        }
        
        setFormData({...formData, email: value});
        
        if (value.length > 0 && !value.includes('@')) {
          const commonDomains = ['gmail.com', 'mail.ru', 'yandex.ru', 'outlook.com', 'yahoo.com'];
          setEmailSuggestions(commonDomains.map(domain => `${value}@${domain}`));
        } else {
          setEmailSuggestions([]);
        }
        
        if (value.includes('@')) {
          const validationResult = window.ValidationUtils ? window.ValidationUtils.validateEmail(value) : { valid: true, error: '' };
          setErrors({...errors, email: validationResult.valid ? '' : validationResult.error});
        } else {
          setErrors({...errors, email: ''});
        }
      };

      const handlePhoneChange = (e) => {
        const formatted = window.ValidationUtils ? window.ValidationUtils.formatPhoneNumber(e.target.value) : e.target.value;
        setFormData({...formData, phone: formatted});
        
        // Валидация в реальном времени (только если номер полный)
        if (formatted.length >= 18) {
          const isValid = window.ValidationUtils ? window.ValidationUtils.validatePhone(formatted) : true;
          setErrors({...errors, phone: isValid ? '' : 'Введите корректный номер телефона'});
        } else if (formatted.length === 0) {
          setErrors({...errors, phone: ''});
        } else {
          // Пока номер вводится, не показываем ошибку
          setErrors({...errors, phone: ''});
        }
      };

      const handlePasswordChange = (e) => {
        const value = e.target.value;
        setFormData({...formData, password: value});
        
        // Валидация в реальном времени с детальными проверками
        if (value.length === 0) {
          setErrors({...errors, password: 'Пароль обязателен для заполнения'});
          setPasswordChecks({
            length: false,
            hasLetters: false,
            hasUpperCase: false,
            hasDigit: false,
            hasSpecialChar: false
          });
        } else {
          const validationResult = window.ValidationUtils ? window.ValidationUtils.validatePassword(value) : {
            valid: value.length >= 8,
            error: value.length < 8 ? 'Минимум 8 символов' : '',
            checks: {
              length: value.length >= 8,
              hasLetters: /[a-zA-Z]/.test(value),
              hasUpperCase: /[A-Z]/.test(value),
              hasDigit: /[0-9]/.test(value),
              hasSpecialChar: /[!@#$%^&*()_+=\-]/.test(value)
            }
          };
          
          setPasswordChecks(validationResult.checks);
          
          // Показываем ошибку только если пользователь начал вводить пароль
          if (value.length > 0 && !validationResult.valid) {
            setErrors({...errors, password: validationResult.error});
          } else if (validationResult.valid) {
            setErrors({...errors, password: ''});
          }
        }
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        const nameValidation = window.ValidationUtils ? window.ValidationUtils.validateName(formData.name) : { valid: formData.name.trim().length >= 2, error: '' };
        const emailValidation = window.ValidationUtils ? window.ValidationUtils.validateEmail(formData.email) : { valid: formData.email.includes('@'), error: '' };
        const phoneValid = window.ValidationUtils ? window.ValidationUtils.validatePhone(formData.phone) : formData.phone.length > 0;
        const passwordValidation = window.ValidationUtils ? window.ValidationUtils.validatePassword(formData.password) : {
          valid: formData.password.length >= 8,
          error: formData.password.length === 0 ? 'Пароль обязателен для заполнения' : 'Пароль не соответствует требованиям',
          checks: passwordChecks
        };
        
        if (!nameValidation.valid || !emailValidation.valid || !phoneValid || !passwordValidation.valid) {
          setErrors({
            name: nameValidation.valid ? '' : (nameValidation.error || 'Введите корректное имя'),
            email: emailValidation.valid ? '' : (emailValidation.error || 'Введите корректный email адрес'),
            phone: phoneValid ? '' : 'Введите корректный номер телефона',
            password: passwordValidation.valid ? '' : passwordValidation.error
          });
          setPasswordChecks(passwordValidation.checks);
          return;
        }
        
        // Регистрация пользователя
        if (window.StorageUtils) {
          const cleanPhone = window.ValidationUtils ? window.ValidationUtils.getCleanPhone(formData.phone) : formData.phone;
          const registerResult = await window.StorageUtils.registerUser({
            name: formData.name.trim(),
            email: formData.email,
            phone: cleanPhone,
            password: formData.password
          });
          
          if (registerResult.success) {
            // Автоматически авторизуем пользователя после регистрации
            // Небольшая задержка, чтобы данные успели сохраниться
            await new Promise(resolve => setTimeout(resolve, 100));
            const loginResult = await window.StorageUtils.loginUser(formData.email, formData.password);
            if (loginResult.success) {
              setIsLoggedIn(true);
              setCurrentUser(loginResult.user);
            } else {
              // Если не удалось войти, но регистрация прошла успешно, просто авторизуем вручную
              setIsLoggedIn(true);
              setCurrentUser(registerResult.user);
              console.log('Auto-login after registration failed, using registered user data:', loginResult.error);
            }
          } else {
            setErrors({...errors, email: registerResult.error || 'Ошибка при регистрации'});
          }
        } else {
          // Если утилиты не загружены, просто переключаем состояние (для обратной совместимости)
          setIsLoggedIn(true);
        }
      };

      return (
        <div className="card max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-[var(--text-dark)]">Регистрация</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input 
                type="text" 
                placeholder="Имя" 
                required 
                className={`w-full px-4 py-3 border rounded-xl bg-[var(--bg-primary)] text-[var(--text-dark)] ${errors.name ? 'border-red-500' : 'border-[var(--border-color)]'}`}
                value={formData.name}
                onChange={(e) => {
                  let value = e.target.value;
                  // Фильтруем недопустимые символы (только буквы и пробелы)
                  value = window.ValidationUtils ? window.ValidationUtils.filterNameInput(value) : value.replace(/[^а-яА-ЯёЁa-zA-Z\s]/g, '');
                  setFormData({...formData, name: value});
                  
                  // Валидация в реальном времени
                  if (value.length > 0) {
                    const validationResult = window.ValidationUtils ? window.ValidationUtils.validateName(value) : { valid: true, error: '' };
                    setErrors({...errors, name: validationResult.valid ? '' : validationResult.error});
                  } else {
                    setErrors({...errors, name: ''});
                  }
                }}
                autoComplete="name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
            <div className="relative">
              <input 
                type="email" 
                placeholder="example@mail.ru" 
                required 
                readOnly={emailSelected}
                className={`w-full px-4 py-3 border rounded-xl ${errors.email ? 'border-red-500' : 'border-[var(--border-color)]'} ${emailSelected ? 'bg-[var(--bg-secondary)] cursor-not-allowed' : 'bg-[var(--bg-primary)]'} text-[var(--text-dark)]`}
                value={formData.email}
                onChange={handleEmailChange}
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
              {emailSuggestions.length > 0 && formData.email.length > 0 && !formData.email.includes('@') && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  {emailSuggestions.slice(0, 3).map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFormData({...formData, email: suggestion});
                        setEmailSuggestions([]);
                        setEmailSelected(true);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[var(--bg-secondary)] first:rounded-t-lg last:rounded-b-lg text-[var(--text-dark)] bg-[var(--bg-primary)]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <input 
                type="tel" 
                placeholder="+7 (___) ___-__-__" 
                required 
                className={`w-full px-4 py-3 border rounded-xl bg-[var(--bg-primary)] text-[var(--text-dark)] ${errors.phone ? 'border-red-500' : 'border-[var(--border-color)]'}`}
                value={formData.phone}
                onChange={handlePhoneChange}
                maxLength="18"
                autoComplete="tel"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Пароль (минимум 8 символов)" 
                required 
                className={`w-full px-4 py-3 pr-12 border rounded-xl bg-[var(--bg-primary)] text-[var(--text-dark)] ${errors.password ? 'border-red-500' : passwordChecks.length && passwordChecks.hasLetters && passwordChecks.hasUpperCase && passwordChecks.hasDigit && passwordChecks.hasSpecialChar ? 'border-green-500' : 'border-[var(--border-color)]'}`}
                value={formData.password}
                onChange={handlePasswordChange}
                autoComplete="new-password"
                minLength="8"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 z-10 text-[var(--text-light)] hover:text-[var(--text-dark)] transition-colors focus:outline-none cursor-pointer"
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                style={{ lineHeight: '1.5rem' }}
              >
                {showPassword ? (
                  <div className="icon-eye-off text-xl"></div>
                ) : (
                  <div className="icon-eye text-xl"></div>
                )}
              </button>
              {formData.password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-xs">
                    <span className={`mr-2 ${passwordChecks.length ? 'text-green-500' : 'text-[var(--text-light)]'}`}>
                      {passwordChecks.length ? '✓' : '○'}
                    </span>
                    <span className={passwordChecks.length ? 'text-green-500' : 'text-[var(--text-light)]'}>
                      Минимум 8 символов
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <span className={`mr-2 ${passwordChecks.hasLetters ? 'text-green-500' : 'text-[var(--text-light)]'}`}>
                      {passwordChecks.hasLetters ? '✓' : '○'}
                    </span>
                    <span className={passwordChecks.hasLetters ? 'text-green-500' : 'text-[var(--text-light)]'}>
                      Латинские буквы
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <span className={`mr-2 ${passwordChecks.hasUpperCase ? 'text-green-500' : 'text-[var(--text-light)]'}`}>
                      {passwordChecks.hasUpperCase ? '✓' : '○'}
                    </span>
                    <span className={passwordChecks.hasUpperCase ? 'text-green-500' : 'text-[var(--text-light)]'}>
                      Заглавная буква
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <span className={`mr-2 ${passwordChecks.hasDigit ? 'text-green-500' : 'text-[var(--text-light)]'}`}>
                      {passwordChecks.hasDigit ? '✓' : '○'}
                    </span>
                    <span className={passwordChecks.hasDigit ? 'text-green-500' : 'text-[var(--text-light)]'}>
                      Цифра
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <span className={`mr-2 ${passwordChecks.hasSpecialChar ? 'text-green-500' : 'text-[var(--text-light)]'}`}>
                      {passwordChecks.hasSpecialChar ? '✓' : '○'}
                    </span>
                    <span className={passwordChecks.hasSpecialChar ? 'text-green-500' : 'text-[var(--text-light)]'}>
                      Спецсимвол (!@#$%^&*()_+=-)
                    </span>
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
            <button type="submit" className="btn-primary w-full">Зарегистрироваться</button>
          </form>
          <div className="mt-4 text-center">
            <button onClick={() => setShowRegister(false)} className="text-[var(--primary-color)]">
              Уже есть аккаунт? Войти
            </button>
          </div>
        </div>
      );
    };

    const BookingForm = ({ cellId, currentUser, onBookingSuccess, onCancel, preselectedPlan }) => {
      // Если был выбран тариф из Pricing, предзаполняем форму
      const getInitialVehicleType = () => {
        if (preselectedPlan) {
          const planName = preselectedPlan.name;
          if (planName === 'Легковой автомобиль') return 'Легковой автомобиль - 550₽';
          if (planName === 'Внедорожник') return 'Внедорожник - 700₽';
          if (planName === 'Комплект + диски') return 'Комплект + диски - 850₽';
        }
        return 'Легковой автомобиль - 550₽';
      };

      const [vehicleType, setVehicleType] = React.useState(getInitialVehicleType());
      const [startDate, setStartDate] = React.useState('');
      const [endDate, setEndDate] = React.useState('');
      const [error, setError] = React.useState('');
      const [loading, setLoading] = React.useState(false);

      const handleStartDateChange = (e) => {
        const newStartDate = e.target.value;
        setStartDate(newStartDate);
        
        // Если выбрана дата начала, автоматически устанавливаем минимальную дату окончания (через месяц)
        if (newStartDate) {
          const start = new Date(newStartDate);
          const minEndDate = new Date(start);
          minEndDate.setMonth(minEndDate.getMonth() + 1);
          
          // Если текущая дата окончания меньше минимальной, обновляем её
          if (!endDate || new Date(endDate) < minEndDate) {
            setEndDate(minEndDate.toISOString().split('T')[0]);
          }
        }
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        
        if (!startDate) {
          setError('Выберите дату начала бронирования');
          return;
        }

        if (!endDate) {
          setError('Выберите дату окончания бронирования');
          return;
        }

        // Проверяем, что дата окончания больше даты начала
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (end <= start) {
          setError('Дата окончания должна быть позже даты начала');
          return;
        }

        // Проверяем минимальный период (30 дней)
        const diffTime = end - start;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 30) {
          setError('Минимальный период бронирования - 30 дней (1 месяц)');
          return;
        }

        if (!currentUser || !window.StorageUtils) {
          setError('Ошибка: пользователь не авторизован');
          return;
        }

        setLoading(true);

        // Проверяем количество бронирований пользователя
        const userBookings = window.StorageUtils.getUserBookings(currentUser.email);
        if (userBookings.length >= 2) {
          setError('Вы уже забронировали максимальное количество ячеек (2)');
          setLoading(false);
          return;
        }

        // Сохраняем бронирование
        const bookingResult = window.StorageUtils.saveBooking({
          cellId: cellId,
          userEmail: currentUser.email,
          vehicleType: vehicleType,
          startDate: startDate,
          endDate: endDate
        });

        setLoading(false);

        if (bookingResult.success) {
          onBookingSuccess();
        } else {
          setError(bookingResult.error || 'Ошибка при бронировании');
        }
      };

      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <select 
            className="w-full px-4 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)] text-[var(--text-dark)]"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            required
          >
            <option value="Легковой автомобиль - 550₽">Легковой автомобиль - 550₽</option>
            <option value="Внедорожник - 700₽">Внедорожник - 700₽</option>
            <option value="Комплект + диски - 850₽">Комплект + диски - 850₽</option>
          </select>
          <div>
            <label className="block text-sm font-medium text-[var(--text-dark)] mb-2">Дата начала бронирования</label>
            <input 
              type="date" 
              className="w-full px-4 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)] text-[var(--text-dark)]" 
              value={startDate}
              onChange={handleStartDateChange}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-dark)] mb-2">Дата окончания бронирования</label>
            <input 
              type="date" 
              className="w-full px-4 py-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)] text-[var(--text-dark)]" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              min={startDate ? (() => {
                const start = new Date(startDate);
                const minEnd = new Date(start);
                minEnd.setMonth(minEnd.getMonth() + 1);
                return minEnd.toISOString().split('T')[0];
              })() : new Date().toISOString().split('T')[0]}
            />
            {startDate && endDate && (() => {
              const start = new Date(startDate);
              const end = new Date(endDate);
              const diffTime = end - start;
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const daysText = diffDays === 1 ? 'день' : diffDays < 5 ? 'дня' : 'дней';
              
              // Определяем цену за месяц в зависимости от номера ячейки
              let pricePerMonth = 550; // По умолчанию
              if (cellId >= 1 && cellId <= 20) {
                pricePerMonth = 550; // Легковой автомобиль
              } else if (cellId >= 21 && cellId <= 30) {
                pricePerMonth = 700; // Внедорожник
              } else if (cellId >= 31 && cellId <= 40) {
                pricePerMonth = 850; // Комплект + диски
              }
              
              // Рассчитываем цену: цена за месяц / 30 дней * количество дней
              const totalPrice = Math.round((pricePerMonth / 30) * diffDays);
              
              return (
                <div className="mt-1 space-y-1">
                  <p className="text-xs text-[var(--text-light)]">
                    Период: {diffDays} {daysText}
                    {diffDays < 30 && <span className="text-red-500 ml-1"> (минимум 30 дней)</span>}
                  </p>
                  <p className="text-xs font-semibold text-[var(--primary-color)]">
                    Цена: {totalPrice.toLocaleString('ru-RU')} руб
                  </p>
                </div>
              );
            })()}
          </div>
          <div className="flex gap-2">
            <button 
              type="submit" 
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading ? 'Сохранение...' : 'Забронировать'}
            </button>
            <button 
              type="button" 
              onClick={onCancel}
              className="px-4 py-3 border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-secondary)] bg-[var(--bg-primary)] text-[var(--text-dark)] transition-colors"
            >
              Отмена
            </button>
          </div>
        </form>
      );
    };

    const AdminDashboard = () => {
      const [activeTab, setActiveTab] = React.useState('bookings');
      const [users, setUsers] = React.useState([]);
      const [allBookings, setAllBookings] = React.useState([]);
      const [reviews, setReviews] = React.useState([]);
      const [contacts, setContacts] = React.useState([]);

      // Загрузка данных
      React.useEffect(() => {
        const loadData = async () => {
          if (window.StorageUtils) {
            // Загружаем актуальные данные из БД
            await window.StorageUtils.loadDatabase();
            const allUsers = window.StorageUtils.getUsers();
            setUsers(Object.values(allUsers));
            setAllBookings(window.StorageUtils.getBookings());
            // Загружаем все отзывы (включая pending) для модерации
            setReviews(window.StorageUtils.getReviews());
            setContacts(window.StorageUtils.getContactForms());
          }
        };
        loadData();
      }, []);

      const handleLogout = () => {
        if (window.StorageUtils) {
          window.StorageUtils.logoutUser();
        }
        setIsLoggedIn(false);
        setCurrentUser(null);
      };

      const handleApproveReview = async (reviewId) => {
        if (window.StorageUtils && window.StorageUtils.updateReviewStatus) {
          const result = await window.StorageUtils.updateReviewStatus(reviewId, 'approved');
          if (result.success) {
            // Обновляем список отзывов
            const allReviews = window.StorageUtils.getReviews();
            setReviews(allReviews);
            alert('Отзыв одобрен и опубликован');
          } else {
            alert('Ошибка при одобрении отзыва: ' + (result.error || 'Неизвестная ошибка'));
          }
        }
      };

      const handleRejectReview = async (reviewId) => {
        if (window.StorageUtils && window.StorageUtils.updateReviewStatus) {
          const result = await window.StorageUtils.updateReviewStatus(reviewId, 'rejected');
          if (result.success) {
            // Обновляем список отзывов
            const allReviews = window.StorageUtils.getReviews();
            setReviews(allReviews);
            alert('Отзыв отклонен');
          } else {
            alert('Ошибка при отклонении отзыва: ' + (result.error || 'Неизвестная ошибка'));
          }
        }
      };

      const handleCancelBooking = (bookingId) => {
        if (window.StorageUtils) {
          const booking = allBookings.find(b => b.id === bookingId);
          if (booking) {
            const result = window.StorageUtils.cancelBooking(bookingId, booking.userEmail);
            if (result.success) {
              setAllBookings(window.StorageUtils.getBookings());
            }
          }
        }
      };

      return (
        <div>
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-[var(--text-dark)]">Панель администратора</h2>
              {currentUser && (
                <p className="text-[var(--text-light)]">Добро пожаловать, {currentUser.name}!</p>
              )}
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-[var(--text-light)] hover:text-[var(--text-dark)] border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-secondary)] bg-[var(--bg-primary)] transition-colors"
            >
              Выйти
            </button>
          </div>

          {/* Вкладки */}
          <div className="flex space-x-2 mb-6 border-b border-[var(--border-color)] overflow-x-auto">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'bookings'
                  ? 'text-[var(--primary-color)] border-b-2 border-[var(--primary-color)]'
                  : 'text-[var(--text-light)] hover:text-[var(--text-dark)]'
              }`}
            >
              Бронирования ({allBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'users'
                  ? 'text-[var(--primary-color)] border-b-2 border-[var(--primary-color)]'
                  : 'text-[var(--text-light)] hover:text-[var(--text-dark)]'
              }`}
            >
              Пользователи ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'reviews'
                  ? 'text-[var(--primary-color)] border-b-2 border-[var(--primary-color)]'
                  : 'text-[var(--text-light)] hover:text-[var(--text-dark)]'
              }`}
            >
              Отзывы ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-4 py-2 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'contacts'
                  ? 'text-[var(--primary-color)] border-b-2 border-[var(--primary-color)]'
                  : 'text-[var(--text-light)] hover:text-[var(--text-dark)]'
              }`}
            >
              Заявки ({contacts.length})
            </button>
          </div>

          {/* Контент вкладок */}
          <div className="mt-6">
            {/* Вкладка: Бронирования */}
            {activeTab === 'bookings' && (
              <div>
                <h3 className="text-2xl font-bold mb-4 text-[var(--text-dark)]">Все бронирования</h3>
                {allBookings.length === 0 ? (
                  <p className="text-[var(--text-light)]">Бронирований пока нет</p>
                ) : (
                  <div className="space-y-4">
                    {allBookings.map(booking => (
                      <div key={booking.id} className="border border-[var(--border-color)] rounded-lg p-4 bg-[var(--bg-secondary)]">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-[var(--text-dark)]">Ячейка #{booking.cellId}</p>
                            <p className="text-sm text-[var(--text-light)] mt-1">Пользователь: {booking.userEmail}</p>
                            <p className="text-sm text-[var(--text-light)]">Тип: {booking.vehicleType}</p>
                            {booking.startDate && booking.endDate ? (
                              <p className="text-sm text-[var(--text-light)]">
                                Период: {new Date(booking.startDate).toLocaleDateString('ru-RU')} - {new Date(booking.endDate).toLocaleDateString('ru-RU')}
                              </p>
                            ) : (
                              <p className="text-sm text-[var(--text-light)]">
                                Дата: {new Date(booking.date || booking.startDate).toLocaleDateString('ru-RU')}
                              </p>
                            )}
                            <p className="text-sm text-[var(--text-light)]">
                              Статус: <span className={`font-semibold ${
                                booking.status === 'active' ? 'text-green-500' :
                                booking.status === 'cancelled' ? 'text-red-500' :
                                'text-gray-500'
                              }`}>
                                {booking.status === 'active' ? 'Активно' :
                                 booking.status === 'cancelled' ? 'Отменено' : 'Завершено'}
                              </span>
                            </p>
                            <p className="text-sm text-[var(--text-light)]">
                              Забронировано: {new Date(booking.bookedAt).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                          {booking.status === 'active' && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors ml-4"
                            >
                              Отменить
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Вкладка: Пользователи */}
            {activeTab === 'users' && (
              <div>
                <h3 className="text-2xl font-bold mb-4 text-[var(--text-dark)]">Все пользователи</h3>
                {users.length === 0 ? (
                  <p className="text-[var(--text-light)]">Пользователей пока нет</p>
                ) : (
                  <div className="space-y-4">
                    {users.map(user => (
                      <div key={user.email} className="border border-[var(--border-color)] rounded-lg p-4 bg-[var(--bg-secondary)]">
                        <div>
                          <p className="font-semibold text-[var(--text-dark)]">{user.name}</p>
                          <p className="text-sm text-[var(--text-light)] mt-1">Email: {user.email}</p>
                          <p className="text-sm text-[var(--text-light)]">Телефон: {user.phone || 'Не указан'}</p>
                          <p className="text-sm text-[var(--text-light)]">
                            Роль: <span className="font-semibold text-[var(--primary-color)]">
                              {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                            </span>
                          </p>
                          <p className="text-sm text-[var(--text-light)]">
                            Зарегистрирован: {new Date(user.registeredAt).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Вкладка: Отзывы */}
            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-2xl font-bold mb-4 text-[var(--text-dark)]">Все отзывы</h3>
                {reviews.length === 0 ? (
                  <p className="text-[var(--text-light)]">Отзывов пока нет</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map(review => (
                      <div key={review.id} className="border border-[var(--border-color)] rounded-lg p-4 bg-[var(--bg-secondary)]">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <p className="font-semibold text-[var(--text-dark)]">{review.name}</p>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <div
                                    key={star}
                                    className={`icon-star text-lg ${
                                      star <= (review.rating || 5) ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                  ></div>
                                ))}
                              </div>
                            </div>
                            <p className="text-[var(--text-dark)] mb-2">{review.text}</p>
                            <p className="text-sm text-[var(--text-light)]">Дата: {review.date}</p>
                            <p className="text-sm text-[var(--text-light)]">
                              Статус: <span className={`font-semibold ${
                                review.status === 'approved' ? 'text-green-500' :
                                review.status === 'rejected' ? 'text-red-500' :
                                'text-yellow-500'
                              }`}>
                                {review.status === 'approved' ? 'Одобрен' :
                                 review.status === 'rejected' ? 'Отклонен' : 'Ожидает модерации'}
                              </span>
                            </p>
                          </div>
                          {review.status === 'pending' && (
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => handleApproveReview(review.id)}
                                className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                              >
                                Одобрить
                              </button>
                              <button
                                onClick={() => handleRejectReview(review.id)}
                                className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                              >
                                Отклонить
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Вкладка: Заявки */}
            {activeTab === 'contacts' && (
              <div>
                <h3 className="text-2xl font-bold mb-4 text-[var(--text-dark)]">Контактные заявки</h3>
                {contacts.length === 0 ? (
                  <p className="text-[var(--text-light)]">Заявок пока нет</p>
                ) : (
                  <div className="space-y-4">
                    {contacts.map(contact => (
                      <div key={contact.id} className="border border-[var(--border-color)] rounded-lg p-4 bg-[var(--bg-secondary)]">
                        <div>
                          <p className="font-semibold text-[var(--text-dark)]">{contact.name}</p>
                          <p className="text-sm text-[var(--text-light)] mt-1">Телефон: {contact.phone}</p>
                          <p className="text-[var(--text-dark)] mt-2">{contact.comment}</p>
                          <p className="text-sm text-[var(--text-light)] mt-2">
                            Отправлено: {new Date(contact.submittedAt).toLocaleDateString('ru-RU')} {new Date(contact.submittedAt).toLocaleTimeString('ru-RU')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    };

    const Dashboard = () => {
      const [userBookings, setUserBookings] = React.useState([]);
      const [preselectedPlan, setPreselectedPlan] = React.useState(null);

      // Загружаем забронированные ячейки пользователя
      React.useEffect(() => {
        if (currentUser && window.StorageUtils) {
          const bookings = window.StorageUtils.getUserBookings(currentUser.email);
          setUserBookings(bookings);
        }
      }, [currentUser, cells]);

      // Проверяем, был ли выбран тариф из Pricing компонента
      React.useEffect(() => {
        const selectedPlanJson = localStorage.getItem('selectedPlan');
        if (selectedPlanJson) {
          try {
            const plan = JSON.parse(selectedPlanJson);
            setPreselectedPlan(plan);
            // Удаляем из localStorage после использования
            localStorage.removeItem('selectedPlan');
          } catch (error) {
            console.error('Error parsing selected plan:', error);
          }
        }
      }, []);

      const handleLogout = () => {
        if (window.StorageUtils) {
          window.StorageUtils.logoutUser();
        }
        setIsLoggedIn(false);
        setCurrentUser(null);
      };

      // Получаем ID забронированных ячеек пользователя
      const bookedCellIds = userBookings.map(b => b.cellId);

      return (
        <div>
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-[var(--text-dark)]">Личный кабинет</h2>
              {currentUser && (
                <p className="text-[var(--text-light)]">Добро пожаловать, {currentUser.name}!</p>
              )}
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-[var(--text-light)] hover:text-[var(--text-dark)] border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-secondary)] bg-[var(--bg-primary)] transition-colors"
            >
              Выйти
            </button>
          </div>

          {/* Показываем информацию о забронированных ячейках */}
          {userBookings.length > 0 && (
            <div className="card mb-8">
              <h3 className="text-xl font-bold mb-4 text-[var(--text-dark)]">Ваши забронированные ячейки</h3>
              <div className="space-y-3">
                {userBookings.map(booking => {
                  // Рассчитываем итоговую цену
                  let totalPrice = 0;
                  if (booking.startDate && booking.endDate) {
                    const start = new Date(booking.startDate);
                    const end = new Date(booking.endDate);
                    const diffTime = end - start;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    // Определяем цену за месяц в зависимости от номера ячейки
                    let pricePerMonth = 550; // По умолчанию
                    if (booking.cellId >= 1 && booking.cellId <= 20) {
                      pricePerMonth = 550; // Легковой автомобиль
                    } else if (booking.cellId >= 21 && booking.cellId <= 30) {
                      pricePerMonth = 700; // Внедорожник
                    } else if (booking.cellId >= 31 && booking.cellId <= 40) {
                      pricePerMonth = 850; // Комплект + диски
                    }
                    
                    // Рассчитываем итоговую цену: (цена за месяц / 30 дней) * количество дней
                    totalPrice = Math.round((pricePerMonth / 30) * diffDays);
                  }
                  
                  return (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-[var(--text-dark)]">Ячейка #{booking.cellId}</p>
                        <p className="text-sm text-[var(--text-light)] mt-1">{booking.vehicleType}</p>
                        {booking.startDate && booking.endDate ? (
                          <>
                            <p className="text-sm text-[var(--text-light)]">
                              Период: {new Date(booking.startDate).toLocaleDateString('ru-RU')} - {new Date(booking.endDate).toLocaleDateString('ru-RU')}
                            </p>
                            {totalPrice > 0 && (
                              <p className="text-sm font-semibold text-[var(--primary-color)] mt-1">
                                Цена: {totalPrice.toLocaleString('ru-RU')} руб
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-[var(--text-light)]">Дата: {new Date(booking.date || booking.startDate).toLocaleDateString('ru-RU')}</p>
                        )}
                        <p className="text-sm text-[var(--text-light)]">Забронировано: {new Date(booking.bookedAt).toLocaleDateString('ru-RU')}</p>
                      </div>
                      <button
                        onClick={() => {
                          if (window.StorageUtils && currentUser) {
                            const result = window.StorageUtils.cancelBooking(booking.id, currentUser.email);
                            if (result.success) {
                              updateCellsStatus();
                              setUserBookings(window.StorageUtils.getUserBookings(currentUser.email));
                            } else {
                              alert(result.error || 'Ошибка при отмене бронирования');
                            }
                          }
                        }}
                        className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                      >
                        Отменить
                        </button>
                      </div>
                    </div>
                  );
                })}
                </div>
            </div>
          )}

          {/* Показываем уведомление о выбранном тарифе */}
          {preselectedPlan && (
            <div className="bg-blue-100 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-6" style={{backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-dark)'}}>
              <p className="font-semibold text-[var(--text-dark)]">Выбран тариф: {preselectedPlan.name} - {preselectedPlan.price}₽</p>
              <p className="text-sm mt-1 text-[var(--text-dark)]">Выберите ячейку для бронирования</p>
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4 text-[var(--text-dark)]">Выберите ячейку для хранения</h3>
            <div className="flex gap-4 mb-4">
              <div className="flex items-center text-[var(--text-dark)]"><div className="w-4 h-4 bg-green-500 rounded mr-2"></div>Свободна</div>
              <div className="flex items-center text-[var(--text-dark)]"><div className="w-4 h-4 bg-[var(--secondary-color)] rounded mr-2"></div>Забронирована вами</div>
              <div className="flex items-center text-[var(--text-dark)]"><div className="w-4 h-4 bg-red-500 rounded mr-2"></div>Занята</div>
            </div>
          </div>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-8">
            {cells.map(cell => {
              const isUserBooked = bookedCellIds.includes(cell.id);
              const isSelected = selectedCell && selectedCell.id === cell.id;
              
              // Определяем тип и цену для ячейки
              let cellType = '';
              let cellPrice = '';
              if (cell.id >= 1 && cell.id <= 20) {
                cellType = 'Легковой автомобиль';
                cellPrice = '550';
              } else if (cell.id >= 21 && cell.id <= 30) {
                cellType = 'Внедорожник';
                cellPrice = '700';
              } else if (cell.id >= 31 && cell.id <= 40) {
                cellType = 'Комплект + диски';
                cellPrice = '850';
              }
              
              return (
                <div key={cell.id} className="flex flex-col items-center">
                  <button 
                    onClick={() => cell.status === 'available' && setSelectedCell(cell)}
                    className={`w-full aspect-square rounded-lg font-bold transition-all ${
                      isSelected ? 'ring-4 ring-white ring-offset-2 shadow-lg scale-105' : ''
                    } ${
                      cell.status === 'available' ? 'bg-green-500 hover:bg-green-600 text-white' :
                      isUserBooked ? 'bg-[var(--secondary-color)] text-white cursor-not-allowed' :
                      'bg-red-500 text-white cursor-not-allowed'
                    }`}
                    style={isSelected ? { 
                      boxShadow: '0 0 0 4px white, 0 0 0 6px rgba(59, 130, 246, 0.5)',
                      transform: 'scale(1.05)'
                    } : {}}
                    title={isUserBooked ? 'Забронирована вами' : cell.status === 'available' ? 'Свободна' : 'Занята'}
                  >
                    {cell.id}
                  </button>
                  {cellType && (
                    <div className="mt-1 text-center">
                      <p className="text-xs text-[var(--text-light)] leading-tight">{cellType}</p>
                      <p className="text-xs font-semibold text-[var(--primary-color)]">{cellPrice} руб/мес</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {selectedCell && (
            <div className="card">
              <h3 className="text-xl font-bold mb-4 text-[var(--text-dark)]">Бронирование ячейки #{selectedCell.id}</h3>
              <BookingForm 
                cellId={selectedCell.id} 
                currentUser={currentUser}
                preselectedPlan={preselectedPlan}
                onBookingSuccess={() => {
                  // Обновляем статусы всех ячеек после успешного бронирования
                  updateCellsStatus();
                  setSelectedCell(null);
                  setPreselectedPlan(null);
                  // Обновляем список бронирований
                  if (currentUser && window.StorageUtils) {
                    setUserBookings(window.StorageUtils.getUserBookings(currentUser.email));
                  }
                }}
                onCancel={() => setSelectedCell(null)}
              />
            </div>
          )}
        </div>
      );
    };

    // Проверяем, является ли пользователь администратором
    const isAdmin = currentUser && currentUser.role === 'admin';

    return (
      <div className="min-h-screen bg-[var(--bg-light)]">
        <Header />
        <section className="py-16">
          <div className="container mx-auto px-4">
            {!isLoggedIn ? (showRegister ? <RegisterForm /> : <LoginForm />) : (isAdmin ? <AdminDashboard /> : <Dashboard />)}
          </div>
        </section>
        <Footer />
      </div>
    );
  } catch (error) {
    console.error('CabinetPage error:', error);
    return null;
  }
}

