import React, { useState, useEffect } from 'react';
import './Toast.css';

const Toast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleShowToast = (e) => {
      const { message, type = 'info' } = e.detail || {};
      if (!message) return;

      const id = Date.now() + Math.random().toString(36).substr(2, 9);
      const newToast = { id, message, type };

      setToasts((prev) => [...prev, newToast]); 

      // Automatically remove toast after 4 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id)); 
      }, 4000);
    };

    window.addEventListener('showToast', handleShowToast); 
    return () => {
      window.removeEventListener('showToast', handleShowToast); 
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-card toast-${t.type}`} onClick={() => removeToast(t.id)}>
          <span className="toast-icon">
            {t.type === 'success' && '✅'}
            {t.type === 'error' && '❌'}
            {t.type === 'warning' && '⚠️'}
            {t.type === 'info' && 'ℹ️'}
          </span>
          <p className="toast-message">{t.message}</p>
          <button className="toast-close-btn">&times;</button>
        </div>
      ))}
    </div>
  );
};

export default Toast;

// Helper to trigger toast easily
export const triggerToast = (message, type = 'info') => {
  window.dispatchEvent(new CustomEvent('showToast', { detail: { message, type } }));
};
