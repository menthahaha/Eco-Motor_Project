function PrivacyPage() {
  try {
    return (
      <div className="min-h-screen">
        <Header />
        <section className="py-16 bg-gradient-to-br from-[var(--primary-color)] to-blue-800 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold">Политика конфиденциальности</h1>
          </div>
        </section>
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold mb-4">1. Общие положения</h2>
              <p className="mb-6">Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей сайта ООО "ЭКО-МОТОР".</p>
              
              <h2 className="text-2xl font-bold mb-4">2. Сбор персональных данных</h2>
              <p className="mb-6">Мы собираем только те персональные данные, которые необходимы для предоставления услуг: имя, телефон, email, данные об автомобиле.</p>
              
              <h2 className="text-2xl font-bold mb-4">3. Использование данных</h2>
              <p className="mb-6">Персональные данные используются исключительно для оказания услуг, информирования о статусе заказов и специальных предложениях.</p>
              
              <h2 className="text-2xl font-bold mb-4">4. Защита данных</h2>
              <p className="mb-6">Мы применяем современные технологии защиты информации и обеспечиваем конфиденциальность персональных данных.</p>
              
              <h2 className="text-2xl font-bold mb-4">5. Контакты</h2>
              <p>По вопросам обработки персональных данных обращайтесь: +7 (496) 549-61-50</p>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  } catch (error) {
    console.error('PrivacyPage error:', error);
    return null;
  }
}

