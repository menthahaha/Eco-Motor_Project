function ServicesPage() {
  try {
    const services = [
      {
        id: 'repair',
        icon: 'wrench',
        title: 'Слесарный ремонт',
        desc: 'Ремонт двигателей, коробок передач, электрооборудования',
        items: ['Ремонт двигателя', 'Ремонт КПП', 'Ремонт электрооборудования', 'Замена масла', 'Диагностика']
      },
      {
        id: 'body',
        icon: 'car',
        title: 'Кузовной ремонт',
        desc: 'Кузовной ремонт любой сложности, покраска',
        items: ['Покраска кузова', 'Ремонт вмятин', 'Стапельные работы', 'Полировка', 'Антикоррозийная обработка']
      },
      {
        id: 'inspection',
        icon: 'clipboard-check',
        title: 'Техосмотр',
        desc: 'Государственный технический осмотр с выдачей диагностических карт',
        items: ['Диагностическая карта', 'Проверка безопасности', 'Проверка выхлопа', 'Тормозная система', 'Световые приборы']
      },
      {
        id: 'storage',
        icon: 'package',
        title: 'Хранение колес',
        desc: 'Сезонное хранение в специализированных ячейках',
        items: ['Безопасное хранение', 'Онлайн-бронирование', 'Контроль условий', 'Удобный доступ', 'Мойка колес']
      }
    ];

    return (
      <div className="min-h-screen">
        <Header />
        
        <section className="py-16 bg-gradient-to-br from-[var(--primary-color)] to-blue-800 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Наши услуги</h1>
            <p className="text-xl text-blue-100">Полный спектр услуг для вашего автомобиля</p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8">
              {services.map((service) => (
                <div key={service.id} className="card">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <div className={`icon-${service.icon} text-3xl text-[var(--primary-color)]`}></div>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{service.title}</h2>
                  <p className="text-[var(--text-light)] mb-4">{service.desc}</p>
                  <ul className="space-y-2">
                    {service.items.map((item, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <div className="icon-check text-green-500"></div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    );
  } catch (error) {
    console.error('ServicesPage error:', error);
    return null;
  }
}

