function PromoSection() {
  try {
    const [imageError, setImageError] = React.useState(false);

    return (
      <section className="py-8" data-name="promo" data-file="components/PromoSection.js">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="rounded-2xl overflow-hidden shadow-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] h-64 relative">
              {!imageError ? (
                <img 
                  src="images/banner.png" 
                  alt="Баннер" 
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-center text-[var(--text-light)]">
                  <div>
                    <div className="icon-image text-6xl mb-4"></div>
                    <p className="font-semibold">Баннер</p>
                    <p className="text-sm">(добавьте изображение в images/banner.png)</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error('PromoSection component error:', error);
    return null;
  }
}

