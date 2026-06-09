import React, { useState } from 'react';
import './Home.css';

const Home = () => {

  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqData = [
    {
      q: "How does the AI-Centric engineering protocol bypass standard HR delays?",
      a: "Our integrated systems map your specific profile matrix directly into executive dashboards of fortune 500 tech hiring panels, automating the initial vetting cycle instantly."
    },
    {
      q: "Can high-velocity startups pitch for incubation via this landing node?",
      a: "Absolutely. Founders can bridge connections seamlessly by navigating to the Recruiter panel matrix inside our secure login portal gateway."
    }
  ];

  return (
    <div className="corporate-home-canvas fluid-responsive-engine">
      
   
      <section id="hero-section" className="fluid-container">
        <div className="hero-blur-mesh mesh-one"></div>
        <div className="hero-blur-mesh mesh-two"></div>
        
        <div className="hero-content-wrapper">
          <span className="ai-badge-pulse">🚀 AI-CENTRIC ENGINEERING PLATFORM</span>
         <h1 className="product-title-fluid">
  <div className="typewriter-container">
    Engineering the Future, <br />
    with Intelligent Restraint.
  </div>
</h1>
          <p className="hero-subtitle-fluid">
            We are a technology startup incubator and enterprise engineering firm. We build highly scalable SaaS systems, co-found ambitious platforms, and deploy robust production pipelines globally.
          </p>
          
        
          <div className="hero-action-cluster">
            <a href="/register" className="primary-cta-btn">Initialize GatePass Account ⚡</a>
            <a href="#capabilities-section" className="secondary-cta-btn">Explore Core Matrix</a>
          </div>
        </div>
      </section>

    
      <section id="brand-network-strip">
        <p className="strip-title">SYNCHRONIZED WITH GLOBAL STARTUP & ENTERPRISE ECOSYSTEMS</p>
        <div className="logo-responsive-flex">
          <div className="logo-node"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/3840px-Google_2015_logo.svg.png" alt="Google Grid" /></div>
          <div className="logo-node"><img src="https://cdn.uconnectlabs.com/wp-content/uploads/sites/46/2022/08/Linkedin-Logo-e1660320077673.png" alt="LinkedIn Node" /></div>
          <div className="logo-node"><img src="https://upload.wikimedia.org/wikipedia/commons/0/06/Amazon_2024.svg" alt="Amazon AWS Cloud" /></div>
          <div className="logo-node"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6vjLKl__k0M0YI-wgEQiGMIek99Jn9351bg&s" alt="Microsoft Infrastructure" /></div>
        </div>
      </section>

    
      <section id="capabilities-section" className="fluid-container">
        <div className="section-header-centered">
          <h2>Our Core Platform Capabilities</h2>
          <p>Deploying production-ready architecture models into live corporate environments.</p>
        </div>

        <div className="cards-responsive-grid-matrix">
          <div className="matrix-service-card-premium">
            <div className="icon-badge-box">🌐</div>
            <h3>Web Engineering</h3>
            <p>We build high-performance, edge-optimized corporate web systems that scale seamlessly across enterprise clusters.</p>
          </div>

          <div className="matrix-service-card-premium">
            <div className="icon-badge-box">📱</div>
            <h3>Mobile Infrastructure</h3>
            <p>Crafting high-fidelity, native iOS and Android application binaries with decentralized architecture frameworks.</p>
          </div>

          <div className="matrix-service-card-premium">
            <div className="icon-badge-box">🛡️</div>
            <h3>Cyber Security Vault</h3>
            <p>Protecting centralized servers and data repositories using automated defensive encryption parameters.</p>
          </div>

          <div className="matrix-service-card-premium">
            <div className="icon-badge-box">☁️</div>
            <h3>Cloud Automation</h3>
            <p>Automated migration mapping and secure infrastructure engineering on AWS, Google Cloud, and Microsoft Azure nodes.</p>
          </div>
        </div>
      </section>

  
      <section id="workflow-timeline-section" className="fluid-container">
        <div className="section-header-centered">
          <h2>The Operational Workflow</h2>
          <p>Accelerating raw source repositories into multi-region live application nodes.</p>
        </div>

        <div className="timeline-responsive-layout">
          <div className="blueprint-pipeline-card">
            <div className="blueprint-counter">01</div>
            <h4>System Architecture</h4>
            <p>Full mapping of algorithmic processes, structural wireframes, and scalable serverless system flow schemes.</p>
          </div>
          <div className="blueprint-pipeline-card">
            <div className="blueprint-counter">02</div>
            <h4>Agile Deploy Pipeline</h4>
            <p>Continuous pipeline tracking using production containers to push secure code revisions dynamically.</p>
          </div>
          <div className="blueprint-pipeline-card">
            <div className="blueprint-counter">03</div>
            <h4>Global Scale Routine</h4>
            <p>Deploying optimized components across high-bandwidth global delivery networks with minimal latencies.</p>
          </div>
        </div>
      </section>

 
      <section id="numerical-impact-grid-dark">
        <div className="impact-grid-responsive-inner fluid-container">
          <div className="stat-impact-node">
            <h3>24+</h3>
            <p>Incubated Nodes</p>
          </div>
          <div className="stat-impact-node">
            <h3>99.99%</h3>
            <p>Uptime Matrix</p>
          </div>
          <div className="stat-impact-node">
            <h3>150M+</h3>
            <p>Data Queries</p>
          </div>
          <div className="stat-impact-node">
            <h3>12+</h3>
            <p>Global Regions</p>
          </div>
        </div>
      </section>

    
      <section id="testimonial-matrix-section" className="fluid-container">
        <div className="section-header-centered">
          <h2>Verified Network Testimonials</h2>
          <p>Direct system feedback from corporate talent heads and technology partners.</p>
        </div>

        <div className="testimonial-responsive-flex-grid">
          <div className="premium-quote-card-node">
            <p className="quote-body-text">"The delivery metrics of this group are exceptional. They mapped our absolute database clustering systems within three execution cycles safely."</p>
            <div className="profile-identity-block">
              <div className="avatar-icon-circle">👨‍💻</div>
              <div>
                <h5>Rohan Malhotra</h5>
                <span>Chief Architect, FinNexus</span>
              </div>
            </div>
          </div>

          <div className="premium-quote-card-node">
            <p className="quote-body-text">"Outstanding attention to application design continuity. The pristine interfaces and robust layouts drastically optimized user verification sessions."</p>
            <div className="profile-identity-block">
              <div className="avatar-icon-circle">👩‍💼</div>
              <div>
                <h5>Ananya Sen</h5>
                <span>Director, CoreSaaS Systems</span>
              </div>
            </div>
          </div>
        </div>
      </section>

   
      <section id="faq-accordion-section" className="fluid-container">
        <div className="section-header-centered">
          <h2>Frequently Queried Protocols</h2>
          <p>Instantly clear system deployment doubts from our platform network knowledge base.</p>
        </div>

        <div className="faq-accordion-wrapper-node">
          {faqData.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item-card ${activeFaq === index ? 'faq-card-expanded' : ''}`}
              onClick={() => toggleFaq(index)}
            >
              <div className="faq-question-trigger">
                <h4>{faq.q}</h4>
                <span className="accordion-arrow-indicator">{activeFaq === index ? '−' : '+'}</span>
              </div>
              <div className="faq-answer-collapsible">
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      
      <section id="corporate-summary-node" className="fluid-container">
        <span className="summary-badge-glow">GLOBAL OPERATIONS MATRIX</span>
        <h2>Delivering Premium Enterprise Tech Architectures</h2>
        <p className="summary-subline-accent">Empowering Digital Bharat with Next-Gen Enterprise Solutions</p>
        
        <div className="summary-grid-split-paragraphs">
          <p>
            Welcome to the future of technology scaling. We synthesize next-generation system infrastructure, cloud automation blueprints, and data security vectors to accelerate engineering models across worldwide corporate networks.
          </p>
          <p>
            From wireframe logic compilation up to high-capacity cloud production handshakes, we make sure that your application lifecycle experiences absolute performance, security vetting, and responsive consistency.
          </p>
        </div>
      </section>

    </div>
  );
};

export default Home;