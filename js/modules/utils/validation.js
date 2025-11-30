// Утилиты для валидации и форматирования полей ввода

// Форматирование телефона в формат +7 (___) ___-__-__
function formatPhoneNumber(value) {
  // Удаляем все нецифровые символы
  const numbers = value.replace(/\D/g, '');
  
  // Если начинается с 8, заменяем на 7
  let formatted = numbers.startsWith('8') ? '7' + numbers.slice(1) : numbers;
  
  // Если начинается не с 7, добавляем 7
  if (formatted && !formatted.startsWith('7')) {
    formatted = '7' + formatted;
  }
  
  // Ограничиваем до 11 цифр (7 + 10)
  formatted = formatted.slice(0, 11);
  
  // Форматируем в +7 (___) ___-__-__
  if (formatted.length === 0) {
    return '';
  } else if (formatted.length <= 1) {
    return '+7';
  } else if (formatted.length <= 4) {
    return `+7 (${formatted.slice(1)}`;
  } else if (formatted.length <= 7) {
    return `+7 (${formatted.slice(1, 4)}) ${formatted.slice(4)}`;
  } else if (formatted.length <= 9) {
    return `+7 (${formatted.slice(1, 4)}) ${formatted.slice(4, 7)}-${formatted.slice(7)}`;
  } else {
    return `+7 (${formatted.slice(1, 4)}) ${formatted.slice(4, 7)}-${formatted.slice(7, 9)}-${formatted.slice(9, 11)}`;
  }
}

// Валидация телефона
function validatePhone(phone) {
  const numbers = phone.replace(/\D/g, '');
  // Проверяем, что номер начинается с 7 и содержит 11 цифр
  return numbers.startsWith('7') && numbers.length === 11;
}

// Получение чистого номера телефона (только цифры)
function getCleanPhone(phone) {
  return phone.replace(/\D/g, '');
}

// Валидация email с детальными проверками
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email обязателен для заполнения' };
  }

  const trimmedEmail = email.trim();
  
  // Проверка на наличие @
  if (!trimmedEmail.includes('@')) {
    return { valid: false, error: 'Email должен содержать символ @' };
  }

  const parts = trimmedEmail.split('@');
  
  // Должно быть ровно 2 части (локальная часть и домен)
  if (parts.length !== 2) {
    return { valid: false, error: 'Некорректный формат email' };
  }

  const [localPart, domain] = parts;

  // 1. Проверка на двойные точки
  if (localPart.includes('..') || domain.includes('..')) {
    return { valid: false, error: 'Email не должен содержать двойные точки' };
  }

  // 2. Локальная часть не длиннее 64 символов
  if (localPart.length > 64) {
    return { valid: false, error: 'Локальная часть email не должна превышать 64 символа' };
  }

  // 3. Локальная часть не может быть пустой
  if (localPart.length === 0) {
    return { valid: false, error: 'Локальная часть email не может быть пустой' };
  }

  // 4. Проверка на латинские буквы, цифры и разрешенные символы в локальной части
  // Разрешенные символы: a-z, A-Z, 0-9, ., _, -, +
  const localPartRegex = /^[a-zA-Z0-9._+-]+$/;
  if (!localPartRegex.test(localPart)) {
    return { valid: false, error: 'Локальная часть email должна содержать только латинские буквы, цифры и символы . _ - +' };
  }

  // 5. Локальная часть не может начинаться или заканчиваться точкой
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return { valid: false, error: 'Локальная часть не может начинаться или заканчиваться точкой' };
  }

  // 6. Домен не может быть пустым
  if (domain.length === 0) {
    return { valid: false, error: 'Домен email не может быть пустым' };
  }

  // 7. Домен должен содержать минимум 1 точку
  if (!domain.includes('.')) {
    return { valid: false, error: 'Домен должен содержать минимум одну точку' };
  }

  // 8. Домены содержат только буквы/цифры/дефисы и точки
  const domainParts = domain.split('.');
  const domainRegex = /^[a-zA-Z0-9-]+$/;
  
  for (let i = 0; i < domainParts.length; i++) {
    const part = domainParts[i];
    
    // Каждая часть домена не может быть пустой
    if (part.length === 0) {
      return { valid: false, error: 'Части домена не могут быть пустыми' };
    }
    
    // Каждая часть домена должна содержать только латинские буквы, цифры и дефисы
    if (!domainRegex.test(part)) {
      return { valid: false, error: 'Домен должен содержать только латинские буквы, цифры, дефисы и точки' };
    }
    
    // Части домена не могут начинаться или заканчиваться дефисом
    if (part.startsWith('-') || part.endsWith('-')) {
      return { valid: false, error: 'Части домена не могут начинаться или заканчиваться дефисом' };
    }
  }

  // 9. Последняя часть домена (TLD) должна быть минимум 2 символа
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) {
    return { valid: false, error: 'Домен верхнего уровня должен содержать минимум 2 символа' };
  }

  // 10. TLD должен содержать только буквы
  const tldRegex = /^[a-zA-Z]+$/;
  if (!tldRegex.test(tld)) {
    return { valid: false, error: 'Домен верхнего уровня должен содержать только буквы' };
  }

  return { valid: true, error: '' };
}

// Упрощенная функция для обратной совместимости (возвращает только true/false)
function validateEmailSimple(email) {
  const result = validateEmail(email);
  return result.valid;
}

// Валидация имени (только буквы и пробелы)
function validateName(name) {
  if (!name || typeof name !== 'string') {
    return { 
      valid: false, 
      error: 'Имя обязателено для заполнения' 
    };
  }

  const trimmedName = name.trim();
  
  // Проверка на пустое имя
  if (trimmedName.length === 0) {
    return { 
      valid: false, 
      error: 'Имя не может быть пустым' 
    };
  }

  // Проверка на минимальную длину (хотя бы 2 символа)
  if (trimmedName.length < 2) {
    return { 
      valid: false, 
      error: 'Имя должно содержать минимум 2 символа' 
    };
  }

  // Проверка на максимальную длину (например, 50 символов)
  if (trimmedName.length > 50) {
    return { 
      valid: false, 
      error: 'Имя не должно превышать 50 символов' 
    };
  }

  // Проверка на только буквы и пробелы (поддерживаем кириллицу и латиницу)
  // Разрешаем: русские буквы (а-я, А-Я, ё, Ё), латинские буквы (a-z, A-Z), пробелы
  const nameRegex = /^[а-яА-ЯёЁa-zA-Z\s]+$/;
  if (!nameRegex.test(trimmedName)) {
    return { 
      valid: false, 
      error: 'Имя должно содержать только буквы и пробелы' 
    };
  }

  // Проверка на двойные пробелы
  if (trimmedName.includes('  ')) {
    return { 
      valid: false, 
      error: 'Имя не должно содержать двойные пробелы' 
    };
  }

  // Имя не должно начинаться или заканчиваться пробелом (уже проверено через trim, но для надежности)
  if (name !== trimmedName) {
    return { 
      valid: false, 
      error: 'Имя не должно начинаться или заканчиваться пробелом' 
    };
  }

  return { 
    valid: true, 
    error: '' 
  };
}

// Функция для фильтрации ввода имени (только буквы и пробелы)
function filterNameInput(value) {
  // Разрешаем: русские буквы (а-я, А-Я, ё, Ё), латинские буквы (a-z, A-Z), пробелы
  return value.replace(/[^а-яА-ЯёЁa-zA-Z\s]/g, '');
}

// Валидация пароля с детальными проверками
function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { 
      valid: false, 
      error: 'Пароль обязателен для заполнения',
      checks: {
        length: false,
        hasLetters: false,
        hasUpperCase: false,
        hasDigit: false,
        hasSpecialChar: false
      }
    };
  }

  const checks = {
    length: password.length >= 8,
    hasLetters: /[a-zA-Z]/.test(password),
    hasUpperCase: /[A-Z]/.test(password),
    hasDigit: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+=\-]/.test(password)
  };

  const allValid = Object.values(checks).every(check => check === true);

  if (!allValid) {
    const missing = [];
    if (!checks.length) missing.push('минимум 8 символов');
    if (!checks.hasLetters) missing.push('латинские буквы');
    if (!checks.hasUpperCase) missing.push('заглавная буква');
    if (!checks.hasDigit) missing.push('цифра');
    if (!checks.hasSpecialChar) missing.push('спецсимвол (!@#$%^&*()_+=-)');

    return {
      valid: false,
      error: `Пароль должен содержать: ${missing.join(', ')}`,
      checks: checks
    };
  }

  return {
    valid: true,
    error: '',
    checks: checks
  };
}

// Автозаполнение домена email (если пользователь ввел только имя до @)
function suggestEmailDomain(input) {
  const commonDomains = ['gmail.com', 'mail.ru', 'yandex.ru', 'outlook.com', 'yahoo.com'];
  const parts = input.split('@');
  
  if (parts.length === 2 && parts[1].length > 0) {
    // Пользователь уже ввел домен
    return input;
  }
  
  if (parts.length === 1 && parts[0].length > 0) {
    // Предлагаем первый популярный домен
    return `${parts[0]}@${commonDomains[0]}`;
  }
  
  return input;
}

// Обработчик ввода телефона с автоматическим форматированием
function handlePhoneInput(e, setValue) {
  const input = e.target;
  const cursorPosition = input.selectionStart;
  const oldValue = input.value;
  const newValue = formatPhoneNumber(e.target.value);
  
  setValue(newValue);
  
  // Восстанавливаем позицию курсора с учетом форматирования
  setTimeout(() => {
    // Подсчитываем количество цифр до курсора в старом значении
    const digitsBeforeCursor = oldValue.slice(0, cursorPosition).replace(/\D/g, '').length;
    
    // Находим позицию в новом значении, где находится та же цифра
    let newPosition = 0;
    let digitCount = 0;
    
    for (let i = 0; i < newValue.length; i++) {
      if (/\d/.test(newValue[i])) {
        digitCount++;
        if (digitCount > digitsBeforeCursor) {
          newPosition = i;
          break;
        }
      }
      if (digitCount === digitsBeforeCursor) {
        newPosition = i + 1;
      }
    }
    
    // Если курсор был в конце, ставим его в конец
    if (cursorPosition >= oldValue.length) {
      newPosition = newValue.length;
    }
    
    input.setSelectionRange(newPosition, newPosition);
  }, 0);
}

// Обработчик ввода email с автодополнением
function handleEmailInput(e, setValue, setSuggestions) {
  const value = e.target.value;
  setValue(value);
  
  if (value.includes('@')) {
    setSuggestions([]);
    return;
  }
  
  // Если пользователь ввел часть email, предлагаем домены
  if (value.length > 0 && !value.includes('@')) {
    const commonDomains = ['gmail.com', 'mail.ru', 'yandex.ru', 'outlook.com', 'yahoo.com'];
    const suggestions = commonDomains.map(domain => `${value}@${domain}`);
    setSuggestions(suggestions);
  } else {
    setSuggestions([]);
  }
}

// Экспорт функций
if (typeof window !== 'undefined') {
  window.ValidationUtils = {
    formatPhoneNumber,
    validatePhone,
    getCleanPhone,
    validateEmail,
    validateEmailSimple,
    validatePassword,
    validateName,
    filterNameInput,
    suggestEmailDomain,
    handlePhoneInput,
    handleEmailInput
  };
}

