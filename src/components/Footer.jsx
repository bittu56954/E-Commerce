import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css'; 

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        
        
        <div className="footer-column contact-col">
          <h4>CONTACT</h4>
          <div className="contact-info">
            <div className="contact-item">
              <span className="icon">✉️</span> 
              <a href="mailto:info@indiaplacement.com">krbittu803110@gmail.com</a>
            </div>
            <div className="contact-item">
              <span className="icon">📞</span>
              <div>
                +91 9905401908<br />
                +91 7562863822
              </div>
            </div>
            <div className="contact-item">
              <span className="icon">📍</span>
              <span>
                #301/302, 3rd Floor, Saket<br />
                Callopolis, Sarjapur Main Rd,<br />
                Doddakannelli, Bengaluru,<br />
                Karnataka 560035
              </span>
            </div>
          </div>
        </div>

     
        <div className="footer-column footer-branding">
          <div className="footer-logo-wrapper">
            
            <h2 className="brand-logo">
              <span className="logo-icon"> <img src="https://img.magnific.com/free-vector/made-india-circular-sign-background-business-promotion_1017-45292.jpg?semt=ais_hybrid&w=740&q=80" alt="" height={'50px'} width={'80px'}/> </span> INDIA PLACEMENT
            </h2>
            <span className="tagline">RESPONSIBLE INNOVATION</span>
          </div>
        </div>

    
        <div className="footer-column footer-links-col">
          <h4>QUICK LINKS</h4>
          <ul className="footer-links-list">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/">Startup Studio</Link></li>
            <li><Link to="/">Platforms & Partner Stack</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/">Careers</Link></li>
            <li><Link to="/">Privacy Policy</Link></li>
            <li><Link to="/">Terms & Condition</Link></li>
          </ul>
        </div>

      </div>
      
      <div className="footer-bottom">
        <p>© 2026 India Placement Private Limited. All rights reserved.|| Created by BITTU KUMAR</p>
      </div>
    </footer>
  );
};

export default Footer;