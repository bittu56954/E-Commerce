import React from 'react';
import AnimatedBackground from './AnimatedBackground';
import './About.css';

const About = () => {
  return (
    <div className="about-ultimate-container">
      <AnimatedBackground page="about" />

      {/* 1. HERO SECTION */}
      <section className="ult-about-hero">
        <div className="ult-container ult-hero-content">
          <span className="ult-badge-tag">Crafting Culinary Magic</span>
          <h1>Welcome to "zomato" — Where Flavor Meets Speed</h1>
          <p className="hero-subtitle">
            We operate at the intersection of artisanal baking and high-speed delivery. 
            Our mission is to construct the ultimate pizza and food items storefront in India, 
            serving mouthwatering recipes prepared with extreme hygiene and absolute fresh ingredients.
          </p>
          <div className="ult-hero-stats-strip">
            <div className="u-strip-item"><strong>2026</strong> <span>Store Launch</span></div>
            <div className="u-strip-item"><strong>100%</strong> <span>Organic Items</span></div>
            <div className="u-strip-item"><strong>30 Mins</strong> <span>Delivery Limit</span></div>
            <div className="u-strip-item"><strong>FSSAI</strong> <span>Certified Kitchen</span></div>
          </div>
        </div>
      </section>

      {/* 2. CORE DNA AND MISSION/VISION */}
      <section className="about-section brand-dna-section">
        <div className="ult-container">
          <div className="ult-section-header">
            <h2>Our Core DNA & Vision</h2>
            <p>The foundational pillars that guide our kitchen computational standards and service framework.</p>
          </div>
          
          <div className="dna-vision-cards-grid">
            <div className="dna-vision-card">
              <div className="card-icon">🎯</div>
              <h3>Our Mission</h3>
              <p>
                To deliver premium, chef-crafted gourmet delicacies directly to your doorstep with absolute freshness. 
                We aim to bridge the gap between authentic stone-fired wood ovens and high-speed online ordering systems, 
                making quality food accessible to every household within minutes.
              </p>
            </div>
            
            <div className="dna-vision-card">
              <div className="card-icon">👁️</div>
              <h3>Our Vision</h3>
              <p>
                To become India's leading digital-first gourmet food brand, recognized for uncompromising ingredient 
                standards, innovative sourdough preparation models, and sustainable carbon-neutral logistics networks. 
                We envision a future where convenience does not compromise health or culinary integrity.
              </p>
            </div>

            <div className="dna-vision-card">
              <div className="card-icon">🤝</div>
              <h3>Our Service Commitment</h3>
              <p>
                We pledge to prioritize customer satisfaction in every single checkout loop. If your food does not arrive 
                steaming hot, or if there is any deviation from your custom cooking instructions, we stand by our 
                100% refund policy or immediate redelivery guarantee.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE SOURDOUGH PROVENANCE & CULINARY PHILOSOPHY */}
      <section className="about-section philosophy-section">
        <div className="ult-container philosophy-layout">
          <div className="philosophy-text-content">
            <span className="section-label-accent">THE CULINARY SECRET</span>
            <h2>Our Slow-Fermentation Sourdough Philosophy</h2>
            <p>
              Unlike industrial baking establishments that rely on quick-rise commercial yeasts and chemical dough 
              conditioners, we respect the natural passage of time. Our signature crusts are crafted using a live, 
              wild yeast sourdough starter that has been cultivated with care.
            </p>
            <p>
              Each dough ball is hand-stretched and undergoes a strict 48-hour cold fermentation process. 
              This allows the complex bacterial cultures to break down gluten proteins, making the baked crust 
              exceptionally light, airy, and easy to digest. It also develops that distinctive, charred 
              "leopard" crust pattern when cooked in our high-temperature ovens.
            </p>
            <div className="philosophy-bullet-points">
              <div className="bullet-row">
                <span className="bullet-check">✓</span>
                <div>
                  <strong>Natural Probiotics:</strong> The slow fermentation cultivates lactic acid bacteria, which lowers the glycemic index.
                </div>
              </div>
              <div className="bullet-row">
                <span className="bullet-check">✓</span>
                <div>
                  <strong>Stone-Ground Flour:</strong> We source organic, unbleached, high-protein wheat flour directly from mills in Punjab.
                </div>
              </div>
              <div className="bullet-row">
                <span className="bullet-check">✓</span>
                <div>
                  <strong>San Marzano Tomatoes:</strong> Our pizza marinara base is prepared using sweet, vine-ripened organic tomatoes.
                </div>
              </div>
            </div>
          </div>
          <div className="philosophy-image-visual">
            <div className="glass-visual-card">
              <h4>Crust Fermentation Cycle</h4>
              <div className="ferment-steps">
                <div className="f-step"><strong>12h</strong> <span>Room Temp autolyse</span></div>
                <div className="f-step"><strong>36h</strong> <span>Cold room bulk rise</span></div>
                <div className="f-step"><strong>48h</strong> <span>Leopard bake ready</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRODUCT QUALITY CHECKPOINTS (5-STAGE ASSURANCE) */}
      <section className="about-section quality-checkpoints-section">
        <div className="ult-container">
          <div className="ult-section-header">
            <h2>Our 5-Stage Quality Assurance Protocol</h2>
            <p>Every ingredient is checked, verified, and trace-certified before entering our production kitchen.</p>
          </div>

          <div className="quality-timeline-grid">
            <div className="q-time-box">
              <div className="q-badge">Stage 1</div>
              <h4>Direct Farm Audit</h4>
              <p>We perform regular visual and microbiological audits at our organic dairy and vegetable farms, verifying soil health and pesticide-free cultivation practices.</p>
            </div>
            <div className="q-time-box">
              <div className="q-badge">Stage 2</div>
              <h4>Cold Chain Reception</h4>
              <p>Fresh mozzarella cheese and perishable ingredients are transported under strictly monitored temperature logs (below 4°C) to prevent bacterial growth.</p>
            </div>
            <div className="q-time-box">
              <div className="q-badge">Stage 3</div>
              <h4>Gluten Mapping</h4>
              <p>Each sourdough batch undergoes manual stretch-and-fold elasticity tests to evaluate gluten strength and hydration levels (optimal at 72%).</p>
            </div>
            <div className="q-time-box">
              <div className="q-badge">Stage 4</div>
              <h4>High Heat Stone Fire</h4>
              <p>Ovens are calibrated continuously to maintain 450°C. This allows our pizzas to flash-cook in 90 seconds, sealing moisture inside the sourdough crumb.</p>
            </div>
            <div className="q-time-box">
              <div className="q-badge">Stage 5</div>
              <h4>Thermal Pack Check</h4>
              <p>Before courier dispatch, hot boxes are sealed inside insulated thermal bags mapping heat signatures to guarantee delivery at or above 65°C.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. LOGISTICS AND DELIVERY ROUTING ENGINE */}
      <section className="about-section logistics-section">
        <div className="ult-container logistics-flex">
          <div className="logistics-visual">
            <div className="logistics-mesh-box">
              <div className="logistics-node central">Central Kitchen</div>
              <div className="logistics-line line-1"></div>
              <div className="logistics-line line-2"></div>
              <div className="logistics-line line-3"></div>
              <div className="logistics-node client-1">HSR Area</div>
              <div className="logistics-node client-2">Bhilai</div>
              <div className="logistics-node client-3">Bellandur Area</div>
            </div>
          </div>
          <div className="logistics-text">
            <span className="section-label-accent">INTELLIGENT ROUTING</span>
            <h2>Our Deployed 30-Minute Delivery Engine</h2>
            <p>
              To maintain our strict freshness guarantee, we do not rely on third-party aggregators. 
              We host our own dedicated delivery fleet connected to a proprietary routing API.
            </p>
            <p>
              The moment an order is confirmed, our system calculates transit parameters based on live traffic, 
              weather condition sheets, and cooking times. We assign the optimal driver nodes even before the pizza 
              is pulled from the brick oven, reducing the time spent in transit to less than 12 minutes on average.
            </p>
            <div className="logistics-metric-chips">
              <div className="l-chip"><strong>12 mins</strong> <span>Average Transit Time</span></div>
              <div className="l-chip"><strong>99.4%</strong> <span>On-Time Deliveries</span></div>
              <div className="l-chip"><strong>Zero</strong> <span>Soggy Crust Claims</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOUNDER'S SPOTLIGHT: BITTU KUMAR */}
      <section className="ult-leadership">
        <div className="ult-container">
          <div className="ult-section-header">
            <h2>The Founder & Technical Architect</h2>
            <p>Driven by software and culinary engineering principles to deliver state-of-the-art experiences.</p>
          </div>

          <div className="leader-profile-card">
            <div className="leader-avatar-zone">
              <img src="/bittu_kumar.jpg" alt="Bittu Kumar" className="leader-photo" />
            </div>
            <div className="leader-info-zone">
              <span className="leader-title">Founder, Lead Software Engineer & Culinary Architect</span>
              <h3>BITTU KUMAR</h3>
              <p className="leader-bio">
                Bittu Kumar is a Software Engineer and technical founder pioneering next-generation online e-commerce 
                frameworks, database persistence configurations, and responsive UI structures. Deeply passionate about 
                the intersection of technology and gourmet culinary execution, he established <strong>zomato</strong> 
                to merge the precision of clean coding with stone-oven sourdough baking.
              </p>
              <p className="leader-bio">
                Under his active oversight, the platform employs optimized routing nodes, dynamically fetched settings, 
                and persistent JSON document repositories. Bittu sets strict benchmarks for clean, maintainable system 
                architectures, ensuring the frontend compiles flawlessly while offering an interactive, premium customer 
                experience across all devices.
              </p>
              <div className="leader-badges">
                <span>#SoftwareEngineering</span>
                <span>#ArtisanalSourdough</span>
                <span>#InteractiveUX</span>
                <span>#CleanArchitectures</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. DETAILED SERVICE SPECTRUM */}
      <section className="about-section services-spectrum-section">
        <div className="ult-container">
          <div className="ult-section-header">
            <h2>Our Gourmet Services Spectrum</h2>
            <p>We provide more than standard checkouts. Explore our specialized services and options.</p>
          </div>

          <div className="services-grid">
            <div className="service-col">
              <h4>🛒 Instant Online Checkout</h4>
              <p>Browse our extensive 50+ menu catalog on our storefront, apply discount codes like <code>PIZZA20</code> or <code>FREEDEL</code>, and track preparation steps from pending to cooking, packaging, and delivery streams.</p>
            </div>
            <div className="service-col">
              <h4>🎉 Premium Corporate Catering</h4>
              <p>From office lunch buffets to major tech conferences, we set up live tandoor and stone-fired wood oven stations at your venue, baking hot customized pizzas and serving sliders on demand.</p>
            </div>
            <div className="service-col">
              <h4>🌱 Dietary & Allergen Mapping</h4>
              <p>We care about your safety. Our catalog features detailed filters for gluten sensitivity (celiac-safe sourdough), lactose intolerance (vegan cashew cheeses), and organic sugar replacements.</p>
            </div>
            <div className="service-col">
              <h4>🛵 Live Heat-Signature Tracking</h4>
              <p>Check the location and temperature logs of your order directly on your dashboard. Our delivery fleet coordinates are updated real-time to assure you that your dinner is hot.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. KITCHEN HYGIENE COMPLIANCE GRID */}
      <section className="ult-compliance">
        <div className="ult-container">
          <div className="ult-section-header">
            <h2>Kitchen Hygiene Compliance & Guidelines</h2>
            <p>Our facility operates under national culinary standards and strict sanitization rules.</p>
          </div>
          <div className="compliance-grid">
            <div className="comp-box">
              <h4>FSSAI Certified Stall</h4>
              <p>Our kitchen layout, ingredients procurement, and chef training programs are fully certified by the Food Safety and Standards Authority of India (FSSAI).</p>
            </div>
            <div className="comp-box">
              <h4>Zero Added Preservatives</h4>
              <p>We believe in pure food. We ban MSG, synthetic food color additives, and trans-fats from entering our kitchen pantry stock completely.</p>
            </div>
            <div className="comp-box">
              <h4>Contactless Handover</h4>
              <p>Drivers undergo sanitization before receiving packages. Delivery bags are disinfected after every shift to maintain a safe loop.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. DETAILED BUSINESS TIMELINE */}
      <section className="ult-about-timeline">
        <div className="ult-container">
          <div className="ult-section-header">
            <h2>Our Professional Timeline</h2>
            <p>Tracing our evolution from a singular backyard wood-fired oven project to a nationwide digital dispatch storefront.</p>
          </div>

          <div className="ult-timeline-tree">
            <div className="ult-timeline-item u-left">
              <div className="u-timeline-badge">2024</div>
              <div className="u-timeline-panel">
                <h4>Seasoning & Dough Audits</h4>
                <p>
                  Assembled culinary minds to evaluate wheat varieties, flour hydration formulas, and tomato sugar acidity balances. Lock the signature sourdough starter recipe.
                </p>
              </div>
            </div>

            <div className="ult-timeline-item u-right">
              <div className="u-timeline-badge">2025</div>
              <div className="u-timeline-panel">
                <h4>HSR Flagship Launch</h4>
                <p>
                  Built our first stone-fired brick oven hub in Bangalore, India. Achieved instant popularity, serving fresh Margherita and Paneer Tikka pizzas to food lovers daily.
                </p>
              </div>
            </div>

            <div className="ult-timeline-item u-left">
              <div className="u-timeline-badge">2026</div>
              <div className="u-timeline-panel">
                <h4>Storefront Digital Release</h4>
                <p>
                  Released "zomato" digital platform featuring custom setting APIs, dynamic category updates, telemetry dashboard monitoring, and 30-minute delivery routing systems.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;