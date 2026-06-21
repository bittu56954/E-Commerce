import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="lys-footer-node">
      <div className="lys-footer-container">
        
        {/* Top Header Row: Zomato text and Country/Language selectors */}
        <div className="lys-footer-top-row">
          <div className="lys-footer-logo-block">
            <span className="lys-footer-logo-text">zomato</span>
          </div>
          
          <div className="lys-footer-selectors">
            <div className="lys-selector-box">
              <span>🇮🇳 India</span>
              <span className="selector-arrow">▼</span>
            </div>
            <div className="lys-selector-box">
              <span>🌐 English</span>
              <span className="selector-arrow">▼</span>
            </div>
          </div>
        </div>

        {/* Links Columns Grid */}
        <div className="lys-footer-grid">
          
          <div className="lys-footer-col">
            <h4>ABOUT ZOMATO</h4>
            <ul>
              <li><Link to="/about">Who We Are</Link></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#careers">Work With Us</a></li>
              <li><a href="#investors">Investor Relations</a></li>
              <li><a href="#fraud">Report Fraud</a></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          <div className="lys-footer-col">
            <h4>ZOMAVERSE</h4>
            <ul>
              <li><Link to="/">zomato</Link></li>
              <li><a href="#blinkit">Blinkit</a></li>
              <li><a href="#feeding-india">Feeding India</a></li>
              <li><a href="#hyperpure">Hyperpure</a></li>
              <li><a href="#zoland">Zoland</a></li>
            </ul>
          </div>

          <div className="lys-footer-col">
            <h4>FOR RESTAURANTS</h4>
            <ul>
              <li><a href="#partner">Partner With Us</a></li>
              <li><a href="#apps">Apps For You</a></li>
            </ul>
          </div>

          <div className="lys-footer-col">
            <h4>LEARN MORE</h4>
            <ul>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#security">Security</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#sitemap">Sitemap</a></li>
            </ul>
          </div>

          <div className="lys-footer-col social-col">
            <h4>SOCIAL LINKS</h4>
            <div className="social-icon-row">
              <a href="#facebook" className="social-icon">f</a>
              <a href="#twitter" className="social-icon">t</a>
              <a href="#instagram" className="social-icon">i</a>
              <a href="#youtube" className="social-icon">y</a>
            </div>
            <div className="app-badge-stack">
              <a href="#appstore" className="app-download-badge appstore-badge"></a>
              <a href="#googleplay" className="app-download-badge playstore-badge"></a>
            </div>
          </div>

        </div>

        {/* Separator Line */}
        <hr className="lys-footer-divider" />

        {/* Bottom copyright notice */}
        <div className="lys-footer-bottom">
          <p>
            By continuing past this page, you agree to our Terms of Service, Cookie Policy, Privacy Policy and Content Policies. All trademarks are properties of their respective owners. 2026-2027 © Zomato™ Ltd. All rights reserved. | Created with ❤️ by BITTU KUMAR
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;