function HomePage() {
  try {
    return (
      <div className="min-h-screen" data-name="app" data-file="pages/HomePage.js">
        <Header />
        <Hero />
        <Advantages />
        <Pricing />
        <PromoSection />
        <MapSection />
        <Footer />
      </div>
    );
  } catch (error) {
    console.error('HomePage component error:', error);
    return null;
  }
}

