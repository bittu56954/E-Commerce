import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from './AnimatedBackground';
import { triggerToast } from './Toast';
import './AdminPanel.css';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [adminData, setAdminData] = useState({
    stats: { totalOrders: 0, totalRevenue: 0, pendingOrders: 0, completedOrders: 0, totalUsers: 0 },
    orders: [],
    contacts: [],
    logs: []
  });
  const [productsList, setProductsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');

  // Store & Settings forms state
  const [settingsForm, setSettingsForm] = useState({
    storeName: 'zomato',
    currencySymbol: '₹',
    gstPercentage: 5,
    storeStatus: 'Open',
    heroTitle: 'Gourmet Platters, At Your Doorstep.',
    heroSubtitle: 'Experience food delivery simplified. Browse gourmet recipes, apply premium discounts, and track cooking preparation streams live!',
    backgrounds: {
      home: '',
      about: '',
      contact: '',
      register: '',
      login: '',
      dashboard: '',
      admin: ''
    }
  });

  // Product CRUD form state
  const [formOpen, setFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [productForm, setProductForm] = useState({
    id: null,
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    rating: '5.0'
  });

  // Category CRUD form state
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [categoryEditing, setCategoryEditing] = useState(false);
  const [catForm, setCatForm] = useState({
    id: null,
    name: '',
    icon: '🍕'
  });

  const fetchAdminData = async (token) => {
    try {
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setAdminData(data);
      }
    } catch (error) {
      console.error('Failed to load admin stats:', error);
    }
  };

  const fetchProductsList = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (response.ok) {
        setProductsList(data.products);
      }
    } catch (error) {
      console.error('Failed to load menu products:', error);
    }
  };

  const fetchCategoriesList = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (response.ok) {
        setCategoriesList(data.categories || []);
        // Seed first category name into product form if empty
        if (data.categories && data.categories.length > 0) {
          setProductForm(prev => ({ ...prev, category: prev.category || data.categories[0].name }));
        }
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const fetchUsersList = async (token) => {
    try {
      const response = await fetch('/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setUsersList(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users registry:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (response.ok && data.settings) {
        setSettingsForm(data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch store settings:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    if (!token || !userString) {
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userString);
      if (!parsedUser.isAdmin) {
        navigate('/dashboard');
        return;
      }
      setAdminUser(parsedUser);
      
      const loadAllData = async () => {
        setLoading(true);
        await fetchAdminData(token);
        await fetchProductsList();
        await fetchCategoriesList();
        await fetchUsersList(token);
        await fetchSettings();
        setLoading(false);
      };
      loadAllData();
    } catch (e) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate]);

  // Order status updates
  const handleUpdateStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (response.ok) {
        triggerToast(data.message || 'Status updated.', 'success');
        fetchAdminData(token);
      } else {
        triggerToast(data.error || 'Failed to update status.', 'error');
      }
    } catch (error) {
      console.error('Update status error:', error);
      triggerToast('Error updating status.', 'error');
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm(`Are you sure you want to delete order "${id}"?`)) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        triggerToast(data.message || 'Order record removed.', 'success');
        fetchAdminData(token);
      } else {
        triggerToast(data.error || 'Failed to delete order.', 'error');
      }
    } catch (error) {
      console.error('Delete order error:', error);
      triggerToast('Error deleting order.', 'error');
    }
  };

  const handleDeleteMessage = async (id, senderName) => {
    if (!window.confirm(`Are you sure you want to delete support ticket from "${senderName}"?`)) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        triggerToast(data.message || 'Ticket deleted.', 'success');
        fetchAdminData(token);
      } else {
        triggerToast(data.error || 'Failed to delete message.', 'error');
      }
    } catch (error) {
      console.error('Delete message error:', error);
      triggerToast('Error deleting message.', 'error');
    }
  };

  // Product CRUD Action Handlers
  const handleProductFormSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!productForm.name || !productForm.price || !productForm.category || !productForm.image) {
      triggerToast('Please fill out all required fields.', 'warning');
      return;
    }

    const payload = {
      name: productForm.name,
      description: productForm.description,
      price: Number(productForm.price),
      category: productForm.category,
      image: productForm.image,
      rating: parseFloat(productForm.rating) || 5.0
    };

    try {
      let response;
      if (isEditing) {
        response = await fetch(`/api/products/${productForm.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await response.json();
      if (!response.ok) {
        triggerToast(data.error || 'Failed to save product.', 'error');
        return;
      }

      triggerToast(data.message || 'Product catalog updated.', 'success');
      setProductForm({ id: null, name: '', description: '', price: '', category: categoriesList[0]?.name || 'Pizza', image: '', rating: '5.0' });
      setIsEditing(false);
      setFormOpen(false);
      fetchProductsList();
    } catch (error) {
      console.error('Save product error:', error);
      triggerToast('Failed to save product details.', 'error');
    }
  };

  const handleEditProductClick = (prod) => {
    setProductForm({
      id: prod.id,
      name: prod.name,
      description: prod.description,
      price: prod.price,
      category: prod.category,
      image: prod.image,
      rating: prod.rating.toString()
    });
    setIsEditing(true);
    setFormOpen(true);
  };

  const handleDeleteProductClick = async (productId, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from inventory?`)) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        triggerToast(data.error || 'Failed to delete product.', 'error');
        return;
      }

      triggerToast('Product deleted from inventory catalog.', 'success');
      fetchProductsList();
    } catch (error) {
      console.error('Delete product error:', error);
      triggerToast('Failed to delete product.', 'error');
    }
  };

  const handleOpenAddForm = () => {
    setProductForm({ id: null, name: '', description: '', price: '', category: categoriesList[0]?.name || 'Pizza', image: '', rating: '5.0' });
    setIsEditing(false);
    setFormOpen(true);
  };

  // Category CRUD Action Handlers
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!catForm.name || !catForm.icon) {
      triggerToast('Please provide both category name and emoji icon.', 'warning');
      return;
    }

    try {
      let response;
      if (categoryEditing) {
        response = await fetch(`/api/categories/${catForm.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name: catForm.name, icon: catForm.icon })
        });
      } else {
        response = await fetch('/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name: catForm.name, icon: catForm.icon })
        });
      }

      const data = await response.json();
      if (response.ok) {
        triggerToast(categoryEditing ? 'Category updated!' : 'Category created successfully!', 'success');
        setCatForm({ id: null, name: '', icon: '🍕' });
        setCategoryEditing(false);
        setCategoryFormOpen(false);
        fetchCategoriesList();
      } else {
        triggerToast(data.error || 'Failed to save category.', 'error');
      }
    } catch (error) {
      console.error('Save category error:', error);
      triggerToast('Network error while saving category.', 'error');
    }
  };

  const handleEditCategoryClick = (cat) => {
    setCatForm({
      id: cat.id,
      name: cat.name,
      icon: cat.icon
    });
    setCategoryEditing(true);
    setCategoryFormOpen(true);
  };

  const handleDeleteCategoryClick = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"? This will modify filter grids.`)) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        triggerToast('Category deleted successfully.', 'success');
        fetchCategoriesList();
      } else {
        triggerToast(data.error || 'Failed to delete category.', 'error');
      }
    } catch (error) {
      console.error('Delete category error:', error);
      triggerToast('Network error deleting category.', 'error');
    }
  };

  // User Deletion Handler
  const handleDeleteUser = async (userId, name, email) => {
    if (userId === 'admin' || email === 'admin@zomato.com') {
      triggerToast('Cannot delete the root administrator!', 'warning');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user "${name}" (${email})?`)) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        triggerToast('Customer account removed from registry.', 'success');
        fetchUsersList(token);
        fetchAdminData(token); // Refresh totals stats
      } else {
        triggerToast(data.error || 'Failed to delete user.', 'error');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      triggerToast('Error communicating user deletion.', 'error');
    }
  };

  // Settings Save Handler
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settingsForm)
      });

      const data = await response.json();
      if (response.ok) {
        triggerToast('Global configurations stored successfully! ⚙️', 'success');
        window.dispatchEvent(new CustomEvent('settingsChange', { detail: data.settings }));
      } else {
        triggerToast(data.error || 'Failed to persist settings.', 'error');
      }
    } catch (error) {
      console.error('Settings update error:', error);
      triggerToast('Error saving store configurations.', 'error');
    }
  };

  const handleBackgroundChange = (key, value) => {
    setSettingsForm(prev => ({
      ...prev,
      backgrounds: {
        ...prev.backgrounds,
        [key]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="admin-panel-system" style={{ justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="live-pulse" style={{ width: '40px', height: '40px' }}></div>
        <h2>Synchronizing E-Commerce Administration Console...</h2>
      </div>
    );
  }

  // Analytics Metrics calculations
  const orders = adminData.orders || [];
  const totalOrdersCount = orders.length;
  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const preparingCount = orders.filter(o => o.status === 'Preparing').length;
  const shippingCount = orders.filter(o => o.status === 'Out for Delivery').length;
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;
  const cancelledCount = orders.filter(o => o.status === 'Cancelled').length;

  const cookingOrPendingCount = pendingCount + preparingCount + shippingCount;
  const totalRevenueVal = adminData.stats.totalRevenue || 0;
  const avgOrderValue = deliveredCount > 0 ? Math.round(totalRevenueVal / deliveredCount) : 0;

  return (
    <div className="admin-panel-system">
      <AnimatedBackground page="admin" />

      <main className="admin-viewport-main">
        <header className="admin-top-header">
          <div className="header-meta-left">
            <h1>🛡️ "{settingsForm.storeName}" Store Operations Desk</h1>
            <p>Admin Authorization: <strong>{adminUser?.name || 'Shop Manager'}</strong> | Persistent JSON DB Active</p>
          </div>
          <div className="header-meta-right">
            <span className="root-indicator">SECURE ADMIN PORT</span>
          </div>
        </header>

        {/* Global Statistics Grid */}
        <section className="admin-stats-ribbon">
          <div className="admin-metric-card" onClick={() => setActiveSection('dashboard')}>
            <span className="card-badge orange">💰</span>
            <div>
              <p>Total Revenue (Delivered)</p>
              <strong>{settingsForm.currencySymbol}{totalRevenueVal}</strong>
            </div>
          </div>
          <div className="admin-metric-card" onClick={() => setActiveSection('orders')}>
            <span className="card-badge blue">👩‍🍳</span>
            <div>
              <p>Active Orders (In Progress)</p>
              <strong>{cookingOrPendingCount} Orders</strong>
            </div>
          </div>
          <div className="admin-metric-card" onClick={() => setActiveSection('inventory')}>
            <span className="card-badge green">🍔</span>
            <div>
              <p>Dishes Catalog</p>
              <strong>{productsList.length} Recipes</strong>
            </div>
          </div>
          <div className="admin-metric-card" onClick={() => setActiveSection('users')}>
            <span className="card-badge purple">👥</span>
            <div>
              <p>Registered Customers</p>
              <strong>{usersList.length} Accounts</strong>
            </div>
          </div>
        </section>

        {/* Console Tab Links */}
        <div className="admin-menu-tabs">
          <button 
            className={`admin-tab-btn ${activeSection === 'dashboard' ? 'is-active' : ''}`}
            onClick={() => setActiveSection('dashboard')}
          >
            📊 Analytics
          </button>
          <button 
            className={`admin-tab-btn ${activeSection === 'orders' ? 'is-active' : ''}`}
            onClick={() => setActiveSection('orders')}
          >
            📋 Customer Orders
          </button>
          <button 
            className={`admin-tab-btn ${activeSection === 'inventory' ? 'is-active' : ''}`}
            onClick={() => setActiveSection('inventory')}
          >
            🍔 Inventory
          </button>
          <button 
            className={`admin-tab-btn ${activeSection === 'categories' ? 'is-active' : ''}`}
            onClick={() => setActiveSection('categories')}
          >
            🏷️ Categories
          </button>
          <button 
            className={`admin-tab-btn ${activeSection === 'users' ? 'is-active' : ''}`}
            onClick={() => setActiveSection('users')}
          >
            👥 User Registry
          </button>
          <button 
            className={`admin-tab-btn ${activeSection === 'settings' ? 'is-active' : ''}`}
            onClick={() => setActiveSection('settings')}
          >
            ⚙️ Settings & Backdrop
          </button>
          <button 
            className={`admin-tab-btn ${activeSection === 'contacts' ? 'is-active' : ''}`}
            onClick={() => setActiveSection('contacts')}
          >
            ✉️ Tickets ({adminData.contacts.length})
          </button>
        </div>

        {/* Section Render Blocks */}
        <div className="admin-section-content">
          
          {/* 1. ANALYTICS DASHBOARD */}
          {activeSection === 'dashboard' && (
            <div className="admin-table-panel animated-fade-in">
              <h3>Sales & Operational Performance</h3>
              
              <div className="analytics-metrics-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '30px',
                marginTop: '10px'
              }}>
                <div className="metric-subcard" style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '700', textTransform: 'uppercase' }}>Average Ticket Size</span>
                  <h4 style={{ fontSize: '24px', margin: '8px 0 0 0', fontWeight: '800' }}>{settingsForm.currencySymbol}{avgOrderValue}</h4>
                </div>
                <div className="metric-subcard" style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '700', textTransform: 'uppercase' }}>Delivery Completion</span>
                  <h4 style={{ fontSize: '24px', margin: '8px 0 0 0', fontWeight: '800' }}>
                    {totalOrdersCount > 0 ? Math.round((deliveredCount / totalOrdersCount) * 100) : 0}%
                  </h4>
                </div>
                <div className="metric-subcard" style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '700', textTransform: 'uppercase' }}>Cancellation Ratio</span>
                  <h4 style={{ fontSize: '24px', margin: '8px 0 0 0', fontWeight: '800', color: cancelledCount > 0 ? '#eb4d4b' : 'inherit' }}>
                    {totalOrdersCount > 0 ? Math.round((cancelledCount / totalOrdersCount) * 100) : 0}%
                  </h4>
                </div>
              </div>

              {/* CSS Horizontal Bar Chart */}
              <div className="analytics-chart-container" style={{
                background: 'rgba(0,0,0,0.15)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)',
                marginBottom: '35px'
              }}>
                <h4 style={{ margin: '0 0 20px 0', fontSize: '15px', color: '#e23744', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order Status Volumetric Breakdown</h4>
                
                <div className="chart-bars-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Delivered */}
                  <div className="chart-bar-row" style={{ display: 'grid', gridTemplateColumns: '120px 1fr 100px', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700' }}>😋 Delivered</span>
                    <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #2ecc71, #27ae60)',
                        width: `${totalOrdersCount > 0 ? (deliveredCount / totalOrdersCount) * 100 : 0}%`,
                        borderRadius: '5px',
                        transition: 'width 0.5s ease-out'
                      }}></div>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '800', textAlign: 'right' }}>{deliveredCount} ({totalOrdersCount > 0 ? Math.round((deliveredCount / totalOrdersCount) * 100) : 0}%)</span>
                  </div>

                  {/* Preparing */}
                  <div className="chart-bar-row" style={{ display: 'grid', gridTemplateColumns: '120px 1fr 100px', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700' }}>🍳 Preparing</span>
                    <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #3498db, #2980b9)',
                        width: `${totalOrdersCount > 0 ? (preparingCount / totalOrdersCount) * 100 : 0}%`,
                        borderRadius: '5px',
                        transition: 'width 0.5s ease-out'
                      }}></div>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '800', textAlign: 'right' }}>{preparingCount} ({totalOrdersCount > 0 ? Math.round((preparingCount / totalOrdersCount) * 100) : 0}%)</span>
                  </div>

                  {/* Pending */}
                  <div className="chart-bar-row" style={{ display: 'grid', gridTemplateColumns: '120px 1fr 100px', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700' }}>📝 Pending</span>
                    <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #e23744, #cb202d)',
                        width: `${totalOrdersCount > 0 ? (pendingCount / totalOrdersCount) * 100 : 0}%`,
                        borderRadius: '5px',
                        transition: 'width 0.5s ease-out'
                      }}></div>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '800', textAlign: 'right' }}>{pendingCount} ({totalOrdersCount > 0 ? Math.round((pendingCount / totalOrdersCount) * 100) : 0}%)</span>
                  </div>

                  {/* Shipping */}
                  <div className="chart-bar-row" style={{ display: 'grid', gridTemplateColumns: '120px 1fr 100px', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700' }}>🛵 Shipping</span>
                    <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #9b59b6, #8e44ad)',
                        width: `${totalOrdersCount > 0 ? (shippingCount / totalOrdersCount) * 100 : 0}%`,
                        borderRadius: '5px',
                        transition: 'width 0.5s ease-out'
                      }}></div>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '800', textAlign: 'right' }}>{shippingCount} ({totalOrdersCount > 0 ? Math.round((shippingCount / totalOrdersCount) * 100) : 0}%)</span>
                  </div>

                  {/* Cancelled */}
                  <div className="chart-bar-row" style={{ display: 'grid', gridTemplateColumns: '120px 1fr 100px', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700' }}>❌ Cancelled</span>
                    <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #e74c3c, #c0392b)',
                        width: `${totalOrdersCount > 0 ? (cancelledCount / totalOrdersCount) * 100 : 0}%`,
                        borderRadius: '5px',
                        transition: 'width 0.5s ease-out'
                      }}></div>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '800', textAlign: 'right' }}>{cancelledCount} ({totalOrdersCount > 0 ? Math.round((cancelledCount / totalOrdersCount) * 100) : 0}%)</span>
                  </div>

                </div>
              </div>

              {/* Telemetry Log Streams */}
              <div className="telemetry-logs-section">
                <h4 style={{ color: 'var(--text-muted-override)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>System Operational Telemetry</h4>
                <div className="telemetry-console" style={{
                  background: 'rgba(0,0,0,0.3)',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  padding: '15px',
                  borderRadius: '10px',
                  border: '1.5px solid rgba(255,255,255,0.08)',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  color: '#00ffcc'
                }}>
                  {adminData.logs && adminData.logs.map((log, idx) => (
                    <div key={idx} className={`log-line ${log.type}`} style={{ marginBottom: '6px', opacity: 0.95 }}>
                      <span style={{ color: '#888' }}>[{new Date(log.time).toLocaleTimeString()}]</span> {log.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. CUSTOMER ORDERS LEDGER */}
          {activeSection === 'orders' && (
            <div className="admin-table-panel animated-fade-in">
              <h3>Shop Orders Ledger</h3>
              <div className="admin-table-wrapper">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Customer Details</th>
                      <th>Items Ordered</th>
                      <th>Grand Total</th>
                      <th>Payment & Refund</th>
                      <th>Update Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted-override)' }}>
                          No orders placed in orders.json yet.
                        </td>
                      </tr>
                    ) : (
                      orders.map(order => (
                        <tr key={order.id}>
                          <td><strong>{order.id}</strong></td>
                          <td>{new Date(order.createdAt).toLocaleString()}</td>
                          <td>
                            <strong>{order.customerDetails.name}</strong> <br/>
                            <small>{order.customerDetails.phone}</small> <br/>
                            <small style={{ display: 'inline-block', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.customerDetails.address}</small>
                            {order.customerDetails.notes && (
                              <div style={{ fontSize: '11px', color: '#e23744', marginTop: '4px' }}>📝 Notes: "{order.customerDetails.notes}"</div>
                            )}
                          </td>
                          <td>
                            {order.items.map((item, idx) => (
                              <div key={idx} style={{ fontSize: '12px' }}>
                                {item.name} <strong>x{item.quantity}</strong>
                              </div>
                            ))}
                          </td>
                          <td><strong>{settingsForm.currencySymbol}{order.totalAmount}</strong></td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px' }}>
                              <span>{order.paymentMethod === 'Online' ? `Online (${order.paymentDetails?.methodType || 'Paid'})` : 'COD'}</span>
                              <span style={{ 
                                color: order.paymentStatus === 'Refunded' ? '#eb4d4b' : order.paymentStatus === 'Completed' ? '#2ecc71' : '#f1c40f',
                                fontWeight: 'bold',
                                fontSize: '11px'
                              }}>
                                {order.paymentStatus ? (order.paymentStatus === 'Refunded' ? 'REFUNDED' : order.paymentStatus.toUpperCase()) : 'PENDING'}
                              </span>
                              {order.paymentDetails?.transactionId && (
                                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>Tx: {order.paymentDetails.transactionId}</span>
                              )}
                              {order.refundStatus === 'Completed' && (
                                <span style={{ color: '#eb4d4b', fontSize: '10px', fontWeight: 'bold' }}>Refund Completed</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <select 
                              value={order.status} 
                              onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                              style={{ 
                                padding: '6px 10px', 
                                borderRadius: '20px', 
                                border: '1px solid var(--border-color-override)',
                                outline: 'none',
                                fontFamily: 'inherit',
                                fontSize: '13px',
                                fontWeight: '700',
                                backgroundColor: 'rgba(0,0,0,0.2)',
                                cursor: 'pointer',
                                color: '#fff'
                              }}
                            >
                              <option value="Pending" style={{background:'#2d3436'}}>📝 Pending</option>
                              <option value="Preparing" style={{background:'#2d3436'}}>🍳 Preparing</option>
                              <option value="Out for Delivery" style={{background:'#2d3436'}}>🛵 Out for Delivery</option>
                              <option value="Delivered" style={{background:'#2d3436'}}>😋 Delivered</option>
                              <option value="Cancelled" style={{background:'#2d3436'}}>❌ Cancelled</option>
                            </select>
                          </td>
                          <td>
                            <button 
                              onClick={() => handleDeleteOrder(order.id)} 
                              className="action-btn-delete"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. INVENTORY CATALOG */}
          {activeSection === 'inventory' && (
            <div className="admin-table-panel animated-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Product Menu Catalog</h3>
                <button className="add-product-modal-btn" onClick={handleOpenAddForm}>
                  ➕ Add New Dish
                </button>
              </div>

              {/* Collapsible Add/Edit Form Card */}
              {formOpen && (
                <div className="product-form-backdrop">
                  <div className="product-form-card">
                    <h4>{isEditing ? '📝 Edit Dish Details' : '➕ Add New Recipe'}</h4>
                    <form onSubmit={handleProductFormSubmit}>
                      <div className="form-group-row">
                        <div className="form-field-group">
                          <label>Dish Name *</label>
                          <input 
                            type="text" 
                            placeholder="e.g., Spicy Tandoori Pizza"
                            value={productForm.name}
                            onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                            required 
                          />
                        </div>
                        <div className="form-field-group">
                          <label>Category *</label>
                          <select 
                            value={productForm.category}
                            onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                            required
                          >
                            {categoriesList.map(c => (
                              <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="form-group-row">
                        <div className="form-field-group">
                          <label>Price ({settingsForm.currencySymbol}) *</label>
                          <input 
                            type="number" 
                            placeholder="e.g., 299"
                            value={productForm.price}
                            onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                            required 
                          />
                        </div>
                        <div className="form-field-group">
                          <label>Image URL *</label>
                          <input 
                            type="text" 
                            placeholder="Image URL link"
                            value={productForm.image}
                            onChange={(e) => setProductForm(prev => ({ ...prev, image: e.target.value }))}
                            required 
                          />
                        </div>
                      </div>

                      <div className="form-field-group">
                        <label>Rating (1.0 to 5.0)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          min="1"
                          max="5"
                          placeholder="e.g., 4.8"
                          value={productForm.rating}
                          onChange={(e) => setProductForm(prev => ({ ...prev, rating: e.target.value }))}
                        />
                      </div>

                      <div className="form-field-group">
                        <label>Description / Ingredients</label>
                        <textarea 
                          rows="2"
                          placeholder="Ingredients description..."
                          value={productForm.description}
                          onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                        ></textarea>
                      </div>

                      <div className="form-action-buttons">
                        <button type="button" className="form-cancel-btn" onClick={() => setFormOpen(false)}>Cancel</button>
                        <button type="submit" className="form-submit-btn">Save Product</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="admin-table-wrapper">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Dish Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Rating</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsList.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                          No products seeded in products.json.
                        </td>
                      </tr>
                    ) : (
                      productsList.map(prod => (
                        <tr key={prod.id}>
                          <td>
                            <div className="admin-prod-thumbnail" style={{ backgroundImage: `url(${prod.image})`, width: '50px', height: '50px', borderRadius: '8px', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                          </td>
                          <td><strong>{prod.name}</strong><br/><small style={{color:'rgba(255,255,255,0.4)'}}>{prod.id}</small></td>
                          <td><span className="badge-tag" style={{background:'rgba(226,55,68,0.15)', color:'#e23744', padding:'4px 8px', borderRadius:'12px', fontSize:'11px', fontWeight:'700'}}>{prod.category}</span></td>
                          <td><strong>{settingsForm.currencySymbol}{prod.price}</strong></td>
                          <td>⭐ {prod.rating}</td>
                          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prod.description}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => handleEditProductClick(prod)} className="action-btn-edit" style={{ background: '#e23744', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Edit</button>
                              <button onClick={() => handleDeleteProductClick(prod.id, prod.name)} className="action-btn-delete" style={{ padding: '6px 12px', fontSize: '12px' }}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. CATEGORY MANAGER */}
          {activeSection === 'categories' && (
            <div className="admin-table-panel animated-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Category Filters Manager</h3>
                <button className="add-product-modal-btn" onClick={() => { setCatForm({ id: null, name: '', icon: '🍕' }); setCategoryEditing(false); setCategoryFormOpen(true); }}>
                  ➕ Add New Category
                </button>
              </div>

              {categoryFormOpen && (
                <div className="product-form-backdrop">
                  <div className="product-form-card" style={{ maxWidth: '500px', margin: '0 auto 30px auto' }}>
                    <h4>{categoryEditing ? '🏷️ Edit Food Category' : '🏷️ Create New Category'}</h4>
                    <form onSubmit={handleCategorySubmit}>
                      <div className="form-field-group">
                        <label>Category Label (Name) *</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Desserts, Sizzlers"
                          value={catForm.name}
                          onChange={(e) => setCatForm(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="form-field-group">
                        <label>Emoji Symbol *</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 🍰, 🍕, 🍹"
                          value={catForm.icon}
                          onChange={(e) => setCatForm(prev => ({ ...prev, icon: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="form-action-buttons">
                        <button type="button" className="form-cancel-btn" onClick={() => setCategoryFormOpen(false)}>Cancel</button>
                        <button type="submit" className="form-submit-btn">Save Category</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="admin-table-wrapper">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Icon</th>
                      <th>Category Name</th>
                      <th>Category ID</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoriesList.map(cat => (
                      <tr key={cat.id}>
                        <td style={{ fontSize: '24px' }}>{cat.icon}</td>
                        <td><strong>{cat.name}</strong></td>
                        <td><code>{cat.id}</code></td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleEditCategoryClick(cat)} className="action-btn-edit" style={{ background: '#e23744', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Edit</button>
                            <button onClick={() => handleDeleteCategoryClick(cat.id, cat.name)} className="action-btn-delete" style={{ padding: '6px 12px', fontSize: '12px' }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. USER REGISTRY DIRECTORY */}
          {activeSection === 'users' && (
            <div className="admin-table-panel animated-fade-in">
              <h3>Registered Customer Directory</h3>
              <div className="admin-table-wrapper">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Account ID</th>
                      <th>Full Name</th>
                      <th>Email Address</th>
                      <th>Phone Number</th>
                      <th>Current Location</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map(usr => (
                      <tr key={usr.id}>
                        <td><code>{usr.id}</code></td>
                        <td><strong>{usr.name}</strong></td>
                        <td>{usr.email}</td>
                        <td>{usr.phone || '—'}</td>
                        <td>{usr.currentLocation || '—'}</td>
                        <td>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '700',
                            background: usr.isAdmin ? 'rgba(235, 77, 75, 0.15)' : 'rgba(255,255,255,0.05)',
                            color: usr.isAdmin ? '#eb4d4b' : 'inherit'
                          }}>
                            {usr.isAdmin ? 'Root Admin 🛡️' : 'Customer'}
                          </span>
                        </td>
                        <td>
                          {usr.id !== 'admin' && usr.email !== 'admin@zomato.com' ? (
                            <button onClick={() => handleDeleteUser(usr.id, usr.name, usr.email)} className="action-btn-delete">
                              Delete
                            </button>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Protected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. SETTINGS PANEL & BACKDROP WALLPAPERS */}
          {activeSection === 'settings' && (
            <div className="admin-table-panel animated-fade-in">
              <h3>Global Configuration Settings</h3>
              <form onSubmit={handleSettingsSubmit} className="settings-grid-form" style={{ marginTop: '20px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', marginBottom: '30px' }}>
                  
                  {/* Left Column: General parameters */}
                  <div className="settings-card-sub" style={{ background: 'rgba(0,0,0,0.15)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h4 style={{ color: '#e23744', marginTop: 0, marginBottom: '15px', fontSize: '14px', textTransform: 'uppercase' }}>Shop parameters</h4>
                    
                    <div className="form-field-group">
                      <label>Store Branding Name *</label>
                      <input 
                        type="text" 
                        value={settingsForm.storeName}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, storeName: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="form-field-group">
                      <label>Currency Symbol *</label>
                      <input 
                        type="text" 
                        value={settingsForm.currencySymbol}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, currencySymbol: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="form-field-group">
                      <label>GST & Delivery percentage (%) *</label>
                      <input 
                        type="number" 
                        value={settingsForm.gstPercentage}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, gstPercentage: Number(e.target.value) }))}
                        required
                      />
                    </div>

                    <div className="form-field-group">
                      <label>Kitchen Operating Status *</label>
                      <select 
                        value={settingsForm.storeStatus}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, storeStatus: e.target.value }))}
                        required
                      >
                        <option value="Open">🟢 Open (Checkouts Enabled)</option>
                        <option value="Closed">🔴 Closed (Checkouts Disabled)</option>
                      </select>
                    </div>
                  </div>

                  {/* Right Column: Hero details */}
                  <div className="settings-card-sub" style={{ background: 'rgba(0,0,0,0.15)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h4 style={{ color: '#e23744', marginTop: 0, marginBottom: '15px', fontSize: '14px', textTransform: 'uppercase' }}>Home Hero Banner</h4>
                    
                    <div className="form-field-group">
                      <label>Hero Title *</label>
                      <input 
                        type="text" 
                        value={settingsForm.heroTitle}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, heroTitle: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="form-field-group">
                      <label>Hero Subtitle *</label>
                      <textarea 
                        rows="4" 
                        value={settingsForm.heroSubtitle}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                        required
                      ></textarea>
                    </div>
                  </div>

                </div>

                {/* Bottom Row: Page backgrounds links */}
                <div className="settings-card-sub" style={{ background: 'rgba(0,0,0,0.15)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '30px' }}>
                  <h4 style={{ color: '#e23744', marginTop: 0, marginBottom: '15px', fontSize: '14px', textTransform: 'uppercase' }}>Page backdrop wallpapers links (Dynamic Backgrounds)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
                    
                    <div className="form-field-group">
                      <label>Home Page Wallpaper URL</label>
                      <input 
                        type="text" 
                        value={settingsForm.backgrounds.home || ''}
                        onChange={(e) => handleBackgroundChange('home', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="form-field-group">
                      <label>About Us Page Wallpaper</label>
                      <input 
                        type="text" 
                        value={settingsForm.backgrounds.about || ''}
                        onChange={(e) => handleBackgroundChange('about', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="form-field-group">
                      <label>Help & Support Wallpaper</label>
                      <input 
                        type="text" 
                        value={settingsForm.backgrounds.contact || ''}
                        onChange={(e) => handleBackgroundChange('contact', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="form-field-group">
                      <label>Registration Screen Wallpaper</label>
                      <input 
                        type="text" 
                        value={settingsForm.backgrounds.register || ''}
                        onChange={(e) => handleBackgroundChange('register', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="form-field-group">
                      <label>Login Screen Wallpaper</label>
                      <input 
                        type="text" 
                        value={settingsForm.backgrounds.login || ''}
                        onChange={(e) => handleBackgroundChange('login', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="form-field-group">
                      <label>User Dashboard Wallpaper</label>
                      <input 
                        type="text" 
                        value={settingsForm.backgrounds.dashboard || ''}
                        onChange={(e) => handleBackgroundChange('dashboard', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="form-field-group">
                      <label>Admin Panel Console Wallpaper</label>
                      <input 
                        type="text" 
                        value={settingsForm.backgrounds.admin || ''}
                        onChange={(e) => handleBackgroundChange('admin', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>

                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                  <button type="submit" className="form-submit-btn" style={{ padding: '12px 30px', borderRadius: '30px', fontSize: '14px' }}>
                    💾 Save Configuration Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 7. SUPPORT TICKETS */}
          {activeSection === 'contacts' && (
            <div className="admin-table-panel animated-fade-in">
              <h3>Shop Support Enquiries</h3>
              <div className="admin-table-wrapper">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Sender Name</th>
                      <th>Email / Contact</th>
                      <th>Location</th>
                      <th>Support Message</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminData.contacts.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted-override)' }}>
                          No support tickets logged in contacts.json yet.
                        </td>
                      </tr>
                    ) : (
                      adminData.contacts.map(ticket => (
                        <tr key={ticket.id}>
                          <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                          <td><strong>{ticket.name}</strong></td>
                          <td>{ticket.email} <br/><small>{ticket.phone}</small></td>
                          <td>{ticket.currentLocation}</td>
                          <td style={{ maxWidth: '300px', wordBreak: 'break-all' }}>"{ticket.message}"</td>
                          <td>
                            <button 
                              onClick={() => handleDeleteMessage(ticket.id, ticket.name)} 
                              className="action-btn-delete"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
