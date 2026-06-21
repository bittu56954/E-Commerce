import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { triggerToast } from './Toast';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  
  // Like Your Shop specific view state: 'landing', 'delivery', 'dining', 'nightlife'
  const [viewMode, setViewMode] = useState('landing');
  
  // Quick Filters state
  const [filterRating, setFilterRating] = useState(false);
  const [filterPureVeg, setFilterPureVeg] = useState(false);
  const [sortByPrice, setSortByPrice] = useState('none'); // 'none', 'low-high', 'high-low'

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]');
    } catch (e) {
      return [];
    }
  });

  const [checkoutData, setCheckoutData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isOrdered, setIsOrdered] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');

  // Payment Selection States
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' or 'Online'
  const [onlineProvider, setOnlineProvider] = useState('UPI'); // 'UPI', 'Card', 'NetBanking', 'Wallet'
  const [paymentDetails, setPaymentDetails] = useState({
    upiId: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    bankName: 'State Bank of India',
    walletName: 'Paytm'
  });

  const [settings, setSettings] = useState({
    storeName: "zomato",
    currencySymbol: "₹",
    gstPercentage: 5,
    storeStatus: "Open"
  });
  const [categoriesList, setCategoriesList] = useState([]);

  // Fetch settings & categories
  useEffect(() => {
    const fetchSettingsAndCategories = async () => {
      try {
        const settingsRes = await fetch('/api/settings');
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData.settings);
        }
        
        const categoriesRes = await fetch('/api/categories');
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategoriesList(categoriesData.categories);
        }
      } catch (error) {
        console.error('Error fetching settings/categories:', error);
      }
    };
    fetchSettingsAndCategories();
  }, []);

  // Listen for search sync from Like Your Shop Navbar
  useEffect(() => {
    const handleNavbarSearch = (e) => {
      setSearchQuery(e.detail || '');
      // If we receive a search and are on landing page, transition to delivery catalog automatically!
      if (e.detail && viewMode === 'landing') {
        setViewMode('delivery');
      }
    };
    window.addEventListener('navbarSearch', handleNavbarSearch);
    return () => {
      window.removeEventListener('navbarSearch', handleNavbarSearch);
    };
  }, [viewMode]);

  // Sync cart
  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartChange'));
  };

  const loadUserDetails = () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCheckoutData(prev => ({
          ...prev,
          name: prev.name || parsed.name || '',
          phone: prev.phone || parsed.phone || '',
          address: prev.address || parsed.currentLocation || ''
        }));
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    loadUserDetails();
    window.addEventListener('authChange', loadUserDetails);
    return () => {
      window.removeEventListener('authChange', loadUserDetails);
    };
  }, []);

  // Listen for Navbar cart toggle
  useEffect(() => {
    const handleToggle = () => setCartOpen(prev => !prev);
    window.addEventListener('toggleCart', handleToggle);
    return () => {
      window.removeEventListener('toggleCart', handleToggle);
    };
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const url = selectedCategory === 'All' 
          ? '/api/products' 
          : `/api/products?category=${selectedCategory}`;
        const response = await fetch(url);
        const data = await response.json();
        if (response.ok) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error('Fetch products error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory]);

  const handleAddToCart = (product) => {
    const existingIndex = cart.findIndex(item => item.id === product.id);
    const newCart = [...cart];
    
    if (existingIndex > -1) {
      newCart[existingIndex].quantity += 1;
    } else {
      newCart.push({ ...product, quantity: 1 });
    }
    
    saveCart(newCart);
    triggerToast(`Added ${product.name} to cart! 🛒`, 'success');
    setCartOpen(true);
  };

  const handleUpdateQuantity = (productId, change) => {
    const existingIndex = cart.findIndex(item => item.id === productId);
    if (existingIndex === -1) return;
    
    const newCart = [...cart];
    newCart[existingIndex].quantity += change;
    
    if (newCart[existingIndex].quantity <= 0) {
      const pName = newCart[existingIndex].name;
      newCart.splice(existingIndex, 1);
      triggerToast(`Removed ${pName} from cart.`, 'info');
    }
    
    saveCart(newCart);
  };

  const handleRemoveItem = (productId) => {
    const item = cart.find(i => i.id === productId);
    const newCart = cart.filter(i => i.id !== productId);
    saveCart(newCart);
    if (item) {
      triggerToast(`Removed ${item.name} from cart.`, 'info');
    }
  };

  const handleCheckoutChange = (e) => {
    const { name, value } = e.target;
    setCheckoutData(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'PIZZA20') {
      setAppliedCoupon({ code, discountPercent: 20, type: 'percent' });
      triggerToast('Coupon PIZZA20 applied! 20% discount subtracted. 🍕', 'success');
    } else if (code === 'WELCOME10') {
      setAppliedCoupon({ code, discountPercent: 10, type: 'percent' });
      triggerToast('Coupon WELCOME10 applied! 10% discount subtracted. 🎉', 'success');
    } else if (code === 'FREEDEL') {
      setAppliedCoupon({ code, discountPercent: 0, type: 'free_delivery' });
      triggerToast('Coupon FREEDEL applied! GST & Delivery charges waived. 🚚', 'success');
    } else {
      triggerToast('Invalid discount code. Try PIZZA20, WELCOME10, or FREEDEL.', 'error');
    }
    setCouponCode('');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    triggerToast('Coupon removed.', 'info');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
      triggerToast('Please log in or register an account to place your order! 🛍️', 'warning');
      setCartOpen(false);
      navigate('/login');
      return;
    }

    if (settings.storeStatus === 'Closed') {
      triggerToast('Our kitchen is currently closed. We are not accepting new orders at this moment.', 'warning');
      return;
    }

    if (!checkoutData.name || !checkoutData.phone || !checkoutData.address) {
      triggerToast('Please fill out all required shipping coordinates.', 'warning');
      return;
    }

    // Payment validation
    let finalPaymentDetails = { transactionId: null, methodType: paymentMethod };
    let finalPaymentStatus = 'Pending';

    if (paymentMethod === 'Online') {
      finalPaymentStatus = 'Completed';
      const txId = 'tx-' + Math.floor(10000000 + Math.random() * 90000000);
      
      if (onlineProvider === 'UPI') {
        if (!paymentDetails.upiId || !paymentDetails.upiId.includes('@')) {
          triggerToast('Please enter a valid UPI ID (e.g. name@upi)', 'warning');
          return;
        }
        finalPaymentDetails = {
          transactionId: txId,
          methodType: 'UPI',
          upiId: paymentDetails.upiId
        };
      } else if (onlineProvider === 'Card') {
        const cleanCard = paymentDetails.cardNumber.replace(/\s+/g, '');
        if (cleanCard.length < 16) {
          triggerToast('Please enter a valid 16-digit Card Number', 'warning');
          return;
        }
        if (!paymentDetails.cardExpiry || !/^\d{2}\/\d{2}$/.test(paymentDetails.cardExpiry)) {
          triggerToast('Please enter Expiry in MM/YY format', 'warning');
          return;
        }
        if (!paymentDetails.cardCvv || paymentDetails.cardCvv.length < 3) {
          triggerToast('Please enter a valid CVV code', 'warning');
          return;
        }
        finalPaymentDetails = {
          transactionId: txId,
          methodType: 'Card',
          cardLast4: cleanCard.slice(-4)
        };
      } else if (onlineProvider === 'NetBanking') {
        finalPaymentDetails = {
          transactionId: txId,
          methodType: 'NetBanking',
          bankName: paymentDetails.bankName
        };
      } else if (onlineProvider === 'Wallet') {
        finalPaymentDetails = {
          transactionId: txId,
          methodType: 'Wallet',
          walletName: paymentDetails.walletName
        };
      }
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          totalAmount: grandTotal,
          couponApplied: appliedCoupon ? appliedCoupon.code : null,
          customerDetails: checkoutData,
          paymentMethod,
          paymentStatus: finalPaymentStatus,
          paymentDetails: finalPaymentDetails
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        triggerToast(data.error || 'Failed to place order.', 'error');
        return;
      }

      setPlacedOrderId(data.order.id);
      setIsOrdered(true);
      setAppliedCoupon(null);
      saveCart([]);
      setCheckoutData(prev => ({ ...prev, notes: '' }));
      
      // Reset payment fields
      setPaymentMethod('COD');
      setPaymentDetails({
        upiId: '',
        cardNumber: '',
        cardExpiry: '',
        cardCvv: '',
        bankName: 'State Bank of India',
        walletName: 'Paytm'
      });

      triggerToast('Order sent to the kitchen! 🧑‍🍳', 'success');

      // Navigate to order-confirmation page
      setTimeout(() => {
        setIsOrdered(false);
        setCartOpen(false);
        navigate(`/order-confirmation/${data.order.id}`);
      }, 1200);

    } catch (error) {
      console.error('Place order exception:', error);
      triggerToast('Server communication error during checkout.', 'error');
    }
  };

  // Filter products by search and checkboxes
  let filteredProducts = products.filter(prod => 
    prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prod.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filterRating) {
    filteredProducts = filteredProducts.filter(prod => prod.rating >= 4.7);
  }

  if (filterPureVeg) {
    // Treat everything except beef/pork/lamb/chicken as pure veg in our items list,
    // or simulate it based on names containing meat keywords
    filteredProducts = filteredProducts.filter(prod => 
      !prod.name.toLowerCase().includes('chicken') && 
      !prod.name.toLowerCase().includes('pepperoni') &&
      !prod.name.toLowerCase().includes('meatball') &&
      !prod.name.toLowerCase().includes('bacon') &&
      !prod.name.toLowerCase().includes('fish') &&
      !prod.name.toLowerCase().includes('beef') &&
      !prod.name.toLowerCase().includes('lamb') &&
      !prod.name.toLowerCase().includes('pork')
    );
  }

  if (sortByPrice === 'low-high') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortByPrice === 'high-low') {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  let discountAmount = 0;
  if (appliedCoupon && appliedCoupon.type === 'percent') {
    discountAmount = Math.round(cartSubtotal * (appliedCoupon.discountPercent / 100));
  }

  const gstRate = typeof settings.gstPercentage === 'number' ? (settings.gstPercentage / 100) : 0.05;
  let deliveryCharges = Math.round(cartSubtotal * gstRate);
  if (appliedCoupon && appliedCoupon.type === 'free_delivery') {
    deliveryCharges = 0;
  }

  const grandTotal = cartSubtotal - discountAmount + deliveryCharges;

  // Like Your Shop static Dining Out list
  const diningOutSpots = [
    { name: "The Bier Library", cuisine: "Continental, Finger Food, Brewery", location: "Koramangala, Bengaluru", rating: "4.6", image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=600", price: "₹1,500 for two" },
    { name: "Toit", cuisine: "Italian, Pizza, Craft Beer", location: "Indiranagar, Bengaluru", rating: "4.8", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600", price: "₹2,000 for two" },
    { name: "Punjab Grill", cuisine: "North Indian, Mughlai", location: "Whitefield, Bengaluru", rating: "4.5", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=600", price: "₹1,800 for two" },
    { name: "Windmills Craftworks", cuisine: "American, North Indian, Salad", location: "Whitefield, Bengaluru", rating: "4.7", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=600", price: "₹2,500 for two" },
    { name: "Fenny's Lounge & Kitchen", cuisine: "Mediterranean, Seafood, Goan", location: "Koramangala, Bengaluru", rating: "4.4", image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=600", price: "₹1,600 for two" },
    { name: "Corner House Ice Cream", cuisine: "Desserts, Ice Cream", location: "Bhilai, Chhattisgarh, Kurud Road, 490001", rating: "4.9", image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?q=80&w=600", price: "₹400 for two" }
  ];

  // Like Your Shop static Nightlife list
  const nightlifeSpots = [
    { name: "Byg Brewski Brewing Company", cuisine: "Finger Food, Craft Beer", location: "Hennur, Bengaluru", rating: "4.7", image: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?q=80&w=600", price: "₹2,200 for two" },
    { name: "Social", cuisine: "American, North Indian, Cocktails", location: "Church Street, Bengaluru", rating: "4.5", image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=600", price: "₹1,400 for two" },
    { name: "XOOX Brewmill", cuisine: "Modern Indian, Craft Beer", location: "Koramangala, Bengaluru", rating: "4.6", image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=600", price: "₹1,800 for two" },
    { name: "Hard Rock Cafe", cuisine: "American, Burgers, Cocktails", location: "St. Marks Road, Bengaluru", rating: "4.6", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600", price: "₹2,000 for two" }
  ];

  const handleCardClick = (mode) => {
    setViewMode(mode);
    // Scroll smoothly to navigation anchor
    setTimeout(() => {
      document.getElementById('lys-tab-anchor')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="lys-homepage-root">
      
      {/* 1. HERO LANDING SECTION (Only displayed in 'landing' viewMode) */}
      {viewMode === 'landing' && (
        <div className="lys-hero-banner">
          <div className="hero-dark-overlay"></div>
          
          <div className="hero-banner-content">
            <h1 className="hero-zomato-title">zomato</h1>
            <p className="hero-zomato-tagline">
              Discover the best food & drinks in Bhilai
            </p>

            {/* Huge Search Box */}
            <div className="hero-search-container">
              <div className="hero-loc-box">
                <span className="loc-icon">📍</span>
                <span className="loc-text">Bhilai, Chhattisgarh, Kurud Road, 490001</span>
                <span className="loc-chevron">▼</span>
              </div>
              <div className="hero-search-separator"></div>
              <div className="hero-input-box">
                <span className="lens-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search for cuisines, dishes or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCardClick('delivery');
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation Anchor */}
      <div id="lys-tab-anchor"></div>

      {/* 2. LANDING PAGE MAIN CARDS */}
      <div className="lys-main-container">
        
        {/* Navigation Mode Cards */}
        <div className="lys-feature-cards-grid">
          <div 
            className={`lys-nav-card ${viewMode === 'delivery' ? 'active' : ''}`}
            onClick={() => setViewMode('delivery')}
          >
            <div className="card-image-box del-card-bg"></div>
            <div className="card-meta-box">
              <h3>Order Online</h3>
              <p>Stay home and order to your doorstep</p>
            </div>
          </div>

          <div 
            className={`lys-nav-card ${viewMode === 'dining' ? 'active' : ''}`}
            onClick={() => setViewMode('dining')}
          >
            <div className="card-image-box dine-card-bg"></div>
            <div className="card-meta-box">
              <h3>Dining Out</h3>
              <p>View the city's favourite dining venues</p>
            </div>
          </div>

          <div 
            className={`lys-nav-card ${viewMode === 'nightlife' ? 'active' : ''}`}
            onClick={() => setViewMode('nightlife')}
          >
            <div className="card-image-box night-card-bg"></div>
            <div className="card-meta-box">
              <h3>Nightlife and Clubs</h3>
              <p>Explore the city's top nightlife outlets</p>
            </div>
          </div>
        </div>

        {/* 3. DYNAMIC SUB-VIEWS */}
        {viewMode === 'delivery' && (
          <div className="lys-delivery-view-layout">
            
            {/* Quick Filter Pills Row */}
            <div className="lys-filter-pills-row">
              <button 
                className={`filter-pill-btn ${filterRating ? 'active' : ''}`}
                onClick={() => setFilterRating(!filterRating)}
              >
                Rating: 4.7+ ⭐
              </button>
              <button 
                className={`filter-pill-btn ${filterPureVeg ? 'active' : ''}`}
                onClick={() => setFilterPureVeg(!filterPureVeg)}
              >
                Pure Veg 🌱
              </button>
              <div className="filter-sort-select-wrapper">
                <span className="sort-icon">⇅</span>
                <select 
                  value={sortByPrice} 
                  onChange={(e) => setSortByPrice(e.target.value)}
                  className="filter-sort-dropdown"
                >
                  <option value="none">Sort by Price</option>
                  <option value="low-high">Price: Low to High</option>
                  <option value="high-low">Price: High to Low</option>
                </select>
              </div>
              {searchQuery && (
                <span className="search-active-pill">
                  Search: "{searchQuery}" <button onClick={() => setSearchQuery('')}>✕</button>
                </span>
              )}
            </div>

            {/* Sidebar + Product Grid layout */}
            <div className="lys-delivery-split-grid">
              
              {/* Left Sidebar Category Menu */}
              <aside className="lys-left-sidebar">
                <h3>Cuisines / Categories</h3>
                <div className="sidebar-links-stack">
                  {['All', ...categoriesList.map(c => typeof c === 'string' ? c : c.name)].map(cat => (
                    <button
                      key={cat}
                      className={`sidebar-cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat === 'All' ? '🍽️ All Cuisines' : 
                       cat === 'Pizza' ? '🍕 Pizzas' :
                       cat === 'Burger' ? '🍔 Burgers' :
                       cat === 'Food' ? '🍛 Main Courses' :
                       cat === 'Drinks' ? '🥤 Beverages' : '🍰 Desserts'}
                    </button>
                  ))}
                </div>
              </aside>

              {/* Right Side Products list */}
              <main className="lys-products-container">
                <h2 className="delivery-catalog-title">
                  Order Food Online in Bhilai, Chhattisgarh, Kurud Road, 490001
                </h2>

                {loading ? (
                  <div className="lys-loading-spin">
                    <div className="lys-spinner"></div>
                    <p>Fetching freshly cooked dishes...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="lys-no-products">
                    <span>🍲</span>
                    <h3>No matching dishes found in our kitchen catalog.</h3>
                    <button 
                      onClick={() => { setSelectedCategory('All'); setSearchQuery(''); setFilterRating(false); setFilterPureVeg(false); setSortByPrice('none'); }} 
                      className="reset-filters-btn"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <div className="lys-restaurant-grid">
                    {filteredProducts.map(prod => (
                      <div className="lys-dish-card" key={prod.id}>
                        <div className="dish-card-img-box" style={{ backgroundImage: `url(${prod.image})` }}>
                          <span className="dish-time-badge">30 min</span>
                          <span className={`dish-veg-badge ${!prod.name.toLowerCase().includes('chicken') && !prod.name.toLowerCase().includes('pepperoni') && !prod.name.toLowerCase().includes('meatball') && !prod.name.toLowerCase().includes('bacon') && !prod.name.toLowerCase().includes('fish') && !prod.name.toLowerCase().includes('beef') && !prod.name.toLowerCase().includes('lamb') && !prod.name.toLowerCase().includes('pork') ? 'veg' : 'nonveg'}`}>
                            ●
                          </span>
                        </div>
                        <div className="dish-card-details">
                          <div className="dish-title-row">
                            <h3>{prod.name}</h3>
                            <span className="dish-rating-badge">{prod.rating} ★</span>
                          </div>
                          <p className="dish-card-desc">{prod.description}</p>
                          <div className="dish-price-row">
                            <span className="dish-price-text">
                              {settings.currencySymbol || '₹'}{prod.price} for one
                            </span>
                            <button 
                              className="lys-add-to-cart-action-btn"
                              onClick={() => handleAddToCart(prod)}
                            >
                              Add +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </main>

            </div>

          </div>
        )}

        {/* B. DINING OUT MODE VIEW */}
        {viewMode === 'dining' && (
          <div className="lys-dining-view-layout">
            <h2>Trending Dining Restaurants in Bengaluru</h2>
            <p className="dining-view-subtext">Book table reservations and view popular menus nearby</p>
            <div className="lys-restaurant-grid">
              {diningOutSpots.map((spot, idx) => (
                <div 
                  className="lys-dish-card dining-spot-card" 
                  key={idx}
                  onClick={() => triggerToast(`Table reservation booked successfully for ${spot.name}! 🎟️`, 'success')}
                >
                  <div className="dish-card-img-box" style={{ backgroundImage: `url(${spot.image})` }}>
                    <span className="dish-time-badge">Book Table</span>
                  </div>
                  <div className="dish-card-details">
                    <div className="dish-title-row">
                      <h3>{spot.name}</h3>
                      <span className="dish-rating-badge green">{spot.rating} ★</span>
                    </div>
                    <p className="dining-cuisines-text">{spot.cuisine}</p>
                    <div className="dining-location-row">
                      <span>📍 {spot.location}</span>
                      <strong className="dining-price-text">{spot.price}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* C. NIGHTLIFE MODE VIEW */}
        {viewMode === 'nightlife' && (
          <div className="lys-dining-view-layout">
            <h2>Nightlife & Club Outlets in Bengaluru</h2>
            <p className="dining-view-subtext">Discover top pubs, bars, breweries, and night lounges</p>
            <div className="lys-restaurant-grid">
              {nightlifeSpots.map((spot, idx) => (
                <div 
                  className="lys-dish-card dining-spot-card" 
                  key={idx}
                  onClick={() => triggerToast(`Guestlist entry confirmed for ${spot.name}! 🍹`, 'success')}
                >
                  <div className="dish-card-img-box" style={{ backgroundImage: `url(${spot.image})` }}>
                    <span className="dish-time-badge">Guestlist Active</span>
                  </div>
                  <div className="dish-card-details">
                    <div className="dish-title-row">
                      <h3>{spot.name}</h3>
                      <span className="dish-rating-badge yellow">{spot.rating} ★</span>
                    </div>
                    <p className="dining-cuisines-text">{spot.cuisine}</p>
                    <div className="dining-location-row">
                      <span>📍 {spot.location}</span>
                      <strong className="dining-price-text">{spot.price}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 4. SHOPPING CART CHECKOUT DRAWER */}
      <div className={`cart-drawer-backdrop ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)}>
        <div className="cart-drawer-sheet" onClick={(e) => e.stopPropagation()}>
          <div className="cart-drawer-header">
            <h2>🛒 My Basket ({cart.length} items)</h2>
            <button className="cart-drawer-close" onClick={() => setCartOpen(false)}>✕</button>
          </div>

          {isOrdered ? (
            <div className="cart-success-screen">
              <span className="success-emoji">🛵</span>
              <h2>Order Placed Successfully!</h2>
              <p>Your delivery driver is arriving soon. Follow kitchen updates live!</p>
              <div className="order-id-box">
                Order ID: <strong>{placedOrderId}</strong>
              </div>
              <button 
                onClick={() => { setIsOrdered(false); setCartOpen(false); navigate('/dashboard'); }} 
                className="lys-checkout-btn"
                style={{ width: '100%', marginTop: '20px' }}
              >
                Track Live Delivery 🛵
              </button>
            </div>
          ) : cart.length === 0 ? (
            <div className="cart-empty-screen">
              <span className="empty-cart-icon">🛒</span>
              <h3>No items in basket.</h3>
              <p>Select delicious dishes from our delivery menu catalog to checkout!</p>
              <button onClick={() => setCartOpen(false)} className="lys-checkout-btn" style={{ marginTop: '20px', width: '100%' }}>Continue Ordering</button>
            </div>
          ) : (
            <div className="cart-items-viewport">
              <div className="cart-items-list">
                {cart.map(item => (
                  <div className="cart-item-row" key={item.id}>
                    <div className="cart-item-thumb" style={{ backgroundImage: `url(${item.image})` }}></div>
                    <div className="cart-item-details">
                      <h4>{item.name}</h4>
                      <span className="cart-item-unit-price">{settings.currencySymbol || '₹'}{item.price} each</span>
                      <div className="cart-item-qty-row">
                        <div className="qty-controls">
                          <button onClick={() => handleUpdateQuantity(item.id, -1)} className="qty-btn">−</button>
                          <span className="qty-val">{item.quantity}</span>
                          <button onClick={() => handleUpdateQuantity(item.id, 1)} className="qty-btn">＋</button>
                        </div>
                        <button onClick={() => handleRemoveItem(item.id)} className="cart-item-remove-btn">Remove</button>
                      </div>
                    </div>
                    <span className="cart-item-total-price">{settings.currencySymbol || '₹'}{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Coupon Form */}
              <div className="coupon-box-wrapper">
                <h4>🏷️ Apply Coupon Code</h4>
                {appliedCoupon ? (
                  <div className="applied-coupon-display">
                    <span>Active: <strong>{appliedCoupon.code}</strong> (
                      {appliedCoupon.type === 'percent' ? `${appliedCoupon.discountPercent}% Off` : 'Free Delivery'}
                    )</span>
                    <button className="remove-coupon-btn" onClick={handleRemoveCoupon}>✕</button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="coupon-apply-form">
                    <input 
                      type="text" 
                      placeholder="Try PIZZA20, WELCOME10, FREEDEL..." 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button type="submit">Apply</button>
                  </form>
                )}
              </div>

              {/* Order Checkout Form */}
              <form onSubmit={handlePlaceOrder} className="checkout-form-container">
                <div className="cart-subtotal-block">
                  <div className="subtotal-row">
                    <span>Subtotal:</span>
                    <strong>{settings.currencySymbol || '₹'}{cartSubtotal}</strong>
                  </div>
                  {appliedCoupon && appliedCoupon.type === 'percent' && (
                    <div className="subtotal-row coupon-savings-row">
                      <span>Coupon Discount ({appliedCoupon.code}):</span>
                      <strong>−{settings.currencySymbol || '₹'}{discountAmount}</strong>
                    </div>
                  )}
                  <div className="subtotal-row">
                    <span>GST & Delivery Fee ({settings.gstPercentage}%):</span>
                    <strong>{settings.currencySymbol || '₹'}{deliveryCharges}</strong>
                  </div>
                  <div className="subtotal-row total-amount-row">
                    <span>Grand Total:</span>
                    <strong>{settings.currencySymbol || '₹'}{grandTotal}</strong>
                  </div>
                </div>

                <div className="checkout-inputs-block">
                  <h3>🚚 Delivery Details</h3>
                  
                  <div className="checkout-field">
                    <label>Recipient Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      placeholder="Recipient Full Name" 
                      value={checkoutData.name} 
                      onChange={handleCheckoutChange} 
                      required 
                    />
                  </div>
                  
                  <div className="checkout-field">
                    <label>Contact Number</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      placeholder="+91 Mobile number" 
                      value={checkoutData.phone} 
                      onChange={handleCheckoutChange} 
                      required 
                    />
                  </div>

                  <div className="checkout-field">
                    <label>Delivery Address</label>
                    <textarea 
                      name="address" 
                      rows="2" 
                      placeholder="Flat/House No, Building, Area, landmark..." 
                      value={checkoutData.address} 
                      onChange={handleCheckoutChange} 
                      required 
                    ></textarea>
                  </div>

                  <div className="checkout-field">
                    <label>Driver Instructions (Optional)</label>
                    <input 
                      type="text" 
                      name="notes" 
                      placeholder="e.g. Leave at gate, Ring bell..." 
                      value={checkoutData.notes} 
                      onChange={handleCheckoutChange} 
                    />
                  </div>

                  {/* Payment Mode Selector */}
                  <div className="checkout-payment-methods-box" style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '15px' }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '800', color: 'white' }}>💳 Payment Method</h3>
                    
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13.5px', color: 'rgba(255,255,255,0.8)' }}>
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value="COD" 
                          checked={paymentMethod === 'COD'}
                          onChange={() => setPaymentMethod('COD')}
                        />
                        <span>Cash on Delivery (COD)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13.5px', color: 'rgba(255,255,255,0.8)' }}>
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value="Online" 
                          checked={paymentMethod === 'Online'}
                          onChange={() => setPaymentMethod('Online')}
                        />
                        <span>Online Payment</span>
                      </label>
                    </div>

                    {paymentMethod === 'Online' && (
                      <div className="online-payment-details-form" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '5px' }}>
                          {['UPI', 'Card', 'NetBanking', 'Wallet'].map(provider => (
                            <button
                              key={provider}
                              type="button"
                              onClick={() => setOnlineProvider(provider)}
                              style={{
                                background: onlineProvider === provider ? 'rgba(226, 55, 68, 0.15)' : 'rgba(255,255,255,0.02)',
                                border: `1px solid ${onlineProvider === provider ? '#e23744' : 'rgba(255,255,255,0.08)'}`,
                                color: onlineProvider === provider ? '#e23744' : 'rgba(255,255,255,0.6)',
                                padding: '8px 4px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: 700,
                                outline: 'none'
                              }}
                            >
                              {provider === 'Card' ? '💳 Card' : provider === 'UPI' ? '📱 UPI' : provider === 'NetBanking' ? '🏦 Bank' : '👛 Wallet'}
                            </button>
                          ))}
                        </div>

                        {onlineProvider === 'UPI' && (
                          <div className="checkout-field" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Enter UPI ID</label>
                            <input 
                              type="text" 
                              placeholder="e.g. name@upi"
                              value={paymentDetails.upiId}
                              onChange={(e) => setPaymentDetails(prev => ({ ...prev, upiId: e.target.value }))}
                              style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white', marginTop: '4px' }}
                              required={paymentMethod === 'Online' && onlineProvider === 'UPI'}
                            />
                          </div>
                        )}

                        {onlineProvider === 'Card' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div className="checkout-field" style={{ marginBottom: 0 }}>
                              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Card Number</label>
                              <input 
                                type="text" 
                                placeholder="4111 2222 3333 4444"
                                maxLength="19"
                                value={paymentDetails.cardNumber}
                                onChange={(e) => {
                                  // Format card spacing
                                  const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                                  setPaymentDetails(prev => ({ ...prev, cardNumber: val }));
                                }}
                                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white', marginTop: '4px' }}
                                required={paymentMethod === 'Online' && onlineProvider === 'Card'}
                              />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                              <div className="checkout-field" style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Expiry (MM/YY)</label>
                                <input 
                                  type="text" 
                                  placeholder="12/28"
                                  maxLength="5"
                                  value={paymentDetails.cardExpiry}
                                  onChange={(e) => {
                                    let val = e.target.value.replace(/\D/g, '');
                                    if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                                    setPaymentDetails(prev => ({ ...prev, cardExpiry: val }));
                                  }}
                                  style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white', marginTop: '4px' }}
                                  required={paymentMethod === 'Online' && onlineProvider === 'Card'}
                                />
                              </div>
                              <div className="checkout-field" style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>CVV</label>
                                <input 
                                  type="password" 
                                  placeholder="•••"
                                  maxLength="3"
                                  value={paymentDetails.cardCvv}
                                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardCvv: e.target.value.replace(/\D/g, '') }))}
                                  style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white', marginTop: '4px' }}
                                  required={paymentMethod === 'Online' && onlineProvider === 'Card'}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {onlineProvider === 'NetBanking' && (
                          <div className="checkout-field" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Select Bank</label>
                            <select 
                              value={paymentDetails.bankName}
                              onChange={(e) => setPaymentDetails(prev => ({ ...prev, bankName: e.target.value }))}
                              style={{ width: '100%', padding: '10px', background: 'rgba(25, 20, 35, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white', marginTop: '4px' }}
                            >
                              <option value="State Bank of India">State Bank of India (SBI)</option>
                              <option value="HDFC Bank">HDFC Bank</option>
                              <option value="ICICI Bank">ICICI Bank</option>
                              <option value="Axis Bank">Axis Bank</option>
                              <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                            </select>
                          </div>
                        )}

                        {onlineProvider === 'Wallet' && (
                          <div className="checkout-field" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Select Wallet</label>
                            <select 
                              value={paymentDetails.walletName}
                              onChange={(e) => setPaymentDetails(prev => ({ ...prev, walletName: e.target.value }))}
                              style={{ width: '100%', padding: '10px', background: 'rgba(25, 20, 35, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white', marginTop: '4px' }}
                            >
                              <option value="Paytm">Paytm</option>
                              <option value="PhonePe">PhonePe</option>
                              <option value="Amazon Pay">Amazon Pay</option>
                              <option value="MobiKwik">MobiKwik</option>
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {settings.storeStatus === 'Closed' && (
                    <div className="store-closed-banner-red">
                      ⚠️ Kitchen is closed. We are not accepting orders at this time.
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  className={`lys-checkout-btn ${settings.storeStatus === 'Closed' ? 'disabled' : ''}`}
                  disabled={settings.storeStatus === 'Closed'}
                >
                  {settings.storeStatus === 'Closed' 
                    ? 'Store Closed 🔒' 
                    : `Place Order (₹${grandTotal}) ⚡`
                  }
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Home;