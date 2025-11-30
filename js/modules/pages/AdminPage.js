function AdminPage() {
  try {
    const [currentUser, setCurrentUser] = React.useState(() => {
      return window.StorageUtils ? window.StorageUtils.getCurrentUser() : null;
    });
    const [activeTab, setActiveTab] = React.useState('bookings');
    const [users, setUsers] = React.useState([]);
    const [bookings, setBookings] = React.useState([]);
    const [reviews, setReviews] = React.useState([]);
    const [contacts, setContacts] = React.useState([]);

    // Загрузка данных
    React.useEffect(() => {
      if (window.StorageUtils) {
        const allUsers = window.StorageUtils.getUsers();
        setUsers(Object.values(allUsers));
        setBookings(window.StorageUtils.getBookings());
        setReviews(window.StorageUtils.getReviews());
        setContacts(window.StorageUtils.getContactForms());
      }
    }, []);

    const handleLogout = () => {
      if (window.StorageUtils) {
        window.StorageUtils.logoutUser();
      }
      window.location.href = 'cabinet.html';
    };

    const handleApproveReview = (reviewId) => {
      if (window.StorageUtils) {
        const allReviews = window.StorageUtils.getReviews();
        const review = allReviews.find(r => r.id === reviewId);
        if (review) {
          review.status = 'approved';
          // Обновляем через сохранение всех отзывов
          const reviewsJson = JSON.stringify(allReviews);
          localStorage.setItem('eco_motor_reviews', reviewsJson);
          setReviews(allReviews);
        }
      }
    };

    const handleRejectReview = (reviewId) => {
      if (window.StorageUtils) {
        const allReviews = window.StorageUtils.getReviews();
        const review = allReviews.find(r => r.id === reviewId);
        if (review) {
          review.status = 'rejected';
          const reviewsJson = JSON.stringify(allReviews);
          localStorage.setItem('eco_motor_reviews', reviewsJson);
          setReviews(allReviews);
        }
      }
    };

    const handleCancelBooking = (bookingId) => {
      if (window.StorageUtils) {
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
          const result = window.StorageUtils.cancelBooking(bookingId, booking.userEmail);
          if (result.success) {
            setBookings(window.StorageUtils.getBookings());
          }
        }
      }
    };

    return (
      <div className="min-h-screen bg-[var(--bg-light)]">
        <Header />
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="card">
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
              <div className="flex space-x-2 mb-6 border-b border-[var(--border-color)]">
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`px-4 py-2 font-semibold transition-colors ${
                    activeTab === 'bookings'
                      ? 'text-[var(--primary-color)] border-b-2 border-[var(--primary-color)]'
                      : 'text-[var(--text-light)] hover:text-[var(--text-dark)]'
                  }`}
                >
                  Бронирования ({bookings.length})
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-4 py-2 font-semibold transition-colors ${
                    activeTab === 'users'
                      ? 'text-[var(--primary-color)] border-b-2 border-[var(--primary-color)]'
                      : 'text-[var(--text-light)] hover:text-[var(--text-dark)]'
                  }`}
                >
                  Пользователи ({users.length})
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`px-4 py-2 font-semibold transition-colors ${
                    activeTab === 'reviews'
                      ? 'text-[var(--primary-color)] border-b-2 border-[var(--primary-color)]'
                      : 'text-[var(--text-light)] hover:text-[var(--text-dark)]'
                  }`}
                >
                  Отзывы ({reviews.length})
                </button>
                <button
                  onClick={() => setActiveTab('contacts')}
                  className={`px-4 py-2 font-semibold transition-colors ${
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
                    {bookings.length === 0 ? (
                      <p className="text-[var(--text-light)]">Бронирований пока нет</p>
                    ) : (
                      <div className="space-y-4">
                        {bookings.map(booking => (
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
                                  className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
                            <div className="flex justify-between items-start">
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
          </div>
        </section>
        <Footer />
      </div>
    );
  } catch (error) {
    console.error('AdminPage error:', error);
    return null;
  }
}


