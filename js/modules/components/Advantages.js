function Advantages() {
  try {
    const advantages = [
      { icon: 'shield-check', title: 'Безопасное хранение', desc: 'Специализированные ячейки с контролем температуры и влажности' },
      { icon: 'smartphone', title: 'Онлайн-бронирование', desc: 'Удобное бронирование через личный кабинет в любое время' },
      { icon: 'map', title: 'Выбор ячейки', desc: 'Визуальная схема склада для выбора удобной ячейки' },
      { icon: 'clock', title: 'Круглосуточный доступ', desc: 'Возможность забрать колеса в удобное для вас время' },
      { icon: 'truck', title: 'Удобный подъезд', desc: 'Просторная парковка и удобный подъезд к складу' },
      { icon: 'badge-check', title: 'Гарантия качества', desc: 'Профессиональное оборудование и опытные специалисты' }
    ];

    return (
      <section id="advantages" className="py-16 bg-[var(--bg-light)]" data-name="advantages" data-file="components/Advantages.js">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Наши преимущества</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advantages.map((adv, idx) => (
              <div key={idx} className="card">
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <div className={`icon-${adv.icon} text-2xl text-[var(--primary-color)]`}></div>
                </div>
                <h3 className="text-xl font-bold mb-2">{adv.title}</h3>
                <p className="text-[var(--text-light)]">{adv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error('Advantages component error:', error);
    return null;
  }
}

