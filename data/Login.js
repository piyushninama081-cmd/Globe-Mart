import React, { useState } from 'react';
import './Login.css';

// Default allowed credentials
const VALID_EMAIL = 'piyush@gmail.com';
const VALID_PASSWORD = 'Piyush@123';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin@123';

export default function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setError('Enter your email/username and password.');
      return;
    }

    const trimmedInput = email.trim().toLowerCase();

    // Check Admin credentials
    if (
      (trimmedInput === ADMIN_USERNAME || trimmedInput === `${ADMIN_USERNAME}@gmail.com`) &&
      password === ADMIN_PASSWORD
    ) {
      setError('');
      sessionStorage.setItem('currentUserEmail', 'admin@shopsphere.local');
      sessionStorage.setItem('currentUserRole', 'admin');
      onLogin({
        name: 'Admin',
        role: 'admin',
        address: '',
        avatar: '',
      });
      return;
    }

    // Check default user credentials
    if (trimmedInput === VALID_EMAIL && password === VALID_PASSWORD) {
      setError('');
      sessionStorage.setItem('currentUserEmail', trimmedInput);
      sessionStorage.setItem('currentUserRole', 'user');
      onLogin({
        name: 'Piyush',
        role: 'user',
        address: '',
        avatar: '',
      });
      return;
    }

    // Check registered users from localStorage
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('storeRegisteredUsers')) || [];
      const matchedUser = registeredUsers.find(
        (u) => u.email.toLowerCase() === trimmedInput && u.password === password
      );

      if (matchedUser) {
        setError('');
        sessionStorage.setItem('currentUserEmail', matchedUser.email);
        sessionStorage.setItem('currentUserRole', 'user');
        onLogin({
          name: matchedUser.name,
          role: 'user',
          address: matchedUser.address || '',
          avatar: matchedUser.avatar || '',
        });
        return;
      }
    } catch (err) {
      // ignore storage errors
    }

    setError('Email/username or password is incorrect. Try again.');
    setPassword('');
  };

  return (
    <div className="login-page">
      {/* Decorative Animated Background Elements */}
      <div className="login-bg-grid" aria-hidden="true" />
      <div className="login-orb login-orb-1" aria-hidden="true" />
      <div className="login-orb login-orb-2" aria-hidden="true" />
      <div className="login-orb login-orb-3" aria-hidden="true" />

      {/* Storefront Brand Header */}
      <div className="login-brand-header">
        <div className="login-brand-logo">
          <span className="login-brand-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </span>
          <span>ShopSphere</span>
        </div>
        <svg className="login-brand-smile" viewBox="0 0 120 18" fill="none" aria-hidden="true">
          <path
            d="M8 4C38 16 82 16 112 4"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M104 2L113 4L108 12"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Glassmorphism Sign-In Card */}
      <form className="login-card" onSubmit={handleSubmit} noValidate>
        <span className="login-card-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Secure Member &amp; Admin Access
        </span>

        <h1 className="login-title">Sign in</h1>
        <p className="login-sub">
          Access your orders, wishlist, personalized deals, or admin panel.
        </p>

        {error && (
          <div className="login-error" role="alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="field-group">
          <label htmlFor="email">Email or Username</label>
          <div className="input-wrapper">
            <span className="input-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </span>
            <input
              id="email"
              type="text"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com or admin"
            />
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="password">Password</label>
          <div className="input-wrapper password-row">
            <span className="input-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="toggle"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((s) => !s)}
            >
              {showPassword ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                  Hide
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Show
                </>
              )}
            </button>
          </div>
        </div>

        <button type="submit" className="login-btn">
          <span>Sign in</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>

        <p className="login-terms">
          By continuing, you agree to ShopSphere&apos;s Conditions of Use and Privacy Notice.
        </p>

        <div className="login-divider">
          <span>New to ShopSphere?</span>
        </div>

        <button
          type="button"
          className="register-switch-btn"
          onClick={onSwitchToRegister}
        >
          Create your ShopSphere account
        </button>
      </form>

      {/* Bottom Trust & Security Bar */}
      <div className="login-footer-trust">
        <span className="trust-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          256-Bit SSL Encrypted
        </span>
        <span className="trust-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Fast Delivery &amp; Easy Returns
        </span>
      </div>
    </div>
  );
}