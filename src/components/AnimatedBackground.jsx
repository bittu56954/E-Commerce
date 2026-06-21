import React, { useMemo, useState, useEffect } from 'react';
import './AnimatedBackground.css';

const DEFAULT_BACKGROUND_IMAGES = {
  home: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1600',
  about: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1600',
  contact: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1600',
  register: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1600',
  login: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1600',
  dashboard: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600',
  admin: 'https://images.unsplash.com/photo-1490815685287-c24a72d74021?q=80&w=1600'
};

const AnimatedBackground = ({ page = 'home' }) => {
  const [backgrounds, setBackgrounds] = useState(DEFAULT_BACKGROUND_IMAGES);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        if (response.ok && data.settings && data.settings.backgrounds) {
          setBackgrounds(prev => ({ ...prev, ...data.settings.backgrounds }));
        }
      } catch (error) {
        console.error('Fetch settings background error:', error);
      }
    };
    fetchSettings();

    const handleSettingsChange = (e) => {
      if (e.detail && e.detail.backgrounds) {
        setBackgrounds(prev => ({ ...prev, ...e.detail.backgrounds }));
      }
    };
    window.addEventListener('settingsChange', handleSettingsChange);

    return () => {
      window.removeEventListener('settingsChange', handleSettingsChange);
    };
  }, []);

  const imageUrl = backgrounds[page] || backgrounds.home;

  // Generate fixed random particles properties
  const particles = useMemo(() => {
    return Array.from({ length: 20 }).map((_, idx) => ({
      id: idx,
      width: Math.random() * 8 + 4 + 'px',
      height: Math.random() * 8 + 4 + 'px',
      left: Math.random() * 100 + '%',
      top: Math.random() * 100 + '%',
      delay: Math.random() * -20 + 's',
      duration: Math.random() * 15 + 15 + 's',
      opacity: Math.random() * 0.4 + 0.2
    }));
  }, []);

  return (
    <div className="animated-bg-container">
      <div 
        className="animated-bg-image" 
        style={{ backgroundImage: `url(${imageUrl})` }}
      ></div>
      <div className="animated-bg-glow-mesh"></div>
      <div className="animated-bg-overlay"></div>
      <div className="animated-particles-layer">
        {particles.map(p => (
          <div
            key={p.id}
            className="floating-particle"
            style={{
              width: p.width,
              height: p.height,
              left: p.left,
              top: p.top,
              animationDelay: p.delay,
              animationDuration: p.duration,
              opacity: p.opacity
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AnimatedBackground;
