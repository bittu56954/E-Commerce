import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

/**
 * Header — Reusable page hero banner component.
 *
 * Props:
 *  @param {string}   title       - Main heading text (required)
 *  @param {string}   subtitle    - Supporting subheading text (optional)
 *  @param {Array}    breadcrumbs - Array of { label, path } objects for breadcrumb trail (optional)
 *  @param {string}   ctaLabel    - Call-to-action button label (optional)
 *  @param {string}   ctaPath     - Route to navigate to on CTA click (optional)
 *  @param {Function} onCtaClick  - Custom CTA click handler (optional, overrides ctaPath)
 *  @param {string}   badge       - Small badge text rendered above the title (optional)
 *  @param {string}   align       - Text alignment: 'left' | 'center' | 'right' (default: 'center')
 */
const Header = ({
  title,
  subtitle,
  breadcrumbs = [],
  ctaLabel,
  ctaPath,
  onCtaClick,
  badge,
  align = 'center',
}) => {
  const navigate = useNavigate();

  const handleCta = () => {
    if (onCtaClick) {
      onCtaClick();
    } else if (ctaPath) {
      navigate(ctaPath);
    }
  };

  return (
    <header className={`lys-page-header align-${align}`} role="banner">
      {/* Animated gradient orbs for visual depth */}
      <div className="header-orb header-orb--1" aria-hidden="true" />
      <div className="header-orb header-orb--2" aria-hidden="true" />
      <div className="header-orb header-orb--3" aria-hidden="true" />

      <div className="header-content-wrap">
        {/* Breadcrumb navigation */}
        {breadcrumbs.length > 0 && (
          <nav className="header-breadcrumb" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.label}>
                {idx > 0 && (
                  <span className="breadcrumb-sep" aria-hidden="true">›</span>
                )}
                {crumb.path ? (
                  <button
                    className="breadcrumb-link"
                    onClick={() => navigate(crumb.path)}
                    type="button"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="breadcrumb-current" aria-current="page">
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Optional badge chip */}
        {badge && (
          <span className="header-badge" role="note">
            {badge}
          </span>
        )}

        {/* Main title */}
        <h1 className="header-title">{title}</h1>

        {/* Animated accent underline */}
        <div className="header-title-accent" aria-hidden="true">
          <span className="accent-line" />
          <span className="accent-dot" />
          <span className="accent-line" />
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="header-subtitle">{subtitle}</p>
        )}

        {/* CTA button */}
        {ctaLabel && (
          <button
            id="header-cta-btn"
            className="header-cta-btn"
            onClick={handleCta}
            type="button"
          >
            <span className="cta-btn-text">{ctaLabel}</span>
            <span className="cta-btn-arrow" aria-hidden="true">→</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
