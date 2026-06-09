import React, { useState } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="ultimate-dashboard-system">
    
      <div className="mobile-header-bar">
        <div className="m-logo">🌐 BITTU KUMAR <span className="m-sub">Enterprise</span></div>
        <button className="hamburger-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? '✕ Close' : '☰ Menu'}
        </button>
      </div>

     
      <aside className={`dash-sidebar-node ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand-zone">
          <span className="brand-icon">🌐</span>
          <h2>INDIA TECH <span className="brand-sub">v3.5</span></h2>
        </div>
        
        <nav className="sidebar-navigation-links">
          <button className={`nav-route-btn ${activeTab === 'overview' ? 'is-active' : ''}`} onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}>
            <span className="route-icon">📊</span> Operations Overview
          </button>
          <button className={`nav-route-btn ${activeTab === 'incubator' ? 'is-active' : ''}`} onClick={() => { setActiveTab('incubator'); setMobileMenuOpen(false); }}>
            <span className="route-icon">🚀</span> Incubator Pipeline
          </button>
          <button className={`nav-route-btn ${activeTab === 'infrastructure' ? 'is-active' : ''}`} onClick={() => { setActiveTab('infrastructure'); setMobileMenuOpen(false); }}>
            <span className="route-icon">☁️</span> Infrastructure Control
          </button>
          <button className={`nav-route-btn ${activeTab === 'security' ? 'is-active' : ''}`} onClick={() => { setActiveTab('security'); setMobileMenuOpen(false); }}>
            <span className="route-icon">🛡️</span> Threat Shield Core
          </button>
          <button className={`nav-route-btn ${activeTab === 'developers' ? 'is-active' : ''}`} onClick={() => { setActiveTab('developers'); setMobileMenuOpen(false); }}>
            <span className="route-icon">👥</span> Global Dev Nodes
          </button>
        </nav>

        <div className="sidebar-auth-profile">
          <div className="avatar-circle-node">BK</div>
          <div className="avatar-meta-data">
            <h4>BITTU KUMAR</h4>
            <p>Lead Platform Architect</p>
          </div>
        </div>
      </aside>

    
      <main className="dash-viewport-main">
        
      
        <header className="viewport-top-header">
          <div className="header-meta-left">
            <h1>Global Infrastructure Framework</h1>
            <p>System Context: <strong>Production Stable 2026</strong> | Multi-Zone Synchronized Shards</p>
          </div>
          <div className="header-meta-right">
            <div className="global-uptime-tag">
              <span className="live-pulse"></span> Network Active: 99.999%
            </div>
          </div>
        </header>

    
        <section className="sticky-metrics-ribbon">
          <div className="ribbon-item">
            <span className="ribbon-dot blue"></span>
            <div><p>Global CPU Ingress</p><strong>34.2% Alloc</strong></div>
          </div>
          <div className="ribbon-item">
            <span className="ribbon-dot green"></span>
            <div><p>Memory Pools</p><strong>12.8 TB / 32 TB</strong></div>
          </div>
          <div className="ribbon-item">
            <span className="ribbon-dot amber"></span>
            <div><p>API Handshaking</p><strong>412K req/sec</strong></div>
          </div>
          <div className="ribbon-item">
            <span className="ribbon-dot purple"></span>
            <div><p>Active Edges</p><strong>4,810 Active</strong></div>
          </div>
        </section>

        
        <div className="dynamic-page-layer-content">
          
          
          {activeTab === 'overview' && (
            <div className="sub-page-animate-fade">
              <div className="page-title-banner">
                <h2>Page 1: Deep Infrastructure Pulse & Telemetry Streams</h2>
                <p>Comprehensive monitoring matrices managing master systems across APAC, EMEA, and AMER nodes.</p>
              </div>
              
              <div className="metrics-quad-grid">
                <div className="metric-cube-card">
                  <div className="cube-title">Total Active Ingress</div>
                  <div className="cube-value">4.82 M/s</div>
                  <div className="cube-footer positive">▲ 24% Cloud Allocation</div>
                </div>
                <div className="metric-cube-card">
                  <div className="cube-title">Active Database Nodes</div>
                  <div className="cube-value">1,240 Nodes</div>
                  <div className="cube-footer stable">● Zero Failures Logged</div>
                </div>
                <div className="metric-cube-card">
                  <div className="cube-title">Global API Latency</div>
                  <div className="cube-value">14.2 ms</div>
                  <div className="cube-footer positive">⚡ Edge Network Optimized</div>
                </div>
                <div className="metric-cube-card">
                  <div className="cube-title">Data Transmission Cost</div>
                  <div className="cube-value">-32.4%</div>
                  <div className="cube-footer budget">✓ Smart Storage Scaling</div>
                </div>
              </div>

             
              <div className="overview-split-layout">
                <div className="split-panel-left">
                  <h3>Master Ingress Load Allocator (24 Hour Volumetric Matrix)</h3>
                  <div className="mock-chart-visualizer">
                    <div className="chart-bar-node" style={{height: '40%'}}><span>40%</span></div>
                    <div className="chart-bar-node" style={{height: '75%'}}><span>75%</span></div>
                    <div className="chart-bar-node" style={{height: '95%'}}><span>95%</span></div>
                    <div className="chart-bar-node highlight" style={{height: '100%'}}><span>MAX</span></div>
                    <div className="chart-bar-node" style={{height: '60%'}}><span>60%</span></div>
                    <div className="chart-bar-node" style={{height: '85%'}}><span>85%</span></div>
                    <div className="chart-bar-node" style={{height: '50%'}}><span>50%</span></div>
                  </div>
                  <div className="extended-chart-legends">
                    <p>Primary Edge: <strong>92.8% Capacity</strong></p>
                    <p>Secondary Failover Node: <strong>Standby Ready</strong></p>
                  </div>
                </div>

                <div className="split-panel-right">
                  <h3>Real-time System Core Telemetry</h3>
                  <div className="mini-terminal-log">
                    <p><code>[16:42:01] Master Node sync complete via BITTU KUMAR framework.</code></p>
                    <p className="warn"><code>[16:43:15] Load balancing triggered on Asia-South clusters.</code></p>
                    <p><code>[16:44:00] End-to-end transport layer fully encrypted.</code></p>
                    <p><code>[16:45:12] Health-check pipeline responded within 4ms threshold.</code></p>
                    <p><code>[16:47:33] Global Shard allocation parameters auto-adjusted.</code></p>
                  </div>
                </div>
              </div>

            
              <div className="deep-scroll-block-panel">
                <h3>Extended Multi-Regional Cluster Analysis</h3>
                <p>Below lists the active server containment distribution profiles mapped out dynamically across local and hybrid environments.</p>
                <div className="cluster-card-row-system">
                  <div className="cluster-mini-item">
                    <h5>Zone AP-SOUTH-1 (Mumbai)</h5>
                    <p>94 Active Replicas | Status: <strong>Optimal</strong></p>
                  </div>
                  <div className="cluster-mini-item">
                    <h5>Zone US-EAST-1 (N. Virginia)</h5>
                    <p>112 Active Replicas | Status: <strong>Optimal</strong></p>
                  </div>
                  <div className="cluster-mini-item">
                    <h5>Zone EU-WEST-1 (Ireland)</h5>
                    <p>88 Active Replicas | Status: <strong>Heavy Load</strong></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          
          {activeTab === 'incubator' && (
            <div className="sub-page-animate-fade">
              <div className="page-title-banner">
                <h2>Page 2: Incubator Core & High-Velocity Startup Matrices</h2>
                <p>Tracking architectural footprints, scale indicators, and server workloads of isolated internal portfolios.</p>
              </div>

              <div className="table-wrapper-responsive">
                <table className="enterprise-data-table">
                  <thead>
                    <tr>
                      <th>Startup Profile</th>
                      <th>Primary Tech Engine</th>
                      <th>Workload Scale</th>
                      <th>VPC Containment Boundary</th>
                      <th>System Isolation Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td><strong>#IN-BHARAT-01</strong></td><td>React Enterprise Nodes</td><td>25,000 req/min</td><td>AWS Cloud Multi-AZ</td><td><span className="badge-tag stage-prod">Production Active</span></td></tr>
                    <tr><td><strong>#IN-SAAS-DELTA</strong></td><td>Next.js Serverless Build</td><td>112,500 req/min</td><td>Azure Container Apps</td><td><span className="badge-tag stage-prod">Production Active</span></td></tr>
                    <tr><td><strong>#IN-AI-AUTOMATE</strong></td><td>Python Tensor Clusters</td><td>84,200 req/min</td><td>Hybrid Compute Matrix</td><td><span className="badge-tag stage-load">High Load Trigger</span></td></tr>
                    <tr><td><strong>#IN-SECURE-FIN</strong></td><td>Rust Secure Ledger Nodes</td><td>5,100 req/min</td><td>Private Secured Vaults</td><td><span className="badge-tag stage-test">Under Audit</span></td></tr>
                    <tr><td><strong>#IN-ALPHA-SANDBOX</strong></td><td>Go Microservice Fabrics</td><td>0 req/min</td><td>Docker Native Localized</td><td><span className="badge-tag stage-off">Offline Upgrades</span></td></tr>
                    <tr><td><strong>#IN-NEXUS-MED</strong></td><td>Node.js Core Micro API</td><td>19,500 req/min</td><td>AWS Lambda Clusters</td><td><span className="badge-tag stage-prod">Production Active</span></td></tr>
                    <tr><td><strong>#IN-ECO-FLOW</strong></td><td>Ruby Enterprise Layer</td><td>32,400 req/min</td><td>GCP Kubernetes Engine</td><td><span className="badge-tag stage-prod">Production Active</span></td></tr>
                  </tbody>
                </table>
              </div>

            
              <div className="incubator-growth-cards-grid">
                <div className="growth-metric-card">
                  <h4>Aggregated Ingress Analytics</h4>
                  <div className="progress-bar-container-global"><div className="progress-fill-node-color" style={{width: '78%'}}></div></div>
                  <p>78% Collective Pipeline Efficiency</p>
                </div>
                <div className="growth-metric-card">
                  <h4>Memory Threshold Caps</h4>
                  <div className="progress-bar-container-global"><div className="progress-fill-node-color" style={{width: '42%'}}></div></div>
                  <p>42% Active Allocation Allocated</p>
                </div>
              </div>
            </div>
          )}

          
          {activeTab === 'infrastructure' && (
            <div className="sub-page-animate-fade">
              <div className="page-title-banner">
                <h2>Page 3: Bare-Metal Architecture & Virtual Cloud Matrices</h2>
                <p>Direct deployment mappings, automated manifest pipelines, and network topology controls.</p>
              </div>

              <div className="infrastructure-triple-stack">
                <div className="infra-node-card-heavy">
                  <h4>VPC Cluster Matrix Isolation Nodes</h4>
                  <p>Status: All network isolation configurations validated successfully.</p>
                  <div className="matrix-block-visualization">
                    <span className="block-cell active"></span><span className="block-cell active"></span>
                    <span className="block-cell active"></span><span className="block-cell error"></span>
                    <span className="block-cell active"></span><span className="block-cell active"></span>
                    <span className="block-cell active"></span><span className="block-cell active"></span>
                    <span className="block-cell active"></span><span className="block-cell active"></span>
                    <span className="block-cell active"></span><span className="block-cell active"></span>
                  </div>
                </div>

                <div className="infra-node-card-heavy">
                  <h4>Global Multi-Tenant Storage Volumes</h4>
                  <p>Allocation Status: 8.4 TB Used / 32 TB High-Performance Boundary Limit.</p>
                  <div className="progress-bar-container-global">
                    <div className="progress-fill-node-color" style={{width: '65%'}}></div>
                  </div>
                  <p style={{fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px'}}>Warning Trigger set at 85% volumetric usage.</p>
                </div>

                
                <div className="infra-node-card-heavy">
                  <h4>Continuous Deployment Automated Webhooks</h4>
                  <p>Active Triggers: 42 Webhooks registered to core Git repositories.</p>
                  <ul className="manifest-bullet-list">
                    <li>Webhook Node #01: Auto-Deploy Configured → Region Mumbai</li>
                    <li>Webhook Node #02: Security Linting Process → Completed Successfully</li>
                    <li>Webhook Node #03: Hotfix Asset Injection Pipeline → Standby Status</li>
                  </ul>
                </div>
              </div>

           
              <div className="deep-infrastructure-logs-block">
                <h3>Comprehensive Server Cluster Hardware Allocation Reports</h3>
                <div className="hardware-report-table-wrapper">
                  <div className="hw-row"><span>Node ID: AP-WEST-1</span><strong>Intel Xeon Scalable 64-Core | 512GB RAM</strong><span className="txt-green">Online</span></div>
                  <div className="hw-row"><span>Node ID: AP-WEST-2</span><strong>AMD EPYC 7003 Series 128-Core | 1024GB RAM</strong><span className="txt-green">Online</span></div>
                  <div className="hw-row"><span>Node ID: EU-CENTRAL-1</span><strong>Custom ARM64 Neoverse Matrix Cluster</strong><span className="txt-amber">Maintenance</span></div>
                </div>
              </div>
            </div>
          )}

           
          {activeTab === 'security' && (
            <div className="sub-page-animate-fade">
              <div className="page-title-banner">
                <h2>Page 4: Threat Shield Architecture & Algorithmic Defense Centers</h2>
                <p>Zero-trust verification parameters, continuous token rotation matrices, and firewall rulesets.</p>
              </div>

              <div className="security-threat-dual-grid">
                <div className="security-card-flat">
                  <h3>Cryptographic Token Lifecycle Status Matrix</h3>
                  <p>All ingress data streams are enforced via single-use dynamically mutating token maps.</p>
                  <table className="mini-status-table">
                    <thead>
                      <tr><th>Token Namespace Cluster</th><th>Cipher Engine Profile</th><th>Time To Live</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>Auth-Cluster-Alpha-01</td><td>AES-GCM-256 Bit Alpha</td><td className="txt-green">42 Seconds Remaining</td></tr>
                      <tr><td>User-Node-Validation-Secure</td><td>RSA-4096-Bits Asymmetric</td><td className="txt-green">11 Minutes Remaining</td></tr>
                      <tr><td>Staging-Database-Ingress</td><td>ECDSA-P384 Standard</td><td className="txt-red">Expired & Rotated</td></tr>
                      <tr><td>Enterprise-API-Gateway-Key</td><td>ChaCha20-Poly1305</td><td className="txt-green">18 Mins Remaining</td></tr>
                    </tbody>
                  </table>
                </div>

                <div className="security-card-flat-alert">
                  <h3>Active Network Perimeter Counter-Measures</h3>
                  <div className="alert-strip-item security-green">
                    <strong>Zero Incidents Detected:</strong> Enterprise perimeter defenses operating at absolute computational capacity. Zero memory injections caught.
                  </div>
                  <div className="alert-strip-item security-blue">
                    <strong>SSL Certification Rotation Protocol:</strong> Executed completely automatically by deployment automation modules. Next rotation scheduled in 14 days.
                  </div>
                </div>
              </div>

              <div className="extended-security-logs-panel">
                <h3>Live Firewall IP Whitelist Filtering Real-Time Status</h3>
                <div className="ip-grid-block">
                  <span className="ip-node">192.168.1.1 <small>[ALLOWED]</small></span>
                  <span className="ip-node">10.0.42.101 <small>[ALLOWED]</small></span>
                  <span className="ip-node blocked">185.220.101.4 <small>[BLOCKED]</small></span>
                  <span className="ip-node">172.16.254.1 <small>[ALLOWED]</small></span>
                </div>
              </div>
            </div>
          )}

         
          {activeTab === 'developers' && (
            <div className="sub-page-animate-fade">
              <div className="page-title-banner">
                <h2>Page 5: Identity & Access Management (IAM) Privilege Map</h2>
                <p>Root privilege structures, cryptographic control access parameters, and deployment authority settings.</p>
              </div>

              <div className="developer-directory-layout">
                <div className="dev-user-card admin-master">
                  <div className="dev-meta-row">
                    <div className="big-avatar">BK</div>
                    <div>
                      <h3>BITTU KUMAR</h3>
                      <span className="dev-role-badge">Lead Developer & Platform Founder</span>
                    </div>
                  </div>
                  <p className="dev-clearance-text">
                    <strong>System Clearance Status:</strong> Level-Max Absolute Root Access Credentials. Holds absolute control over continuous deployment pipelines, cryptographic parameter definitions, root sharding frameworks, and operational orchestration lifecycles.
                  </p>
                </div>

                <div className="dev-user-card">
                  <div className="dev-meta-row">
                    <div className="big-avatar guest">AI</div>
                    <div>
                      <h3>Automated Integration Sub-Node</h3>
                      <span className="dev-role-badge guest">CI/CD Routine Service</span>
                    </div>
                  </div>
                  <p className="dev-clearance-text">
                    <strong>System Clearance Status:</strong> Restricted Process Write Permissions. Authorized specifically for parsing code packages, automated runtime evaluation routines, and system status feedback loops.
                  </p>
                </div>

               
                <div className="dev-user-card">
                  <div className="dev-meta-row">
                    <div className="big-avatar security-node">SR</div>
                    <div>
                      <h3>Security Response Node #04</h3>
                      <span className="dev-role-badge secure-badge">SecOps Automated Guardian</span>
                    </div>
                  </div>
                  <p className="dev-clearance-text">
                    <strong>System Clearance Status:</strong> Threat Isolation Authority. Holds exclusive permission flags to force-terminate compromised Docker container processes, drop localized database connections, and block unauthorized IP ingress streams.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Dashboard;