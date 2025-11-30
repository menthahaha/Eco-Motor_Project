function FAQPage() {
  try {
    const [openIndex, setOpenIndex] = React.useState(null);

    const faqs = [
      {
        q: 'Как забронировать ячейку для хранения колес?',
        a: 'Зарегистрируйтесь в личном кабинете, выберите подходящую ячейку на схеме склада и оформите бронирование на нужный период.'
      },
      {
        q: 'Какие условия хранения колес?',
        a: 'Колеса хранятся в специализированных ячейках с контролируемой температурой и влажностью, что обеспечивает сохранность резины.'
      },
      {
        q: 'Можно ли забрать колеса в любое время?',
        a: 'Да, вы можете забрать колеса в рабочее время автосервиса. Предварительно создайте заявку в личном кабинете.'
      },
      {
        q: 'Какие способы оплаты доступны?',
        a: 'Принимаем наличные, банковские карты и оплату QR-кодом.'
      },
      {
        q: 'Что входит в услугу хранения?',
        a: 'Хранение в специализированной ячейке, контроль условий, возможность онлайн-бронирования и управления через личный кабинет.'
      },
      {
        q: 'Нужно ли мыть колеса перед сдачей на хранение?',
        a: 'Мы рекомендуем привозить чистые колеса, но при необходимости можем предоставить услугу мойки за дополнительную плату.'
      },
      {
        q: 'Как долго можно хранить колеса?',
        a: 'Минимальный срок хранения - месяц. Возможно продление при наличии свободных ячеек.'
      }
    ];

    return (
      <div className="min-h-screen">
        <Header />
        
        <section className="py-16 bg-gradient-to-br from-[var(--primary-color)] to-blue-800 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Частые вопросы</h1>
            <p className="text-xl text-blue-100">Ответы на популярные вопросы о наших услугах</p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              {faqs.map((faq, idx) => (
                <div key={idx} className="mb-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl shadow-md overflow-hidden">
                  <button
                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    <span className="font-semibold text-lg text-[var(--text-dark)]">{faq.q}</span>
                    <div className={`icon-chevron-down text-xl transition-transform ${openIndex === idx ? 'rotate-180' : ''}`}></div>
                  </button>
                  {openIndex === idx && (
                    <div className="px-6 py-4 bg-[var(--bg-secondary)] border-t border-[var(--border-color)]">
                      <p className="text-[var(--text-light)]">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    );
  } catch (error) {
    console.error('FAQPage error:', error);
    return null;
  }
}

