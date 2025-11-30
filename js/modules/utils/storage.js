// Утилиты для работы с JSON базой данных

// Путь к JSON файлу базы данных
const DB_PATH = 'database.json';

// Ключи для localStorage (используется как кэш)
const STORAGE_KEYS = {
  USERS: 'eco_motor_users',
  CURRENT_USER: 'eco_motor_current_user',
  SESSION: 'eco_motor_session',
  CONTACTS: 'eco_motor_contacts',
  BOOKINGS: 'eco_motor_bookings',
  REVIEWS: 'eco_motor_reviews',
  DB_CACHE: 'eco_motor_db_cache',
  DB_LAST_SYNC: 'eco_motor_db_last_sync'
};

// Глобальное хранилище данных (загружается из JSON)
let dbData = {
  users: {},
  bookings: [],
  reviews: [],
  contacts: [],
  sessions: {}
};

// Загрузка данных из JSON файла
async function loadDatabase() {
  try {
    const response = await fetch(DB_PATH + '?t=' + Date.now()); // Добавляем timestamp для обхода кэша
    if (response.ok) {
      const data = await response.json();
      
      // Загружаем данные из localStorage (могут содержать новых пользователей)
      const cachedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      const cachedBookings = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      const cachedReviews = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      const cachedContacts = localStorage.getItem(STORAGE_KEYS.CONTACTS);
      
      // Объединяем данные: приоритет у localStorage (новые пользователи), но добавляем из JSON то, чего нет
      const jsonUsers = data.users || {};
      const cachedUsersParsed = cachedUsers ? JSON.parse(cachedUsers) : {};
      
      // Объединяем пользователей: сначала из JSON, потом из localStorage (новые пользователи)
      const mergedUsers = { ...jsonUsers, ...cachedUsersParsed };
      
      dbData = {
        users: mergedUsers,
        bookings: cachedBookings ? JSON.parse(cachedBookings) : (data.bookings || []),
        reviews: cachedReviews ? JSON.parse(cachedReviews) : (data.reviews || []),
        contacts: cachedContacts ? JSON.parse(cachedContacts) : (data.contacts || []),
        sessions: data.sessions || {}
      };
      
      // Убеждаемся, что админ с правильным паролем всегда есть
      if (dbData.users && !dbData.users['admin@ya.ru']) {
        dbData.users['admin@ya.ru'] = {
          name: "Администратор",
          email: "admin@ya.ru",
          phone: "+7 (999) 999-99-99",
          password: "12345Q!!",
          role: "admin",
          registeredAt: "2024-01-01T00:00:00.000Z"
        };
      } else if (dbData.users && dbData.users['admin@ya.ru']) {
        // ПРИНУДИТЕЛЬНО обновляем пароль админа на правильный (всегда)
        dbData.users['admin@ya.ru'].password = "12345Q!!";
      }
      
      // Если users пустой, создаем админа
      if (!dbData.users || Object.keys(dbData.users).length === 0) {
        dbData.users = {
          'admin@ya.ru': {
            name: "Администратор",
            email: "admin@ya.ru",
            phone: "+7 (999) 999-99-99",
            password: "12345Q!!",
            role: "admin",
            registeredAt: "2024-01-01T00:00:00.000Z"
          }
        };
      }
      
      // Сохраняем объединенные данные обратно в localStorage
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(dbData.users));
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(dbData.bookings));
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(dbData.reviews));
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(dbData.contacts));
      localStorage.setItem(STORAGE_KEYS.DB_CACHE, JSON.stringify(dbData));
      localStorage.setItem(STORAGE_KEYS.DB_LAST_SYNC, new Date().toISOString());
      
      console.log('Database loaded from JSON and merged with localStorage:', dbData);
      console.log('Total users:', Object.keys(dbData.users).length);
      return true;
    } else {
      // Если файл не найден, используем данные из localStorage или создаем пустую БД
      const cached = localStorage.getItem(STORAGE_KEYS.DB_CACHE);
      if (cached) {
        dbData = JSON.parse(cached);
        console.log('Database loaded from cache:', dbData);
      } else {
        // Создаем пустую БД с админом
        dbData = {
          users: {
            'admin@ya.ru': {
              name: "Администратор",
              email: "admin@ya.ru",
              phone: "+7 (999) 999-99-99",
              password: "12345Q!!",
              role: "admin",
              registeredAt: "2024-01-01T00:00:00.000Z"
            }
          },
          bookings: [],
          reviews: [],
          contacts: [],
          sessions: {}
        };
        localStorage.setItem(STORAGE_KEYS.DB_CACHE, JSON.stringify(dbData));
      }
      return false;
    }
  } catch (error) {
    console.error('Error loading database:', error);
    // Используем кэш из localStorage, если есть
    const cached = localStorage.getItem(STORAGE_KEYS.DB_CACHE);
    if (cached) {
      dbData = JSON.parse(cached);
      console.log('Database loaded from cache (error):', dbData);
    } else {
      // Создаем пустую БД с админом
      dbData = {
        users: {
          'admin@ya.ru': {
            name: "Администратор",
            email: "admin@ya.ru",
            phone: "+7 (999) 999-99-99",
            password: "12345Q!!",
            role: "admin",
            registeredAt: "2024-01-01T00:00:00.000Z"
          }
        },
        bookings: [],
        reviews: [],
        contacts: [],
        sessions: {}
      };
      localStorage.setItem(STORAGE_KEYS.DB_CACHE, JSON.stringify(dbData));
    }
    return false;
  }
}

// Сохранение данных в JSON файл
async function saveDatabase(autoDownload = false) {
  try {
    // Обновляем dbData перед сохранением
    dbData.users = getUsers();
    dbData.bookings = getBookings();
    dbData.reviews = getReviews();
    dbData.contacts = getContactForms();
    
    // Сохраняем в localStorage (кэш)
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(dbData.users));
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(dbData.bookings));
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(dbData.reviews));
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(dbData.contacts));
    localStorage.setItem(STORAGE_KEYS.DB_CACHE, JSON.stringify(dbData));
    localStorage.setItem(STORAGE_KEYS.DB_LAST_SYNC, new Date().toISOString());
    
    // Для сохранения в JSON файл нужен серверный API endpoint
    // Пока используем localStorage, но можно добавить вызов API:
    // await fetch('/api/save-database', { method: 'POST', body: JSON.stringify(dbData) });
    
    // Создаем download ссылку для экспорта обновленного database.json
    const dataStr = JSON.stringify(dbData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'database.json';
    
    // Если autoDownload = true, автоматически скачиваем файл (для новых пользователей)
    if (autoDownload) {
      // Сохраняем ссылку в глобальной переменной для последующего использования
      if (typeof window !== 'undefined') {
        window._lastDatabaseDownloadUrl = url;
        window._lastDatabaseDownloadLink = link;
        
        // Автоматически скачиваем файл
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Очищаем URL через небольшую задержку
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 100);
      }
    } else {
      // Не вызываем автоматически, только при необходимости
      URL.revokeObjectURL(url);
    }
    
    console.log('Database saved to localStorage. Users count:', Object.keys(dbData.users).length);
    return true;
  } catch (error) {
    console.error('Error saving database:', error);
    return false;
  }
}

// Инициализация: загружаем данные при загрузке модуля
if (typeof window !== 'undefined') {
  // Загружаем данные при загрузке модуля
  loadDatabase();
  
  // Также загружаем данные при загрузке страницы (на случай, если модуль загрузился раньше)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadDatabase();
    });
  } else {
    loadDatabase();
  }
}

// Получение всех пользователей из БД
function getUsers() {
  try {
    // Всегда сначала пытаемся получить из dbData (актуальные данные из JSON)
    if (dbData && dbData.users && Object.keys(dbData.users).length > 0) {
      // ПРИНУДИТЕЛЬНО обновляем пароль админа на правильный
      if (dbData.users['admin@ya.ru']) {
        dbData.users['admin@ya.ru'].password = "12345Q!!";
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(dbData.users));
      }
      return dbData.users;
    }
    // Если dbData пустой, берем из localStorage
    const usersJson = localStorage.getItem(STORAGE_KEYS.USERS);
    const users = usersJson ? JSON.parse(usersJson) : {};
    
    // Убеждаемся, что админ всегда есть с правильным паролем
    if (!users['admin@ya.ru']) {
      users['admin@ya.ru'] = {
        name: "Администратор",
        email: "admin@ya.ru",
        phone: "+7 (999) 999-99-99",
        password: "12345Q!!",
        role: "admin",
        registeredAt: "2024-01-01T00:00:00.000Z"
      };
      dbData.users = users;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } else {
      // ПРИНУДИТЕЛЬНО обновляем пароль админа на правильный (всегда)
      users['admin@ya.ru'].password = "12345Q!!";
      dbData.users = users;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    
    // Обновляем dbData из localStorage
    if (users && Object.keys(users).length > 0) {
      dbData.users = users;
    }
    return users;
  } catch (error) {
    console.error('Error reading users:', error);
    return {};
  }
}

// Сохранение пользователей в БД
async function saveUsers(users, autoDownload = false) {
  try {
    // Обновляем dbData
    dbData.users = users;
    
    // Сохраняем в localStorage (это наш основной источник данных)
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // Обновляем кэш
    localStorage.setItem(STORAGE_KEYS.DB_CACHE, JSON.stringify(dbData));
    localStorage.setItem(STORAGE_KEYS.DB_LAST_SYNC, new Date().toISOString());
    
    // Сохраняем в database.json через saveDatabase
    // autoDownload = true для автоматического скачивания обновленного файла
    await saveDatabase(autoDownload);
    
    console.log('Users saved to database. Total users:', Object.keys(users).length);
    if (autoDownload) {
      console.log('Updated database.json file downloaded automatically');
    }
    return true;
  } catch (error) {
    console.error('Error saving users:', error);
    return false;
  }
}

// Регистрация нового пользователя
async function registerUser(userData) {
  // Загружаем актуальные данные из БД перед регистрацией
  await loadDatabase();
  
  const users = getUsers();
  const email = userData.email.toLowerCase().trim();
  
  // Проверка, существует ли пользователь с таким email
  if (users[email]) {
    return {
      success: false,
      error: 'Пользователь с таким email уже зарегистрирован'
    };
  }
  
  // Создаем нового пользователя
  const newUser = {
    name: userData.name.trim(),
    email: email,
    phone: userData.phone,
    password: userData.password,
    registeredAt: new Date().toISOString()
  };
  
  users[email] = newUser;
  
  // Сохраняем в БД с автоматическим скачиванием обновленного database.json
  const saved = await saveUsers(users, true); // true = автоматически скачать обновленный файл
  if (saved) {
    console.log('User registered and saved to database:', email);
    // Показываем уведомление пользователю
    if (typeof window !== 'undefined' && window.alert) {
      setTimeout(() => {
        alert('Пользователь зарегистрирован! Обновленный файл database.json был автоматически скачан. Пожалуйста, замените старый файл на сервере новым.');
      }, 500);
    }
    return {
      success: true,
      user: newUser
    };
  } else {
    return {
      success: false,
      error: 'Ошибка при сохранении данных'
    };
  }
}

// Авторизация пользователя
async function loginUser(email, password) {
  // Загружаем данные из JSON и объединяем с localStorage
  // Это гарантирует, что мы видим всех пользователей: и из database.json, и только что зарегистрированных
  await loadDatabase();
  
  // ПРИНУДИТЕЛЬНО обновляем пароль админа на правильный перед проверкой
  if (dbData && dbData.users && dbData.users['admin@ya.ru']) {
    dbData.users['admin@ya.ru'].password = "12345Q!!";
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(dbData.users));
  }
  
  // Получаем пользователей из dbData (который содержит объединенные данные из JSON и localStorage)
  const users = dbData && dbData.users ? dbData.users : getUsers();
  const emailLower = email.toLowerCase().trim();
  const passwordTrimmed = password.trim();
  
  const user = users[emailLower];
  
  if (!user) {
    console.log('User not found in database:', emailLower, 'Available users:', Object.keys(users));
    return {
      success: false,
      error: 'Пользователь с таким email не найден в базе данных. Пожалуйста, зарегистрируйтесь.'
    };
  }
  
  // Сравниваем пароли (учитываем возможные пробелы)
  const passwordMatch = user.password === passwordTrimmed;
  console.log('Password check:', { 
    stored: user.password, 
    entered: passwordTrimmed,
    storedLength: user.password?.length,
    enteredLength: passwordTrimmed?.length,
    match: passwordMatch
  });
  
  if (!passwordMatch) {
    return {
      success: false,
      error: 'Неверный пароль'
    };
  }
  
  // Создаем сессию
  const session = {
    email: emailLower,
    loginTime: new Date().toISOString()
  };
  
  try {
    dbData.sessions[emailLower] = session;
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    saveDatabase();
    return {
      success: true,
      user: user,
      session: session
    };
  } catch (error) {
    console.error('Error saving session:', error);
    return {
      success: false,
      error: 'Ошибка при создании сессии'
    };
  }
}

// Выход из системы
function logoutUser() {
  try {
    const currentUser = getCurrentUser();
    if (currentUser && dbData.sessions) {
      delete dbData.sessions[currentUser.email];
    }
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    saveDatabase();
    return true;
  } catch (error) {
    console.error('Error logging out:', error);
    return false;
  }
}

// Проверка, авторизован ли пользователь
function isUserLoggedIn() {
  try {
    const session = localStorage.getItem(STORAGE_KEYS.SESSION);
    const currentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return !!(session && currentUser);
  } catch (error) {
    console.error('Error checking session:', error);
    return false;
  }
}

// Получение текущего пользователя
function getCurrentUser() {
  try {
    const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Сохранение контактной формы
function saveContactForm(formData) {
  try {
    const contacts = getContactForms();
    
    const newContact = {
      name: formData.name.trim(),
      phone: formData.phone,
      comment: formData.comment.trim(),
      submittedAt: new Date().toISOString(),
      id: Date.now().toString()
    };
    
    contacts.push(newContact);
    
    // Сохраняем только последние 100 заявок
    const limitedContacts = contacts.slice(-100);
    
    dbData.contacts = limitedContacts;
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(limitedContacts));
    saveDatabase();
    
    return {
      success: true,
      contact: newContact
    };
  } catch (error) {
    console.error('Error saving contact form:', error);
    return {
      success: false,
      error: 'Ошибка при сохранении заявки'
    };
  }
}

// Получение всех контактных заявок
function getContactForms() {
  try {
    if (dbData && dbData.contacts) {
      return dbData.contacts;
    }
    const contactsJson = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    return contactsJson ? JSON.parse(contactsJson) : [];
  } catch (error) {
    console.error('Error reading contact forms:', error);
    return [];
  }
}

// Сохранение бронирования ячейки
function saveBooking(bookingData) {
  try {
    const bookings = getBookings();
    
    // Проверяем, не забронирована ли уже эта ячейка в выбранный период
    const newStartDate = bookingData.startDate ? new Date(bookingData.startDate) : null;
    const newEndDate = bookingData.endDate ? new Date(bookingData.endDate) : null;
    
    const conflictingBooking = bookings.find(b => {
      if (b.cellId !== bookingData.cellId || b.status !== 'active') {
        return false;
      }
      
      if (newStartDate && newEndDate) {
        const existingStartDate = b.startDate ? new Date(b.startDate) : (b.date ? new Date(b.date) : null);
        const existingEndDate = b.endDate ? new Date(b.endDate) : (b.date ? new Date(b.date) : null);
        
        if (existingStartDate && existingEndDate) {
          return (newStartDate <= existingEndDate && newEndDate >= existingStartDate);
        } else if (existingStartDate) {
          return (newStartDate <= existingStartDate && newEndDate >= existingStartDate);
        }
      }
      
      if (bookingData.date && !newStartDate) {
        const bookingDate = new Date(bookingData.date);
        const existingStartDate = b.startDate ? new Date(b.startDate) : (b.date ? new Date(b.date) : null);
        const existingEndDate = b.endDate ? new Date(b.endDate) : null;
        
        if (existingStartDate && existingEndDate) {
          return (bookingDate >= existingStartDate && bookingDate <= existingEndDate);
        } else if (existingStartDate) {
          return (bookingDate.getTime() === existingStartDate.getTime());
        }
      }
      
      return true;
    });
    
    if (conflictingBooking) {
      return {
        success: false,
        error: 'Эта ячейка уже забронирована на выбранный период'
      };
    }
    
    // Проверяем количество активных бронирований пользователя (не больше 2)
    const userBookings = bookings.filter(b => 
      b.userEmail === bookingData.userEmail && b.status === 'active'
    );
    
    if (userBookings.length >= 2) {
      return {
        success: false,
        error: 'Вы уже забронировали максимальное количество ячеек (2)'
      };
    }
    
    const newBooking = {
      id: Date.now().toString(),
      cellId: bookingData.cellId,
      userEmail: bookingData.userEmail,
      vehicleType: bookingData.vehicleType,
      startDate: bookingData.startDate || bookingData.date,
      endDate: bookingData.endDate || bookingData.date,
      date: bookingData.date || bookingData.startDate,
      status: 'active',
      bookedAt: new Date().toISOString()
    };
    
    bookings.push(newBooking);
    
    dbData.bookings = bookings;
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    saveDatabase();
    
    return {
      success: true,
      booking: newBooking
    };
  } catch (error) {
    console.error('Error saving booking:', error);
    return {
      success: false,
      error: 'Ошибка при сохранении бронирования'
    };
  }
}

// Получение всех бронирований
function getBookings() {
  try {
    if (dbData && dbData.bookings) {
      return dbData.bookings;
    }
    const bookingsJson = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return bookingsJson ? JSON.parse(bookingsJson) : [];
  } catch (error) {
    console.error('Error reading bookings:', error);
    return [];
  }
}

// Получение бронирований пользователя
function getUserBookings(userEmail) {
  try {
    const bookings = getBookings();
    return bookings.filter(b => b.userEmail === userEmail && b.status === 'active');
  } catch (error) {
    console.error('Error getting user bookings:', error);
    return [];
  }
}

// Отмена бронирования
function cancelBooking(bookingId, userEmail) {
  try {
    const bookings = getBookings();
    const booking = bookings.find(b => b.id === bookingId);
    
    if (!booking) {
      return {
        success: false,
        error: 'Бронирование не найдено'
      };
    }
    
    if (booking.userEmail !== userEmail) {
      return {
        success: false,
        error: 'Вы не можете отменить чужое бронирование'
      };
    }
    
    booking.status = 'cancelled';
    booking.cancelledAt = new Date().toISOString();
    
    dbData.bookings = bookings;
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    saveDatabase();
    
    return {
      success: true,
      booking: booking
    };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return {
      success: false,
      error: 'Ошибка при отмене бронирования'
    };
  }
}

// Сохранение отзыва
async function saveReview(reviewData) {
  try {
    const reviews = getReviews();
    
    const newReview = {
      name: reviewData.name.trim(),
      text: reviewData.text.trim(),
      date: new Date().toLocaleDateString('ru-RU'),
      rating: reviewData.rating || 5,
      submittedAt: new Date().toISOString(),
      id: Date.now().toString(),
      status: 'pending', // По умолчанию статус "на модерации"
      userEmail: reviewData.userEmail || null // Сохраняем email пользователя, если он авторизован
    };
    
    reviews.push(newReview);
    
    // Сохраняем только последние 200 отзывов
    const limitedReviews = reviews.slice(-200);
    
    dbData.reviews = limitedReviews;
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(limitedReviews));
    await saveDatabase(); // Асинхронно сохраняем в БД
    
    console.log('Review saved to database with status "pending":', newReview.id);
    return {
      success: true,
      review: newReview
    };
  } catch (error) {
    console.error('Error saving review:', error);
    return {
      success: false,
      error: 'Ошибка при сохранении отзыва'
    };
  }
}

// Получение всех отзывов
function getReviews() {
  try {
    if (dbData && dbData.reviews) {
      return dbData.reviews;
    }
    const reviewsJson = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    return reviewsJson ? JSON.parse(reviewsJson) : [];
  } catch (error) {
    console.error('Error reading reviews:', error);
    return [];
  }
}

// Получение одобренных отзывов (только для публикации)
function getApprovedReviews() {
  try {
    const reviews = getReviews();
    // Возвращаем только отзывы со статусом 'approved'
    // Старые отзывы без статуса тоже считаем одобренными (для обратной совместимости)
    return reviews.filter(r => r.status === 'approved' || (!r.status && r.submittedAt));
  } catch (error) {
    console.error('Error getting approved reviews:', error);
    return [];
  }
}

// Обновление статуса отзыва (для модерации)
async function updateReviewStatus(reviewId, status) {
  try {
    const reviews = getReviews();
    const review = reviews.find(r => r.id === reviewId);
    
    if (!review) {
      return {
        success: false,
        error: 'Отзыв не найден'
      };
    }
    
    review.status = status; // 'approved' или 'rejected'
    if (status === 'approved') {
      review.approvedAt = new Date().toISOString();
    } else if (status === 'rejected') {
      review.rejectedAt = new Date().toISOString();
    }
    
    dbData.reviews = reviews;
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    await saveDatabase();
    
    console.log(`Review ${reviewId} status updated to "${status}"`);
    return {
      success: true,
      review: review
    };
  } catch (error) {
    console.error('Error updating review status:', error);
    return {
      success: false,
      error: 'Ошибка при обновлении статуса отзыва'
    };
  }
}

// Функция для принудительной синхронизации данных из JSON (для отладки)
function forceSyncFromJSON() {
  return loadDatabase();
}

// Экспорт функций
if (typeof window !== 'undefined') {
  window.StorageUtils = {
    loadDatabase,
    saveDatabase,
    forceSyncFromJSON,
    registerUser,
    loginUser,
    logoutUser,
    isUserLoggedIn,
    getCurrentUser,
    getUsers,
    saveContactForm,
    getContactForms,
    saveBooking,
    getBookings,
    getUserBookings,
    cancelBooking,
    saveReview,
    getReviews,
    getApprovedReviews,
    updateReviewStatus
  };
  
  // Принудительно загружаем данные при каждом обращении к loginUser
  const originalLoginUser = window.StorageUtils.loginUser;
  window.StorageUtils.loginUser = async function(email, password) {
    // Всегда загружаем данные из JSON перед входом
    await loadDatabase();
    return originalLoginUser(email, password);
  };
}
