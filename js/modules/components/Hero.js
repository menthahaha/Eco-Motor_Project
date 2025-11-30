function Hero() {
  try {
    return (
      <section className="relative bg-gradient-to-br from-[var(--primary-color)] to-blue-800 text-white py-20" data-name="hero" data-file="components/Hero.js">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Сезонное хранение колес</h1>
              <p className="text-xl mb-8 text-blue-100">Профессиональное хранение в специализированных ячейках. Удобное онлайн-бронирование и управление через личный кабинет.</p>
              <div className="flex flex-wrap gap-4">
                <a href="cabinet.html" className="btn-secondary text-lg">Забронировать ячейку</a>
                <a href="#advantages" className="px-6 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-[var(--primary-color)] transition-all duration-300">Узнать больше</a>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="w-full h-80 rounded-3xl overflow-hidden shadow-lg">
                  <img 
                    src="images/shin.jpg" 
                    alt="Сезонное хранение колес" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error('Hero component error:', error);
    return null;
  }
}

