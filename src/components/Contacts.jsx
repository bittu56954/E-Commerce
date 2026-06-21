import React, { useState } from 'react';
import AnimatedBackground from './AnimatedBackground';
import { triggerToast } from './Toast';
import './Contacts.css';

const Contacts = () => {
  const [formData, setFormData] = useState({
    portalType: 'Customer', // Customer or Catering
    name: '',
    email: '',
    phone: '',
    currentLocation: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          portalType: formData.portalType,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          currentLocation: formData.currentLocation,
          message: formData.message
        })
      });

      const data = await response.json();

      if (!response.ok) {
        triggerToast(data.error || 'Failed to submit support request.', 'error');
        return;
      }

      setFormSubmitted(true);
      triggerToast('Support ticket dispatched successfully! ✉️', 'success');
      setFormData({
        portalType: 'Customer',
        name: '',
        email: '',
        phone: '',
        currentLocation: '',
        message: ''
      });
      setTimeout(() => setFormSubmitted(false), 5000);
    } catch (error) {
      console.error('Contact submission error:', error);
      triggerToast('Failed to connect to the backend server.', 'error');
    }
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqItems = [
    {
      q: "How can I trace my food preparation status?",
      a: "Log into your account, navigate to 'My Orders' (Dashboard) from the top navigation panel. Here you can monitor preparation streams live — tracking your order state from Pending to Preparing, Out for Delivery, and Delivered."
    },
    {
      q: "What is your 30-minute delivery guarantee policy?",
      a: "We guarantee delivery within 30 minutes from order confirmation for destinations within a 5km radius of HSR Layout. If the courier departs late or experiences logistics exceptions pushing delivery beyond 30 minutes, your order cost is fully waived, resulting in a 100% refund."
    },
    {
      q: "Do you offer gluten-free sourdough pizza options?",
      a: "Yes! While our primary sourdough starter is wheat-based, we prepare celiac-safe gluten-free sourdough crusts on demand. Simply mention 'Gluten-Free Crust' in the 'Kitchen Notes' input box during checkout."
    },
    {
      q: "How do I apply coupon codes to my shopping basket?",
      a: "Open your Shopping Basket drawer. Scroll below your item list to find the 'Have a discount coupon?' field. Input codes like PIZZA20 (20% Off), WELCOME10 (10% Off), or FREEDEL (Waive Tax & Delivery) and click Apply."
    },
    {
      q: "Is there a minimum ticket value required for checkouts?",
      a: "No, we do not enforce minimum cart values. You can order individual mocktails, desserts, or sides. However, applying the FREEDEL coupon code requires a subtotal of at least ₹200 to waive delivery charges."
    },
    {
      q: "What payment methods do you accept online?",
      a: "We support major digital payment modes including UPI, credit/debit cards (Visa, MasterCard, RuPay), NetBanking, and mobile wallets. Invoices are dispatched to your registered email address instantly."
    },
    {
      q: "Can I customize ingredients or add kitchen cooking notes?",
      a: "Absolutely! The checkout form features a 'Kitchen Notes (Optional)' input area. You can input customized requests like 'No onions', 'Make it extra spicy', or 'Double oregano seasoning' for our baking chefs."
    },
    {
      q: "How can I order corporate event catering?",
      a: "To book event catering, swap the support portal tab to 'Corporate Catering', fill out your contact email, guest count, location, and dates. Our catering manager will contact you within 2 hours to review menu options."
    },
    {
      q: "What is your refund policy if my food arrives cold?",
      a: "We seal orders in insulated thermal bags heated by conduction blocks. If your order falls below 60°C upon handover, contact our food concierge within 1 hour. We will issue a full credit refund to your profile."
    },
    {
      q: "How do you ensure FSSAI hygiene guidelines are met?",
      a: "Our kitchen underwent rigorous safety testing to achieve high FSSAI certifications. Chefs wear custom gloves and headmasks, work areas are sanitized every 2 hours, and all raw organic items are washed in natural sanitizing baths."
    }
  ];

  return (
    <div className="corporate-contact-canvas">
      <AnimatedBackground page="contact" />

      <div className="branding-blur-mesh mesh-coral"></div>
      <div className="branding-blur-mesh mesh-orange"></div>

      <div className="placement-grid-container">

        {/* Support info side */}
        <div className="company-telemetry-side">
          <div className="corporate-badge">👔 ZOMATO SUPPORT DESK</div>
          <h1 className="corporate-title">Get in Touch with our Support Desk</h1>
          <p className="corporate-desc">
            Have questions regarding checkouts, kitchen status, corporate catering bookings, or allergen guidelines? Drop us a ticket, and our satisfaction panel will reach out.
          </p>

          {/* Quick Stats Grid */}
          <div className="placement-trust-metrics">
            <div className="trust-cube">
              <h3>30 Min</h3>
              <p>Delivery Guarantee</p>
            </div>
            <div className="trust-cube">
              <h3>24/7</h3>
              <p>Hot Oven Support</p>
            </div>
            <div className="trust-cube">
              <h3>100%</h3>
              <p>Hygiene Certified</p>
            </div>
          </div>

          <div className="office-gateways-stack">
            <div className="gateway-card">
              <span className="gateway-icon">📍</span>
              <div className="gateway-info">
                <span>FLAGSHIP HUB</span>
                <strong>Food Zone, Sector 5, Bhilai, Chhattisgarh, India</strong>
              </div>
            </div>

            <div className="gateway-card">
              <span className="gateway-icon">✉️</span>
              <div className="gateway-info">
                <span>CATERING OFFICE</span>
                <strong>catering@zomato.com</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Support Ingress Form */}
        <div className="glass-form-container-node">
          {formSubmitted ? (
            <div className="transmission-success-card">
              <div className="success-icon-shield">✓</div>
              <h2>Message Dispatched</h2>
              <p>
                Congratulations! Your support inquiry has been successfully routed to our customer satisfaction panel. We will reach back shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="corporate-ingress-form">
              <div className="form-title-block">
                <h2>Connect to Customer Care</h2>
                <p>Select your query profile to route details into our support dashboard.</p>
              </div>

              <div className="portal-selector-tabs">
                <button
                  type="button"
                  className={`tab-btn ${formData.portalType === 'Customer' ? 'active-tab' : ''}`}
                  onClick={() => setFormData({ ...formData, portalType: 'Customer' })}
                >
                  🎓 Customer Inquiry
                </button>
                <button
                  type="button"
                  className={`tab-btn ${formData.portalType === 'Catering' ? 'active-tab' : ''}`}
                  onClick={() => setFormData({ ...formData, portalType: 'Catering' })}
                >
                  💼 Corporate Catering
                </button>
              </div>

              <div className="form-fluid-row">
                <div className="form-field-block">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter Your Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-field-block">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-fluid-row">
                <div className="form-field-block">
                  <label>Mobile Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-field-block">
                  <label>City Location</label>
                  <input
                    type="text"
                    name="currentLocation"
                    placeholder="Enter Your Address"
                    value={formData.currentLocation}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-field-block">
                <label>Inquiry Message</label>
                <textarea
                  name="message"
                  rows="4"
                  placeholder="Tell us what you need help with or details of your party order..."
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>

              <button type="submit" className="corporate-submit-action-btn">
                <span>Submit Inquiry ⚡</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ADDITIONAL 1. FAQ ACCORDION SECTION */}
      <section className="faq-accordion-section">
        <div className="ult-container">
          <div className="support-section-header">
            <h2>Frequently Asked Questions (FAQ)</h2>
            <p>Quick operational answers to help you navigate our kitchen pipelines and delivery networks.</p>
          </div>

          <div className="faq-list-wrapper">
            {faqItems.map((item, idx) => (
              <div key={idx} className={`faq-accordion-item ${openFaqIndex === idx ? 'faq-open' : ''}`}>
                <button type="button" className="faq-toggle-header" onClick={() => toggleFaq(idx)}>
                  <span>{item.q}</span>
                  <span className="faq-chevron">{openFaqIndex === idx ? '−' : '＋'}</span>
                </button>
                <div className="faq-body-content">
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ADDITIONAL 2. HELP GUIDES SECTION */}
      <section className="help-guides-section">
        <div className="ult-container">
          <div className="support-section-header">
            <h2>Support Guides & Resources</h2>
            <p>Follow our quick walkthroughs to streamline checkouts, apply codes, or coordinate caterings.</p>
          </div>

          <div className="guides-grid-cards">
            <div className="guide-card">
              <div className="guide-icon">🛒</div>
              <h4>How to Order Online</h4>
              <p>1. Browse the storefront and click <strong>Add 🛒</strong> on your desired dishes.</p>
              <p>2. Toggle the Basket from the navbar, check quantities, and input delivery coordinates.</p>
              <p>3. Click <strong>Place Order</strong>. Your session is monitored live.</p>
            </div>
            <div className="guide-card">
              <div className="guide-icon">🏷️</div>
              <h4>Applying Coupons</h4>
              <p>1. In the Basket, locate the <strong>Have a discount coupon?</strong> box.</p>
              <p>2. Enter codes: <code>PIZZA20</code> (20% Off), <code>WELCOME10</code> (10% Off), or <code>FREEDEL</code>.</p>
              <p>3. Click Apply to instantly recalculate totals, delivery fees, and taxes.</p>
            </div>
            <div className="guide-card">
              <div className="guide-icon">🍲</div>
              <h4>Catering Booking</h4>
              <p>1. Toggle the contact form to the <strong>Corporate Catering</strong> tab.</p>
              <p>2. Specify guest volume, locations, and dietary needs in the notes.</p>
              <p>3. Submit the ticket. Our managers will design a tailored menu grid.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ADDITIONAL 3. POLICIES SECTION */}
      <section className="support-policies-section">
        <div className="ult-container">
          <div className="support-section-header">
            <h2>Support Policies & Allergen Guidelines</h2>
            <p>Our operational commitments to culinary safety, transparency, and refund guarantees.</p>
          </div>

          <div className="policies-grid">
            <div className="policy-block">
              <h4>⚠️ Allergen Warnings</h4>
              <p>
                We process nuts, dairy products, organic wheat gluten, and soy in our facility.
                If you have celiac disease or severe nut allergies, please write descriptive directions
                in your 'Kitchen Notes' during checkout so our chefs can execute absolute sanitization loops.
              </p>
            </div>
            <div className="policy-block">
              <h4>💰 Fair Refund Policy</h4>
              <p>
                If your food is late (exceeding 30 minutes) or falls below temperature thresholds (below 60°C),
                you qualify for a full refund or free replacement ticket. Claims must be submitted within 60 minutes
                of handover by dropping a ticket or contacting our hotline.
              </p>
            </div>
            <div className="policy-block">
              <h4>🧽 Sanitization Standards</h4>
              <p>
                We conform to clean-kitchen initiatives. All prep stations are washed with food-grade sanitizing
                sprays every 2 hours, knives and tools are sterilized between dish groups, and driver temperatures
                are logged before shift handovers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contacts;


