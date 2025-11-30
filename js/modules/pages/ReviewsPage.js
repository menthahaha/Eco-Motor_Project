function ReviewsPage() {
  try {
    const [reviewText, setReviewText] = React.useState('');
    const [reviewName, setReviewName] = React.useState('');
    const [reviewRating, setReviewRating] = React.useState(5);
    const [submitted, setSubmitted] = React.useState(false);
    const [errors, setErrors] = React.useState({ name: '', comment: '' });
    const [isLoggedIn, setIsLoggedIn] = React.useState(() => {
      return window.StorageUtils ? window.StorageUtils.isUserLoggedIn() : false;
    });
    const [currentUser, setCurrentUser] = React.useState(() => {
      return window.StorageUtils ? window.StorageUtils.getCurrentUser() : null;
    });
    const [reviews, setReviews] = React.useState([]);

    // Статические отзывы по умолчанию
    const defaultReviews = [
      { name: 'Иван Петров', date: '15.10.2024', rating: 5, text: 'Отличный сервис! Хранил колеса весь сезон, все в идеальном состоянии. Удобное бронирование через личный кабинет.' },
      { name: 'Мария Сидорова', date: '08.09.2024', rating: 5, text: 'Профессиональный подход к делу. Качественный ремонт по разумной цене. Рекомендую!' },
      { name: 'Александр К.', date: '22.08.2024', rating: 5, text: 'Пользуюсь услугами хранения колес второй год. Всё на высшем уровне, персонал вежливый.' },
      { name: 'Елена Васильева', date: '10.07.2024', rating: 4, text: 'Хороший автосервис, быстро отремонтировали. Единственное - иногда нужно записываться заранее.' }
    ];

    // Загрузка одобренных отзывов из БД
    React.useEffect(() => {
      if (window.StorageUtils) {
        // Загружаем только одобренные отзывы
        const approvedReviews = window.StorageUtils.getApprovedReviews();
        // Преобразуем одобренные отзывы в нужный формат
        const formattedApprovedReviews = approvedReviews.map(review => ({
          name: review.name,
          date: review.date,
          rating: review.rating || 5,
          text: review.text
        }));
        
        // Если есть одобренные отзывы, показываем их, иначе показываем статические
        if (formattedApprovedReviews.length > 0) {
          setReviews(formattedApprovedReviews);
        } else {
          // Если нет одобренных отзывов, показываем статические (для обратной совместимости)
          setReviews(defaultReviews);
        }
      } else {
        setReviews(defaultReviews);
      }
    }, []);

    // Подстановка имени пользователя при первой загрузке
    React.useEffect(() => {
      if (isLoggedIn && currentUser && !reviewName) {
        setReviewName(currentUser.name || '');
      }
    }, [isLoggedIn, currentUser]);

    // Проверка авторизации при загрузке и отслеживание изменений
    React.useEffect(() => {
      const checkAuth = () => {
        if (window.StorageUtils) {
          const loggedIn = window.StorageUtils.isUserLoggedIn();
          const user = window.StorageUtils.getCurrentUser();
          setIsLoggedIn(loggedIn);
          setCurrentUser(user);
        }
      };

      checkAuth();
      
      // Проверяем авторизацию каждую секунду (на случай, если пользователь войдет в другой вкладке)
      const interval = setInterval(checkAuth, 1000);
      
      // Также слушаем события storage для синхронизации между вкладками
      window.addEventListener('storage', checkAuth);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('storage', checkAuth);
      };
    }, []);


    const handleNameChange = (e) => {
      let value = e.target.value;
      
      // Фильтруем недопустимые символы (только буквы и пробелы)
      value = window.ValidationUtils ? window.ValidationUtils.filterNameInput(value) : value.replace(/[^а-яА-ЯёЁa-zA-Z\s]/g, '');
      
      setReviewName(value);
      
      // Валидация в реальном времени
      if (value.length > 0) {
        const validationResult = window.ValidationUtils ? window.ValidationUtils.validateName(value) : { valid: true, error: '' };
        setErrors({...errors, name: validationResult.valid ? '' : validationResult.error});
      } else {
        setErrors({...errors, name: ''});
      }
    };

    const handleCommentChange = (e) => {
      const value = e.target.value;
      setReviewText(value);
      
      // Валидация в реальном времени
      if (value.length === 0) {
        setErrors({...errors, comment: 'Комментарий обязателен для заполнения'});
      } else if (value.length < 20) {
        setErrors({...errors, comment: `Минимум 20 символов. Осталось: ${20 - value.length}`});
      } else {
        setErrors({...errors, comment: ''});
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      // Валидация имени
      const nameValidation = window.ValidationUtils ? window.ValidationUtils.validateName(reviewName) : { valid: reviewName.trim().length >= 2, error: '' };
      if (!nameValidation.valid) {
        setErrors({...errors, name: nameValidation.error || 'Введите корректное имя'});
        return;
      }
      
      // Валидация комментария
      const commentTrimmed = reviewText.trim();
      if (commentTrimmed.length === 0) {
        setErrors({...errors, comment: 'Комментарий обязателен для заполнения'});
        return;
      }
      if (commentTrimmed.length < 20) {
        setErrors({...errors, comment: `Минимум 20 символов. Осталось: ${20 - commentTrimmed.length}`});
        return;
      }
      
      // Сохранение отзыва в БД
      if (window.StorageUtils) {
        const saveResult = await window.StorageUtils.saveReview({
          name: reviewName.trim(),
          text: commentTrimmed,
          rating: reviewRating,
          userEmail: currentUser ? currentUser.email : null // Сохраняем email пользователя, если он авторизован
        });
        
        if (saveResult.success) {
          console.log('Review saved to database with status "pending":', saveResult.review);
        } else {
          console.error('Error saving review:', saveResult.error);
          setErrors({...errors, comment: saveResult.error || 'Ошибка при сохранении отзыва'});
          return;
        }
      } else {
        console.log('Review submitted:', { reviewName: reviewName.trim(), reviewText: commentTrimmed });
      }
      
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setReviewText('');
        setReviewName('');
        setReviewRating(5);
        setErrors({ name: '', comment: '' });
      }, 3000);
    };

    return (
      <div className="min-h-screen">
        <Header />
        
        <section className="py-16 bg-gradient-to-br from-[var(--primary-color)] to-blue-800 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Отзывы клиентов</h1>
            <p className="text-xl text-blue-100">Что говорят о нас наши клиенты</p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {reviews.map((review, idx) => (
                <div key={idx} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{review.name}</h3>
                      <p className="text-sm text-gray-500">{review.date}</p>
                    </div>
                    <div className="flex">
                      {[...Array(review.rating)].map((_, i) => (
                        <div key={i} className="icon-star text-yellow-400 text-xl"></div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[var(--text-light)]">{review.text}</p>
                </div>
              ))}
            </div>

            <div className="max-w-2xl mx-auto card">
              <h2 className="text-2xl font-bold mb-6">Оставить отзыв</h2>
              {!isLoggedIn ? (
                <div className="text-center py-8">
                  <div className="icon-lock text-6xl text-gray-400 mb-4"></div>
                  <p className="text-xl font-semibold mb-4">Для оставления отзыва необходимо авторизоваться</p>
                  <p className="text-gray-600 mb-6">Войдите в личный кабинет, чтобы оставить отзыв</p>
                  <a href="cabinet.html" className="inline-block px-6 py-3 bg-[var(--secondary-color)] text-white rounded-full font-semibold hover:opacity-90">
                    Войти в личный кабинет
                  </a>
                </div>
              ) : submitted ? (
                <div className="text-center py-8">
                  <div className="icon-check-circle text-6xl text-green-500 mb-4"></div>
                  <p className="text-xl font-semibold mb-2">Спасибо за ваш отзыв!</p>
                  <p className="text-[var(--text-light)]">Он появится в разделе после проверки модератором.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Ваше имя"
                      required
                      value={reviewName}
                      onChange={handleNameChange}
                      className={`w-full px-4 py-3 bg-[var(--bg-primary)] text-[var(--text-dark)] border border-[var(--border-color)] rounded-xl ${errors.name ? 'border-red-500' : ''}`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-2 text-[var(--text-dark)] font-semibold">Оценка</label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="focus:outline-none transition-transform hover:scale-110"
                          aria-label={`Оценить ${star} звезд`}
                        >
                          <div className={`icon-star text-3xl ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}`}></div>
                        </button>
                      ))}
                      <span className="ml-2 text-[var(--text-light)]">({reviewRating} из 5)</span>
                    </div>
                  </div>
                  <div>
                    <textarea
                      placeholder="Ваш отзыв"
                      rows="5"
                      required
                      value={reviewText}
                      onChange={handleCommentChange}
                      minLength="20"
                      className={`w-full px-4 py-3 bg-[var(--bg-primary)] text-[var(--text-dark)] border border-[var(--border-color)] rounded-xl ${errors.comment ? 'border-red-500' : ''}`}
                    ></textarea>
                    <div className="flex justify-between items-center mt-1">
                      <div className="flex-1">
                        {errors.comment && (
                          <p className="text-red-500 text-sm">{errors.comment}</p>
                        )}
                      </div>
                      <p className={`text-sm font-semibold ${reviewText.length < 20 ? 'text-gray-400' : 'text-green-500'}`}>
                        {reviewText.length}/20
                      </p>
                    </div>
                  </div>
                  <button type="submit" className="px-6 py-3 bg-[var(--secondary-color)] text-white rounded-full font-semibold hover:opacity-90">
                    Отправить отзыв
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    );
  } catch (error) {
    console.error('ReviewsPage error:', error);
    return null;
  }
}

