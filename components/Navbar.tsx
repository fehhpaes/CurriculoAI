'use client';

import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar} role="navigation" aria-label="Navegação principal">
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <a href="/" className={styles.logo} id="logo-link">
          <div className={styles.logoIcon} aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="url(#logoGrad)" />
              <path d="M8 10h12M8 14h8M8 18h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <circle cx="21" cy="18" r="3" fill="white" fillOpacity="0.9" />
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28">
                  <stop stopColor="#6c63ff" />
                  <stop offset="1" stopColor="#3ecfcf" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className={styles.logoText}>
            Currículo<span className="gradient-text">AI</span>
          </span>
        </a>

        {/* Badge */}
        <div className={styles.badge} aria-label="Powered by Gemini AI">
          <span className={styles.badgeDot} aria-hidden="true" />
          Powered by Gemini AI
        </div>
      </div>
    </nav>
  );
}
