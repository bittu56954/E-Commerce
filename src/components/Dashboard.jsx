import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from './AnimatedBackground';
import { triggerToast } from './Toast';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [settings, setSettings] = useState({
    storeName: 'zomato',
    currencySymbol: '₹',
    gstPercentage: 5
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings(data.settings);
        }
      } catch (err) {
        console.error('Fetch settings error:', err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    if (!token || !userString) {
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userString);
      setCurrentUser(parsedUser);
      
      if (parsedUser.isAdmin) {
        navigate('/admin');
        return;
      }
    } catch (e) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
      return;
    }

    const fetchMyOrders = async () => {
      try {
        const response = await fetch('/api/orders/my-orders', {
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
          setOrders(data.orders);
        }
      } catch (error) {
        console.error('Fetch customer orders error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [navigate]);

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        triggerToast(data.error || 'Failed to cancel order.', 'error');
        return;
      }

      triggerToast('Order cancelled successfully.', 'success');
      
      // Update order state locally
      setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
    } catch (error) {
      console.error('Cancel order error:', error);
      triggerToast('Failed to communicate with server.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="ultimate-dashboard-system" style={{ justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="live-pulse" style={{ width: '40px', height: '40px' }}></div>
        <h2>Syncing Delivery Channels...</h2>
      </div>
    );
  }

  // Stats calculations
  const totalOrders = orders.length;
  const totalSpent = orders
    .filter(o => o.status === 'Delivered')
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  
  const activeOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
  const pastOrders = orders.filter(o => o.status === 'Delivered' || o.status === 'Cancelled');

  const getStatusPercentage = (status) => {
    switch (status) {
      case 'Pending': return 15;
      case 'Preparing': return 50;
      case 'Out for Delivery': return 80;
      case 'Delivered': return 100;
      default: return 0;
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'Pending': return 'Awaiting validation in our kitchen loop...';
      case 'Preparing': return 'Our culinary masters are baking your meals!';
      case 'Out for Delivery': return 'Hot fresh food is zooming to your doorstep!';
      case 'Delivered': return 'Delivered! Enjoy your delicious meal!';
      case 'Cancelled': return 'Order was cancelled.';
      default: return '';
    }
  };

  return (
    <div className="ultimate-dashboard-system">
      <AnimatedBackground page="dashboard" />

      <div className="mobile-header-bar">
        <div className="m-logo">🌐 {currentUser ? currentUser.name.toUpperCase() : 'CUSTOMER'} <span className="m-sub">Portal</span></div>
        <button className="hamburger-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? '✕ Close' : '☰ Menu'}
        </button>
      </div>

      <aside className={`dash-sidebar-node ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand-zone">
          <span className="brand-icon">🔴</span>
          <h2>zomato <span className="brand-sub">Hub</span></h2>
        </div>
        
        <nav className="sidebar-navigation-links">
          <button className={`nav-route-btn ${activeTab === 'overview' ? 'is-active' : ''}`} onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}>
            <span className="route-icon">📊</span> Operations Tracker
          </button>
          <button className={`nav-route-btn ${activeTab === 'history' ? 'is-active' : ''}`} onClick={() => { setActiveTab('history'); setMobileMenuOpen(false); }}>
            <span className="route-icon">🚀</span> Order History
          </button>
        </nav>

        <div className="sidebar-auth-profile">
          <div className="avatar-circle-node" style={{ backgroundColor: '#e23744', color: '#fff', fontWeight: 'bold' }}>
            {currentUser ? currentUser.name.substring(0, 2).toUpperCase() : 'CU'}
          </div>
          <div className="avatar-meta-data">
            <h4>{currentUser ? currentUser.name.toUpperCase() : 'CUSTOMER'}</h4>
            <p>{currentUser ? currentUser.email : 'Awaiting sync'}</p>
          </div>
        </div>
      </aside>

      <main className="dash-viewport-main">
        <header className="viewport-top-header">
          <div className="header-meta-left">
            <h1>Customer Dispatch Console</h1>
            <p>Welcome back, <strong>{currentUser ? currentUser.name : 'Customer'}</strong>. Track your dynamic culinary requests here.</p>
          </div>
          <div className="header-meta-right">
            <div className="global-uptime-tag">
              <span className="live-pulse"></span> Order Pipeline Online
            </div>
          </div>
        </header>

        <section className="sticky-metrics-ribbon">
          <div className="ribbon-item">
            <span className="ribbon-dot blue"></span>
            <div><p>Orders Placed</p><strong>{totalOrders} Invoices</strong></div>
          </div>
          <div className="ribbon-item">
            <span className="ribbon-dot green"></span>
            <div><p>Total Purchases</p><strong>₹{totalSpent} Spent</strong></div>
          </div>
          <div className="ribbon-item">
            <span className="ribbon-dot amber"></span>
            <div><p>Active Orders</p><strong>{activeOrders.length} Cooking</strong></div>
          </div>
        </section>

        <div className="dynamic-page-layer-content">
          
          {/* Operations Tracker Overview */}
          {activeTab === 'overview' && (
            <div className="sub-page-animate-fade">
              <div className="page-title-banner">
                <h2>Real-Time Culinary Dispatch Telemetry</h2>
                <p>Tracking your active food requests as they progress through our kitchen line.</p>
              </div>

              {activeOrders.length === 0 ? (
                <div className="deep-scroll-block-panel" style={{ textAlign: 'center', padding: '40px' }}>
                  <span style={{ fontSize: '48px' }}>🍕</span>
                  <h3 style={{ marginTop: '20px' }}>No active orders cooking at this moment.</h3>
                  <p>Satisfy your appetite by placing a fresh order from our delicious menu catalogue!</p>
                  <button onClick={() => navigate('/')} className="primary-cta-btn" style={{ marginTop: '20px' }}>Open Shop Menu</button>
                </div>
              ) : (
                <div className="active-orders-stack" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  {activeOrders.map(order => (
                    <div className="infra-node-card-heavy" key={order.id} style={{ padding: '25px', borderRadius: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
                        <div>
                          <h4 style={{ fontSize: '18px', color: '#e23744', margin: '0 0 5px 0' }}>Order ID: {order.id}</h4>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted-override)' }}>Placed on: {new Date(order.createdAt).toLocaleString()}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className="badge-tag stage-prod" style={{ fontSize: '13px', fontWeight: 'bold' }}>{order.status}</span>
                          <p style={{ margin: '5px 0 0 0', fontSize: '16px', fontWeight: '800' }}>Grand Total: ₹{order.totalAmount}</p>
                          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                            {order.paymentMethod === 'Online' ? `Online (${order.paymentDetails?.methodType || 'Paid'})` : 'Cash on Delivery (COD)'}
                          </p>
                        </div>
                      </div>

                      {/* Interactive Progress Bar */}
                      <div className="progress-pipeline-wrapper" style={{ margin: '30px 0' }}>
                        <div className="progress-bar-container-global" style={{ height: '8px', background: 'rgba(255,255,255,0.1)', position: 'relative' }}>
                          <div 
                            className="progress-fill-node-color" 
                            style={{ 
                              width: `${getStatusPercentage(order.status)}%`, 
                              background: '#e23744',
                              height: '100%',
                              transition: 'width 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)'
                            }}
                          ></div>
                        </div>

                        {/* Tracker Nodes */}
                        <div className="tracker-nodes-flex" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', position: 'relative' }}>
                          <div className={`tracker-node ${getStatusPercentage(order.status) >= 15 ? 'active' : ''}`}>
                            <span className="node-icon">📝</span>
                            <span className="node-lbl">Pending</span>
                          </div>
                          <div className={`tracker-node ${getStatusPercentage(order.status) >= 50 ? 'active' : ''}`}>
                            <span className="node-icon">🍳</span>
                            <span className="node-lbl">Preparing</span>
                          </div>
                          <div className={`tracker-node ${getStatusPercentage(order.status) >= 80 ? 'active' : ''}`}>
                            <span className="node-icon">🛵</span>
                            <span className="node-lbl">On The Way</span>
                          </div>
                          <div className={`tracker-node ${getStatusPercentage(order.status) >= 100 ? 'active' : ''}`}>
                            <span className="node-icon">😋</span>
                            <span className="node-lbl">Delivered</span>
                          </div>
                        </div>
                      </div>

                      <div className="status-message-alert" style={{ background: 'rgba(226, 55, 68, 0.08)', padding: '15px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #e23744', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>Dispatch Telemetry: </strong> {getStatusMessage(order.status)}
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button 
                            onClick={() => setSelectedInvoice(order)} 
                            className="invoice-view-action-btn"
                            style={{
                              background: 'rgba(255, 255, 255, 0.08)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              color: '#fff',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              fontWeight: '700',
                              fontSize: '12px',
                              cursor: 'pointer',
                              transition: 'background 0.2s'
                            }}
                          >
                            📄 View Invoice
                          </button>
                          {order.status === 'Pending' && (
                            <button 
                              onClick={() => handleCancelOrder(order.id)}
                              className="cancel-order-action-btn"
                            >
                              Cancel Order ✕
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Items lists collapsible control */}
                      <div className="order-items-grid-box">
                        <div className="collapsible-header" onClick={() => toggleOrderExpand(order.id)}>
                          <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '800' }}>
                            Ordered Items ({order.items.reduce((sum, i) => sum + i.quantity, 0)})
                          </h5>
                          <button className="expand-chevron-btn">
                            {expandedOrders[order.id] ? '▲ Hide Details' : '▼ View Details'}
                          </button>
                        </div>
                        
                        {expandedOrders[order.id] && (
                          <div className="expanded-items-list-container">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                              {order.items.map((item, idx) => (
                                <div key={idx} className="expanded-item-row-detail">
                                  <div className="item-detail-left">
                                    <div className="detail-thumb" style={{ backgroundImage: `url(${item.image})` }}></div>
                                    <span>{item.name} <strong>x{item.quantity}</strong></span>
                                  </div>
                                  <span>₹{item.price * item.quantity}</span>
                                </div>
                              ))}
                            </div>
                            <div className="checkout-coordinates-footer">
                              <strong>Delivery Address:</strong> {order.customerDetails.address} <br />
                              <strong>Contact Phone:</strong> {order.customerDetails.phone}
                              {order.customerDetails.notes && (
                                <>
                                  <br /><strong>Notes:</strong> <em>{order.customerDetails.notes}</em>
                                </>
                              )}
                              {order.couponApplied && (
                                <>
                                  <br /><strong>Applied Discount:</strong> <span className="green-text">{order.couponApplied} Coupon applied</span>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Order History */}
          {activeTab === 'history' && (
            <div className="sub-page-animate-fade">
              <div className="page-title-banner">
                <h2>Customer Purchase Invoices Directory</h2>
                <p>Verify details, billing figures, and tracking indices of your completed gourmet requests.</p>
              </div>

              <div className="table-wrapper-responsive">
                <table className="enterprise-data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Items Purchased</th>
                      <th>Grand Total</th>
                      <th>Payment & Refund</th>
                      <th>Shipping Address</th>
                      <th>Delivery Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                     {pastOrders.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted-override)' }}>
                          No past orders logged in our archives.
                        </td>
                      </tr>
                    ) : (
                      pastOrders.map(order => (
                        <tr key={order.id}>
                          <td><strong>{order.id}</strong></td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {order.items.map((item, idx) => (
                                <span key={idx} style={{ fontSize: '12px' }}>
                                  {item.name} <strong>x{item.quantity}</strong>
                                </span>
                              ))}
                            </div>
                          </td>
                          <td><strong>₹{order.totalAmount}</strong></td>
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
                              {order.refundStatus === 'Completed' && (
                                <span style={{ color: '#eb4d4b', fontSize: '10px', fontStyle: 'italic' }}>Refund Completed</span>
                              )}
                            </div>
                          </td>
                          <td style={{ maxWidth: '180px', wordBreak: 'break-word', fontSize: '12px' }}>{order.customerDetails.address}</td>
                          <td>
                            <span 
                              className="badge-tag stage-prod" 
                              style={{ 
                                backgroundColor: order.status === 'Cancelled' ? 'rgba(235, 77, 75, 0.15)' : 'rgba(76, 209, 55, 0.15)', 
                                color: order.status === 'Cancelled' ? '#eb4d4b' : '#4cd137' 
                              }}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => setSelectedInvoice(order)}
                              className="invoice-view-action-btn"
                              style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: '#fff',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontWeight: '700',
                                fontSize: '11.5px',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                              }}
                            >
                              📄 View Invoice
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

      {/* 5. INVOICE OVERLAY MODAL */}
      {selectedInvoice && (
        <div className="invoice-overlay-backdrop no-print" onClick={() => setSelectedInvoice(null)}>
          <div className="invoice-overlay-content" onClick={(e) => e.stopPropagation()}>
            <div className="invoice-close-bar">
              <h3>Receipt Invoice for Order {selectedInvoice.id}</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => window.print()} className="invoice-print-btn">🖨️ Print</button>
                <button onClick={() => setSelectedInvoice(null)} className="invoice-close-btn">✕</button>
              </div>
            </div>
            {/* Invoice Table exactly like OrderConfirmation */}
            <div className="lys-invoice-container" style={{ margin: 0, boxShadow: 'none', width: '100%', borderRadius: 0 }}>
              <div className="invoice-header">
                <div className="invoice-company-details">
                  <h2 className="invoice-brand-title">{settings.storeName || 'zomato'}</h2>
                  <p>Premium Culinary Delicacies & Daily Bites</p>
                  <p>Bhilai, Chhattisgarh, Kurud Road, 490001</p>
                  <p>Support: support@zomato.com</p>
                </div>
                <div className="invoice-meta-details">
                  <h1>TAX INVOICE</h1>
                  <p><strong>Invoice No:</strong> ZOMATO-{selectedInvoice.id.slice(0, 8).toUpperCase()}</p>
                  <p><strong>Order ID:</strong> {selectedInvoice.id}</p>
                  <p><strong>Date:</strong> {new Date(selectedInvoice.createdAt).toLocaleString()}</p>
                  <p><strong>Status:</strong> {selectedInvoice.paymentStatus ? (selectedInvoice.paymentStatus === 'Completed' ? 'PAID' : selectedInvoice.paymentStatus.toUpperCase()) : 'PENDING'}</p>
                </div>
              </div>

              <hr className="invoice-divider" style={{ border: 'none', borderTop: '1px solid #ecf0f1', margin: '20px 0' }} />

              <div className="invoice-billing-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '30px' }}>
                <div className="billing-to">
                  <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#95a5a6', margin: '0 0 10px 0' }}>Billed To:</h3>
                  <p style={{ margin: '3px 0', fontSize: '13.5px', color: '#34495e' }}><strong>{selectedInvoice.customerDetails.name}</strong></p>
                  <p style={{ margin: '3px 0', fontSize: '13.5px', color: '#34495e' }}><strong>Phone:</strong> {selectedInvoice.customerDetails.phone}</p>
                  <p style={{ margin: '3px 0', fontSize: '13.5px', color: '#34495e' }}><strong>Delivery Address:</strong></p>
                  <p className="address-text" style={{ color: '#7f8c8d', fontSize: '13px', marginTop: '5px', lineHeight: '1.4' }}>{selectedInvoice.customerDetails.address}</p>
                  {selectedInvoice.customerDetails.notes && (
                    <p className="driver-notes" style={{ background: '#fdf5eb', borderLeft: '3px solid #e23744', padding: '6px 10px', borderRadius: '4px', marginTop: '10px', fontSize: '12.5px', color: '#8a6d3b' }}><strong>Instructions:</strong> {selectedInvoice.customerDetails.notes}</p>
                  )}
                </div>
                <div className="billing-from">
                  <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#95a5a6', margin: '0 0 10px 0' }}>Payment Details:</h3>
                  <p style={{ margin: '3px 0', fontSize: '13.5px', color: '#34495e' }}><strong>Method:</strong> {selectedInvoice.paymentMethod === 'Online' ? `Online Payment` : 'Cash on Delivery (COD)'}</p>
                  {selectedInvoice.paymentDetails && selectedInvoice.paymentDetails.methodType && (
                    <p style={{ margin: '3px 0', fontSize: '13.5px', color: '#34495e' }}><strong>Type:</strong> {selectedInvoice.paymentDetails.methodType}</p>
                  )}
                  {selectedInvoice.paymentDetails && selectedInvoice.paymentDetails.upiId && (
                    <p style={{ margin: '3px 0', fontSize: '13.5px', color: '#34495e' }}><strong>UPI ID:</strong> {selectedInvoice.paymentDetails.upiId}</p>
                  )}
                  {selectedInvoice.paymentDetails && selectedInvoice.paymentDetails.cardLast4 && (
                    <p style={{ margin: '3px 0', fontSize: '13.5px', color: '#34495e' }}><strong>Card:</strong> •••• •••• •••• {selectedInvoice.paymentDetails.cardLast4}</p>
                  )}
                  {selectedInvoice.paymentDetails && selectedInvoice.paymentDetails.bankName && (
                    <p style={{ margin: '3px 0', fontSize: '13.5px', color: '#34495e' }}><strong>Bank:</strong> {selectedInvoice.paymentDetails.bankName}</p>
                  )}
                  {selectedInvoice.paymentDetails && selectedInvoice.paymentDetails.walletName && (
                    <p style={{ margin: '3px 0', fontSize: '13.5px', color: '#34495e' }}><strong>Wallet:</strong> {selectedInvoice.paymentDetails.walletName}</p>
                  )}
                  {selectedInvoice.paymentDetails && selectedInvoice.paymentDetails.transactionId && (
                    <p style={{ margin: '3px 0', fontSize: '13.5px', color: '#34495e' }}><strong>Transaction ID:</strong> {selectedInvoice.paymentDetails.transactionId}</p>
                  )}
                  {selectedInvoice.paymentStatus === 'Refunded' && (
                    <div style={{ marginTop: '10px', background: 'rgba(235, 77, 75, 0.08)', padding: '8px', borderLeft: '3px solid #eb4d4b', borderRadius: '4px' }}>
                      <span style={{ color: '#eb4d4b', fontWeight: 'bold', fontSize: '12px' }}>REFUND COMPLETED</span>
                      {selectedInvoice.refundDetails && (
                        <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#696969' }}>
                          Amount: ₹{selectedInvoice.refundDetails.refundAmount} <br />
                          Processed: {new Date(selectedInvoice.refundDetails.processedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <table className="invoice-items-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: '#34495e' }}>#</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: '#34495e' }}>Dish Name</th>
                    <th className="text-right" style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'right', fontSize: '12px', textTransform: 'uppercase', color: '#34495e' }}>Price</th>
                    <th className="text-center" style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'center', fontSize: '12px', textTransform: 'uppercase', color: '#34495e' }}>Qty</th>
                    <th className="text-right" style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'right', fontSize: '12px', textTransform: 'uppercase', color: '#34495e' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item, index) => (
                    <tr key={item.id || index}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', color: '#2c3e50', fontSize: '13.5px' }}>{index + 1}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', color: '#2c3e50', fontSize: '13.5px' }}>{item.name}</td>
                      <td className="text-right" style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'right', color: '#2c3e50', fontSize: '13.5px' }}>₹{item.price}</td>
                      <td className="text-center" style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', color: '#2c3e50', fontSize: '13.5px' }}>{item.quantity}</td>
                      <td className="text-right" style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'right', color: '#2c3e50', fontSize: '13.5px' }}>₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="invoice-summary-wrapper" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px', alignItems: 'flex-start', marginBottom: '35px' }}>
                <div className="invoice-notes-clause">
                  <p style={{ fontSize: '11px', color: '#95a5a6', margin: '3px 0', lineHeight: '1.4' }}><strong>Terms & Conditions:</strong></p>
                  <p style={{ fontSize: '11px', color: '#95a5a6', margin: '3px 0', lineHeight: '1.4' }}>1. This is a computer-generated tax invoice and requires no physical signature.</p>
                  <p style={{ fontSize: '11px', color: '#95a5a6', margin: '3px 0', lineHeight: '1.4' }}>2. The food products are packed freshly under high hygiene standards.</p>
                  <p style={{ fontSize: '11px', color: '#95a5a6', margin: '3px 0', lineHeight: '1.4' }}>3. Cancellations are only permitted until the order status transitions to Preparing.</p>
                  <p style={{ fontSize: '11px', color: '#95a5a6', margin: '3px 0', lineHeight: '1.4' }}>Thank you for placing your culinary trust in <strong>zomato</strong>! ❤️</p>
                </div>

                <div className="invoice-totals-block" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="totals-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#7f8c8d' }}>
                    <span>Items Subtotal:</span>
                    <span>₹{selectedInvoice.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</span>
                  </div>
                  {selectedInvoice.couponApplied && (
                    <div className="totals-row discount" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#e74c3c', fontWeight: '600' }}>
                      <span>Coupon Discount ({selectedInvoice.couponApplied}):</span>
                      <span>-₹{selectedInvoice.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) - selectedInvoice.totalAmount + Math.round(selectedInvoice.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * (settings.gstPercentage / 100))}</span>
                    </div>
                  )}
                  <div className="totals-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#7f8c8d' }}>
                    <span>GST & Delivery Fee ({settings.gstPercentage}%):</span>
                    <span>₹{Math.round(selectedInvoice.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * (settings.gstPercentage / 100))}</span>
                  </div>
                  <hr className="summary-total-divider" style={{ border: 'none', borderTop: '1px solid #dee2e6', margin: '5px 0' }} />
                  <div className="totals-row grand-total" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '800', color: '#e23744' }}>
                    <span>Grand Total:</span>
                    <span>₹{selectedInvoice.totalAmount}</span>
                  </div>
                </div>
              </div>

              <div className="invoice-footer-branding" style={{ textAlign: 'center', borderTop: '1px solid #ecf0f1', paddingTop: '15px' }}>
                <p style={{ fontSize: '11px', color: '#bdc3c7', margin: 0 }}>© {new Date().getFullYear()} {settings.storeName} Media Private Limited. All Rights Reserved.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;