function MapSection() {
  try {
    const mapRef = React.useRef(null);
    const mapInstanceRef = React.useRef(null);

    React.useEffect(() => {
      // Ждем загрузки API Яндекс.Карт
      if (typeof ymaps === 'undefined') {
        return;
      }

      // Инициализация карты
      ymaps.ready(() => {
        if (!mapRef.current || mapInstanceRef.current) {
          return;
        }

        // Координаты: г. Пересвет, ул. Гагарина д. 5А
        const coordinates = [56.411006, 38.185379]; // [широта, долгота]

        // Создаем карту
        const map = new ymaps.Map(mapRef.current, {
          center: coordinates,
          zoom: 17,
          controls: ['zoomControl', 'fullscreenControl']
        });

        // Создаем метку
        const placemark = new ymaps.Placemark(
          coordinates,
          {
            balloonContentHeader: 'ЭКО-МОТОР',
            balloonContentBody: 'г. Пересвет, ул. Гагарина д. 5А<br/>Телефон: +7 (496) 549-61-50',
            balloonContentFooter: '<a href="https://yandex.ru/maps/103819/peresvet/?ll=38.185543%2C56.410810&mode=poi&poi%5Bpoint%5D=38.185379%2C56.411006&poi%5Buri%5D=ymapsbm1%3A%2F%2Forg%3Foid%3D67712768030&z=19.9" target="_blank">Открыть в Яндекс.Картах</a>',
            hintContent: 'ЭКО-МОТОР'
          },
          {
            preset: 'islands#blueAutoIcon'
          }
        );

        map.geoObjects.add(placemark);
        mapInstanceRef.current = map;
      });

      // Очистка при размонтировании
      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.destroy();
          mapInstanceRef.current = null;
        }
      };
    }, []);

    return (
      <section id="map" className="py-16 bg-[var(--bg-light)]" data-name="map" data-file="components/MapSection.js">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Как нас найти</h2>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Контактная информация</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="icon-phone text-xl text-[var(--primary-color)]"></div>
                  <div>
                    <p className="font-semibold">Телефон</p>
                    <a href="tel:+74965496150" className="text-[var(--primary-color)] hover:underline">+7 (496) 549-61-50</a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="icon-map-pin text-xl text-[var(--primary-color)]"></div>
                  <div>
                    <p className="font-semibold">Адрес</p>
                    <p className="text-[var(--text-light)]">г. Пересвет, ул. Гагарина д. 5А</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="icon-clock text-xl text-[var(--primary-color)]"></div>
                  <div>
                    <p className="font-semibold">Режим работы</p>
                    <p className="text-[var(--text-light)]">Пн-Пт: 8:00 - 20:00<br/>Сб-Вс: 9:00 - 18:00</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden h-96 shadow-lg">
              <div ref={mapRef} className="w-full h-full"></div>
            </div>
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error('MapSection component error:', error);
    return null;
  }
}

