import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { triggerToast } from './Toast';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    storeName: 'zomato',
    currencySymbol: '₹',
    gstPercentage: 5
  });

  useEffect(() => {
    const fetchOrderAndSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          triggerToast('Please login to view this page.', 'warning');
          navigate('/login');
          return;
        }

        // Fetch settings
        const settingsRes = await fetch('/api/settings');
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData.settings);
        }

        // Fetch order details
        const orderRes = await fetch(`/api/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const orderData = await orderRes.json();

        if (orderRes.ok) {
          setOrder(orderData.order);
        } else {
          triggerToast(orderData.error || 'Failed to retrieve order details.', 'error');
        }
      } catch (err) {
        console.error('Error fetching order confirmation details:', err);
        triggerToast('Could not communicate with the server.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAndSettings();
  }, [orderId, navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="lys-confirm-loading">
        <div className="lys-spinner"></div>
        <p>Loading your invoice receipt...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="lys-confirm-error">
        <span>⚠️</span>
        <h2>Order Not Found</h2>
        <p>We couldn't locate the order details for ID: {orderId}</p>
        <Link to="/" className="lys-confirm-btn">Return to Shop</Link>
      </div>
    );
  }

  const { items, totalAmount, customerDetails, paymentMethod, paymentStatus, paymentDetails, createdAt, id } = order;

  // Calculations for billing details
  const currency = settings.currencySymbol || '₹';
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = order.couponApplied ? (subtotal - totalAmount + Math.round(subtotal * (settings.gstPercentage / 100))) : 0; 
  const taxAmount = Math.round(subtotal * (settings.gstPercentage / 100));

  return (
    <div className="lys-confirm-wrapper">
      <div className="lys-confirm-container no-print">
        {/* Success Card */}
        <div className="lys-confirm-card">
          <div className="success-checkmark-wrapper">
            <svg className="checkmark-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
              <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
          </div>
          <h1 className="success-title">Order Placed Successfully!</h1>
          <p className="success-subtitle">Thank you for shopping with us. Your items are being prepared by the kitchen.</p>

          <div className="confirm-order-meta">
            <div className="meta-row">
              <span>Order Reference ID:</span>
              <strong>{id}</strong>
            </div>
            <div className="meta-row">
              <span>Estimated Delivery:</span>
              <strong>30-40 Minutes</strong>
            </div>
            <div className="meta-row">
              <span>Payment Mode:</span>
              <strong className="badge-payment-mode">{paymentMethod === 'Online' ? `Online (${paymentDetails.methodType || 'Paid'})` : 'Cash on Delivery (COD)'}</strong>
            </div>
            <div className="meta-row">
              <span>Payment Status:</span>
              <strong className={`badge-payment-status ${paymentStatus.toLowerCase()}`}>{paymentStatus}</strong>
            </div>
            {paymentDetails && paymentDetails.transactionId && (
              <div className="meta-row">
                <span>Transaction Ref ID:</span>
                <strong className="tx-id-text">{paymentDetails.transactionId}</strong>
              </div>
            )}
          </div>

          <div className="confirm-actions">
            <button onClick={handlePrint} className="lys-confirm-btn-secondary">
              🖨️ Print Invoice Receipt
            </button>
            <button onClick={() => navigate('/dashboard')} className="lys-confirm-btn">
              🛵 Track in Dashboard
            </button>
          </div>
          <div className="confirm-back-home">
            <Link to="/">Back to Food Catalog</Link>
          </div>
        </div>
      </div>

      {/* Invoice Receipt Panel (Optimized for Screen and Print layout) */}
      <div className="lys-invoice-container">
        <div className="invoice-header">
          <div className="invoice-company-details">
            <h2 className="invoice-brand-title">{settings.storeName}</h2>
            <p>Premium Culinary Delicacies & Daily Bites</p>
            <p>Bhilai, Chhattisgarh, Kurud Road, 490001</p>
            <p>Support: support@zomato.com</p>
          </div>
          <div className="invoice-meta-details">
            <h1>TAX INVOICE</h1>
            <p><strong>Invoice No:</strong> ZOMATO-{id.slice(0, 8).toUpperCase()}</p>
            <p><strong>Order ID:</strong> {id}</p>
            <p><strong>Date:</strong> {new Date(createdAt).toLocaleString()}</p>
            <p><strong>Status:</strong> {paymentStatus ? (paymentStatus === 'Completed' ? 'PAID' : paymentStatus.toUpperCase()) : 'PENDING'}</p>
          </div>
        </div>

        <hr className="invoice-divider" />

        <div className="invoice-billing-row">
          <div className="billing-to">
            <h3>Billed To:</h3>
            <p><strong>{customerDetails.name}</strong></p>
            <p><strong>Phone:</strong> {customerDetails.phone}</p>
            <p><strong>Delivery Address:</strong></p>
            <p className="address-text">{customerDetails.address}</p>
            {customerDetails.notes && (
              <p className="driver-notes"><strong>Instructions:</strong> {customerDetails.notes}</p>
            )}
          </div>
          <div className="billing-from">
            <h3>Payment Details:</h3>
            <p><strong>Method:</strong> {paymentMethod === 'Online' ? `Online Payment` : 'Cash on Delivery (COD)'}</p>
            {paymentDetails && paymentDetails.methodType && (
              <p><strong>Type:</strong> {paymentDetails.methodType}</p>
            )}
            {paymentDetails && paymentDetails.upiId && (
              <p><strong>UPI ID:</strong> {paymentDetails.upiId}</p>
            )}
            {paymentDetails && paymentDetails.cardLast4 && (
              <p><strong>Card:</strong> •••• •••• •••• {paymentDetails.cardLast4}</p>
            )}
            {paymentDetails && paymentDetails.bankName && (
              <p><strong>Bank:</strong> {paymentDetails.bankName}</p>
            )}
            {paymentDetails && paymentDetails.walletName && (
              <p><strong>Wallet:</strong> {paymentDetails.walletName}</p>
            )}
            {paymentDetails && paymentDetails.transactionId && (
              <p><strong>Transaction ID:</strong> {paymentDetails.transactionId}</p>
            )}
          </div>
        </div>

        <table className="invoice-items-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Dish Name</th>
              <th className="text-right">Price</th>
              <th className="text-center">Qty</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id || index}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td className="text-right">{currency}{item.price}</td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-right">{currency}{item.price * item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-summary-wrapper">
          <div className="invoice-notes-clause">
            <p><strong>Terms & Conditions:</strong></p>
            <p>1. This is a computer-generated tax invoice and requires no physical signature.</p>
            <p>2. The food products are packed freshly under high hygiene standards.</p>
            <p>3. Cancellations are only permitted until the order status transitions to Preparing.</p>
            <p>Thank you for placing your culinary trust in <strong>zomato</strong>! ❤️</p>
          </div>

          <div className="invoice-totals-block">
            <div className="totals-row">
              <span>Items Subtotal:</span>
              <span>{currency}{subtotal}</span>
            </div>
            {order.couponApplied && (
              <div className="totals-row discount">
                <span>Coupon Discount ({order.couponApplied}):</span>
                <span>-{currency}{subtotal - totalAmount + taxAmount}</span>
              </div>
            )}
            <div className="totals-row">
              <span>GST & Delivery Fee ({settings.gstPercentage}%):</span>
              <span>{currency}{taxAmount}</span>
            </div>
            <hr className="summary-total-divider" />
            <div className="totals-row grand-total">
              <span>Grand Total:</span>
              <span>{currency}{totalAmount}</span>
            </div>
          </div>
        </div>

        <div className="invoice-footer-branding">
          <p>© {new Date().getFullYear()} {settings.storeName} Media Private Limited. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
