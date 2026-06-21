import React from 'react';
import './DeveloperBadge.css';

const DeveloperBadge = () => {
  return (
    <div className="developer-badge-container">
      <div className="badge-glow-effect"></div>
      <div className="badge-card">
        <div className="avatar-wrapper">
          <img src="/bittu_kumar.jpg" alt="Bittu Kumar" className="developer-avatar" />
          <span className="status-dot"></span>
        </div>
        <div className="info-wrapper">
          <span className="dev-name">Bittu Kumar</span>
          <span className="dev-title">Software Engineer</span>
        </div>
      </div>
    </div>
  );
};

export default DeveloperBadge;
