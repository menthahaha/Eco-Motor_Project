function AboutPage() {
  try {
    const equipment = [
      'Подъемники разного тоннажа',
      'Оборудование для компьютерной диагностики',
      'Стенд для регулировки сход-развала',
      'Установки для шиномонтажа и балансировки',
      'Покрасочные камеры и посты подготовки',
      'Стапель',
      'Оборудование для ремонта вмятин без покраски',
      'Гидравлический пресс',
      'Установка для вакуумной замены масла',
      'Установка для промывки топливных форсунок',
      'Специальный инструмент для замены приводов ГРМ',
      'Установка для заправки систем кондиционирования',
      'Сертифицированный пост государственного техосмотра',
      'Различный пневмоинструмент',
      'Профессиональный ручной инструмент'
    ];

    const amenities = [
      { icon: 'tv', title: 'Комфортное ожидание', desc: 'Клиентская зона с удобной мебелью, телевизором и бесплатным Wi-Fi. Автоматы с горячими и прохладительными напитками.' },
      { icon: 'truck', title: 'Большая парковка', desc: 'Просторная парковка для размещения автомобиля на период до начала ремонта и после его завершения.' },
      { icon: 'package', title: 'Магазин автозапчастей', desc: 'Наличие и заказ любых автозапчастей оригинальных производителей и качественных аналогов.' }
    ];

    return (
      <div className="min-h-screen">
        <Header />
        
        <section className="py-16 bg-gradient-to-br from-[var(--primary-color)] to-blue-800 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">О компании ЭКО-МОТОР</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">Профессиональный автосервис полного цикла с многолетним опытом</p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <p className="text-lg mb-6 leading-relaxed">Оказываем профессиональные услуги по ремонту и техническому обслуживанию автомобилей, благодаря чему накопился большой опыт ремонта легкового и малотоннажного транспортных средств как иностранного так и отечественного производства.</p>
              <p className="text-lg leading-relaxed">Осуществляем ремонт двигателей и коробок передач, ремонт электрооборудования, кузовной ремонт любой сложности, развал схождение и шиномонтаж, а также предлагаем дополнительные услуги по сезонному хранению колёс, прохождению государственного технического осмотра с выдачей диагностических карт, мойке и полной химчистке салона, полировке кузова и фар.</p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-[var(--bg-light)]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Удобства для клиентов</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {amenities.map((item, idx) => (
                <div key={idx} className="card">
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <div className={`icon-${item.icon} text-2xl text-[var(--primary-color)]`}></div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-[var(--text-light)]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Профессиональное оборудование</h2>
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-4">
                {equipment.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-3 p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl">
                    <div className="icon-check-circle text-green-500 text-xl"></div>
                    <span className="text-[var(--text-dark)]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    );
  } catch (error) {
    console.error('AboutPage error:', error);
    return null;
  }
}

