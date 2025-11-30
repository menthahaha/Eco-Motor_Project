function Pricing() {
  try {
    const [isLoggedIn, setIsLoggedIn] = React.useState(() => {
      return window.StorageUtils ? window.StorageUtils.isUserLoggedIn() : false;
    });

    const plans = [
      { name: 'Легковой автомобиль', price: '550', period: 'за месяц', features: ['4 колеса R13-R16', 'Стандартная ячейка', 'Базовый уход'] },
      { name: 'Внедорожник', price: '700', period: 'за месяц', features: ['4 колеса R17-R20', 'Увеличенная ячейка', 'Мойка при приеме'], popular: true },
      { name: 'Комплект + диски', price: '850', period: 'за месяц', features: ['Колеса на дисках', 'Premium ячейка', 'Полный сервис'] }
    ];

    // Проверка авторизации при загрузке и отслеживание изменений
    React.useEffect(() => {
      const checkAuth = () => {
        if (window.StorageUtils) {
          const loggedIn = window.StorageUtils.isUserLoggedIn();
          setIsLoggedIn(loggedIn);
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

    const handleSelectPlan = (planName) => {
      if (!isLoggedIn) {
        // Если не авторизован, переходим в личный кабинет для входа
        window.location.href = 'cabinet.html';
        return;
      }
      
      // Сохраняем выбранный тариф в localStorage для использования в личном кабинете
      const selectedPlan = plans.find(p => p.name === planName);
      if (selectedPlan) {
        localStorage.setItem('selectedPlan', JSON.stringify(selectedPlan));
      }
      
      // Переходим в личный кабинет
      window.location.href = 'cabinet.html';
    };

    return (
      <section id="pricing" className="py-16" data-name="pricing" data-file="components/Pricing.js">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Тарифы</h2>
          <p className="text-center text-[var(--text-light)] mb-12">Выберите подходящий тариф для хранения ваших колес</p>
          {!isLoggedIn && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6 text-center">
              Для выбора тарифа необходимо <a href="cabinet.html" className="underline font-semibold">войти в личный кабинет</a>
            </div>
          )}
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, idx) => (
              <div key={idx} className={`card relative ${plan.popular ? 'border-2' : ''}`} style={plan.popular ? { borderColor: '#f59e0b' } : {}}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[var(--secondary-color)] text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Популярный
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-[var(--primary-color)]">{plan.price}₽</span>
                  <span className="text-[var(--text-light)]"> {plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <div className="icon-check text-green-500"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {isLoggedIn ? (
                  <button 
                    onClick={() => handleSelectPlan(plan.name)}
                    className={plan.popular ? 'btn-primary w-full text-center block' : 'btn-secondary w-full text-center block'}
                  >
                    Выбрать
                  </button>
                ) : (
                  <a 
                    href="cabinet.html" 
                    className={`${plan.popular ? 'btn-primary' : 'btn-secondary'} w-full text-center block opacity-50 cursor-not-allowed`}
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = 'cabinet.html';
                    }}
                  >
                    Войти для выбора
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error('Pricing component error:', error);
    return null;
  }
}

