import React, { useState, useEffect } from 'react';
import '../style/LandingPage.css';

export default function LandingPage({ onGetStarted }) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    
    // İstatistik animasyonu
    const interval = setInterval(() => {
      setCurrentStat(prev => (prev + 1) % 3);
    }, 3000);
    
    // Scroll animasyonu
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const stats = [
    { value: '10,000+', label: 'Aktif İlan', icon: '🏠' },
    { value: '39', label: 'İstanbul İlçesi', icon: '📍' },
    { value: '%92~', label: 'Doğruluk Oranı', icon: '🎯' }
  ];

  const features = [
    {
      icon: '🤖',
      title: 'Yapay Zeka Asistanı',
      description: 'AI destekli asistan size mükemmel evi bulmanıza yardımcı olur'
    },
    {
      icon: '💰',
      title: 'Akıllı Fiyat Tahmini',
      description: 'Makine öğrenmesi ile gerçek zamanlı piyasa analizi'
    },
    {
      icon: '🗺️',
      title: 'Harita Görünümü',
      description: 'Interaktif harita ile konumları keşfedin'
    },
    {
      icon: '⚡',
      title: 'Hızlı Filtreleme',
      description: 'Gelişmiş filtreleme özellikleri ile saniyeler içinde sonuç'
    },
    {
      icon: '❤️',
      title: 'Favoriler',
      description: 'Beğendiğiniz ilanları kaydedin ve karşılaştırın'
    },
    {
      icon: '📊',
      title: 'Detaylı Analiz',
      description: 'Her ilan için kapsamlı fiyat ve konum analizi'
    }
  ];

  return (
    <div className="landing-page">
      {/* Scroll to Top Button */}
      {scrollY > 500 && (
        <button 
          className="scroll-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f27f0e 0%, #d96d0b 100%)',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(242, 127, 14, 0.3)',
            zIndex: 1000,
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(242, 127, 14, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(242, 127, 14, 0.3)';
          }}
        >
          ↑
        </button>
      )}
      
      {/* Hero Section */}
      <section className={`hero-section ${isVisible ? 'visible' : ''}`}>
        <div className="hero-background" style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">✨</span>
            <span>AI Destekli Emlak Platformu</span>
          </div>
          
          <h1 className="hero-title">
            <span className="gradient-text">Hayalinizdeki Evi</span>
            <br />
            Yapay Zeka ile Bulun
          </h1>
          
          <p className="hero-description">
            İstanbul'un en kapsamlı emlak veritabanı ile AI destekli akıllı 
            filtreleme ve fiyat tahmin sistemimiz sayesinde size en uygun evi bulun.
          </p>
          
          <div className="hero-buttons">
            <button className="btn-primary-large" onClick={onGetStarted}>
              <span>Hemen Başla</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            
            <button className="btn-secondary-large" onClick={() => {
              const howItWorks = document.querySelector('.how-it-works-section');
              if (howItWorks) {
                howItWorks.scrollIntoView({ behavior: 'smooth' });
              }
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Nasıl Çalışır?</span>
            </button>
          </div>
          
          {/* Animated Stats */}
          <div className="hero-stats">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className={`stat-item ${currentStat === index ? 'active' : ''}`}
              >
                <span className="stat-icon">{stat.icon}</span>
                <div className="stat-content">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Mockup Image */}
        <div className="hero-image">
          <div className="mockup-container">
            <div className="mockup-glow"></div>
            <div className="mockup-card">
              <div className="mockup-header">
                <div className="dot red"></div>
                <div className="dot yellow"></div>
                <div className="dot green"></div>
              </div>
              <div className="mockup-content">
                <div className="mock-card">
                  <div className="mock-image"></div>
                  <div className="mock-text">
                    <div className="mock-line long"></div>
                    <div className="mock-line medium"></div>
                    <div className="mock-line short"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <div className="section-badge">
            <span>🚀 Özellikler</span>
          </div>
          <h2 className="section-title">
            Neden Bizi <span className="gradient-text">Seçmelisiniz?</span>
          </h2>
          <p className="section-description">
            Modern teknoloji ve kullanıcı dostu arayüz ile ev arama deneyiminizi bir üst seviyeye taşıyoruz
          </p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="feature-icon-wrapper">
                <span className="feature-icon">{feature.icon}</span>
                <div className="feature-icon-bg"></div>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="section-header">
          <div className="section-badge">
            <span>📋 Süreç</span>
          </div>
          <h2 className="section-title">
            <span className="gradient-text">3 Adımda</span> Hayalinizdeki Ev
          </h2>
        </div>
        
        <div className="steps-container">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Filtreleyin veya AI'a Sorun</h3>
              <p>Gelişmiş filtreleme sistemi veya yapay zeka asistanı ile kriterlerinizi belirleyin</p>
            </div>
            <div className="step-icon">🔍</div>
          </div>
          
          <div className="step-connector"></div>
          
          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Akıllı Sonuçları İnceleyin</h3>
              <p>AI destekli fiyat tahminleri ile piyasa ortalamasını görün</p>
            </div>
            <div className="step-icon">🎯</div>
          </div>
          
          <div className="step-connector"></div>
          
          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Favorilerinizi Karşılaştırın</h3>
              <p>Beğendiğiniz evleri kaydedin ve detaylı analiz yapın</p>
            </div>
            <div className="step-icon">✅</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <div className="cta-badge">
            <span>🎉 Ücretsiz Kullanın</span>
          </div>
          <h2 className="cta-title">
            Hayalinizdeki Evi Bulmaya<br />
            <span className="gradient-text">Bugün Başlayın</span>
          </h2>
          <p className="cta-description">
            İstanbul'un en gelişmiş emlak arama platformunu şimdi deneyin
          </p>
          <div className="cta-badge-2">
            <button className="btn-primary-large" onClick={onGetStarted}>
              <span>Ücretsiz Başla</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </div>
        <div className="cta-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <div className="logo-icon">🏠</div>
            <span className="logo-text">AI<span className="gradient-text">Spark</span></span>
          </div>
          <p className="footer-text">
            Yapay zeka destekli emlak platformu
          </p>
          {/*<div className="footer-links">
            <a href="#about">Hakkımızda</a>
            <span>•</span>
            <a href="#privacy">Gizlilik</a>
            <span>•</span>
            <a href="#contact">İletişim</a>
          </div>*/}
          <div className="footer-copyright">
            © 2025 AI Spark. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
}

