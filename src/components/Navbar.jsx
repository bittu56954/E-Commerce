import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { triggerToast } from './Toast';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [cartCount, setCartCount] = useState(0);
  const [storeName, setStoreName] = useState("Like Your Food");
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Custom states for Zomato location bar
  const [selectedLocation, setSelectedLocation] = useState(
    localStorage.getItem('currentLocation') || "Bhilai, Chhattisgarh, Kurud Road, 490001"
  );
  const [localSearch, setLocalSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const checkAuth = () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  const updateCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const count = cart.reduce((total, item) => total + item.quantity, 0);
      setCartCount(count);
    } catch (e) {
      setCartCount(0);
    }
  };

  useEffect(() => {
    checkAuth();
    updateCartCount();
    window.addEventListener('authChange', checkAuth);
    window.addEventListener('cartChange', updateCartCount);

    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        if (response.ok && data.settings && data.settings.storeName) {
          setStoreName(data.settings.storeName);
        }
      } catch (error) {
        console.error('Navbar fetch settings error:', error);
      }
    };
    fetchSettings();

    const handleSettingsChange = (e) => {
      if (e.detail && e.detail.storeName) {
        setStoreName(e.detail.storeName);
      }
    };
    window.addEventListener('settingsChange', handleSettingsChange);

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('authChange', checkAuth);
      window.removeEventListener('cartChange', updateCartCount);
      window.removeEventListener('settingsChange', handleSettingsChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Theme effect
  useEffect(() => {
    document.documentElement.className = theme === 'dark' ? 'dark-mode' : 'light-mode';
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Sync location across components
  useEffect(() => {
    const handleLoc = (e) => {
      setSelectedLocation(e.detail);
    };
    window.addEventListener('locationChange', handleLoc);
    return () => {
      window.removeEventListener('locationChange', handleLoc);
    };
  }, []);

  const handleLocationInputChange = (e) => {
    const val = e.target.value;
    setSelectedLocation(val);
    localStorage.setItem('currentLocation', val);
    window.dispatchEvent(new CustomEvent('locationChange', { detail: val }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authChange'));
    setUser(null);
    triggerToast('Logged out successfully.', 'info');
    navigate('/login');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleCartClick = () => {
    if (location.pathname !== '/') {
      navigate('/', { state: { openCart: true } });
    } else {
      window.dispatchEvent(new Event('toggleCart'));
    }
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      // Dispatch a search event to Home page
      const event = new CustomEvent('navbarSearch', { detail: localSearch });
      window.dispatchEvent(event);
      if (location.pathname !== '/') {
        navigate('/');
      }
    }
  };

  // Determine if we show the search bar in the navbar
  // We only show it in the navbar when scrolled or on subpages
  const isLandingRoot = location.pathname === '/';
  const showNavbarSearch = !isLandingRoot || isScrolled;

  return (
    <nav className={`lys-navbar-node ${isScrolled ? 'scrolled' : ''} ${isLandingRoot ? 'transparent-navbar' : 'white-navbar'}`}>
      <div className="lys-navbar-container">
        
        {/* Brand Logo styled in new Zomato branding */}
        <div className="lys-logo-block" onClick={() => navigate('/')}>
          <svg className="lys-logo-icon" viewBox="0 0 100 100" width="34" height="34" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
            <defs>
              <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff4d4d" />
                <stop offset="100%" stopColor="#f92c50" />
              </linearGradient>
            </defs>
            <rect x="15" y="15" width="70" height="70" rx="20" fill="url(#logo-grad)" />
            <path d="M38 52C34 52 32 48 34 44C36 40 40 40 43 42C44 36 49 33 54 35C59 37 60 41 59 45C63 44 67 46 67 50C67 54 64 56 61 56H39C36 56 38 52 38 52Z" fill="white" />
            <path d="M42 58H58V65C58 66 57 67 56 67H44C43 67 42 66 42 65V58Z" fill="white" opacity="0.9" />
            <line x1="44" y1="61" x2="56" y2="61" stroke="#f92c50" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="lys-logo-text" style={{ textTransform: 'lowercase' }}>{storeName}</span>
        </div>

        {/* Dynamic Search Bar (dual location/search widget) */}
        {showNavbarSearch && (
          <div className="lys-search-widget">
            <div className="search-location-picker">
              <span className="location-pin-icon">📍</span>
              <input 
                type="text" 
                value={selectedLocation} 
                onChange={handleLocationInputChange} 
                placeholder="Select location..."
              />
              <span className="location-chevron">▼</span>
            </div>
            <div className="search-widget-divider"></div>
            <div className="search-input-field">
              <span className="search-lens-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search for dishes, cuisines..." 
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  // Real-time dispatch search
                  window.dispatchEvent(new CustomEvent('navbarSearch', { detail: e.target.value }));
                }}
                onKeyDown={handleSearchSubmit}
              />
            </div>
          </div>
        )}

        {/* User Navigation Links */}
        <div className="lys-nav-actions">
          <NavLink className="nav-action-link" to="/">Delivery</NavLink>
          <NavLink className="nav-action-link" to="/about">About Us</NavLink>
          <NavLink className="nav-action-link" to="/contact">Help</NavLink>
          
          {user && (
            <NavLink className="nav-action-link" to="/dashboard">My Orders</NavLink>
          )}

          {user && user.isAdmin && (
            <NavLink className="nav-action-link admin-pill" to="/admin">Admin 🛡️</NavLink>
          )}

          {/* Cart Icon styled in Sunset theme */}
          <button className="lys-cart-btn" onClick={handleCartClick}>
            <span className="cart-icon-wrap">
              🛒
              {cartCount > 0 && <span className="lys-cart-count">{cartCount}</span>}
            </span>
            <span className="cart-text-lbl">Cart</span>
          </button>

          {user ? (
            <button className="nav-logout-btn-lys" onClick={handleLogout}>Logout</button>
          ) : (
            <>
              <NavLink className="nav-auth-link" to="/login">Log in</NavLink>
              <NavLink className="nav-auth-link signup-btn" to="/register">Sign up</NavLink>
            </>
          )}

          {/* Theme Switcher */}
          <button className="lys-theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Mobile controls (theme + hamburger menu) */}
        <div className="navbar-mobile-controls">
          <button className="lys-theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="lys-mobile-menu-toggle" onClick={() => setMobileMenuOpen(prev => !prev)}>
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown Panel */}
      {mobileMenuOpen && (
        <div className="lys-mobile-menu-panel">
          <NavLink className="mobile-action-link" to="/" onClick={() => setMobileMenuOpen(false)}>Delivery</NavLink>
          <NavLink className="mobile-action-link" to="/about" onClick={() => setMobileMenuOpen(false)}>About Us</NavLink>
          <NavLink className="mobile-action-link" to="/contact" onClick={() => setMobileMenuOpen(false)}>Help</NavLink>
          
          {user && (
            <NavLink className="mobile-action-link" to="/dashboard" onClick={() => setMobileMenuOpen(false)}>My Orders</NavLink>
          )}

          {user && user.isAdmin && (
            <NavLink className="mobile-action-link mobile-admin-pill" to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin 🛡️</NavLink>
          )}

          <button className="mobile-cart-btn" onClick={() => { handleCartClick(); setMobileMenuOpen(false); }}>
            🛒 Cart {cartCount > 0 && <span className="mobile-cart-badge">{cartCount}</span>}
          </button>

          {user ? (
            <button className="mobile-logout-btn" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>Logout</button>
          ) : (
            <div className="mobile-auth-row">
              <NavLink className="mobile-auth-link" to="/login" onClick={() => setMobileMenuOpen(false)}>Log in</NavLink>
              <NavLink className="mobile-auth-link mobile-signup-btn" to="/register" onClick={() => setMobileMenuOpen(false)}>Sign up</NavLink>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;