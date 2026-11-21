import React, { useState, useEffect } from 'react';
import './Navbar.css';

export default function Navbar({
  currentPath = '/dashboard',
  isLoggedIn = true,
  userRole = 'user',
  userName = '',
  userAvatar = '',
  cartCount = 0,
  onNavigate,
  onLogout,
  onOpenCart,
  onOpenProfile,
  onGoHome,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const initial = (userName || 'U').trim().charAt(0).toUpperCase() || 'U';
  const isAdmin = isLoggedIn && userRole === 'admin';
  const logoSrc = `${process.env.PUBLIC_URL || ''}/globemart-logo.jpg`;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentPath]);

  const handleRoute = (path, fallbackFn) => {
    setMobileMenuOpen(false);
    if (typeof onNavigate === 'function') {
      onNavigate(path);
    } else if (typeof fallbackFn === 'function') {
      fallbackFn();
    }
  };

  return (
    <header
      className={`shopsphere-navbar ${isScrolled ? 'scrolled' : ''}`}
      role="banner"
    >
      <div className="navbar-inner">
        {/* Left: Globe Mart Logo */}
        <button
          type="button"
          className="navbar-brand"
          onClick={() => handleRoute(isAdmin ? '/admin' : '/dashboard', onGoHome)}
          aria-label="Globe Mart Home"
        >
          <span className="navbar-brand-badge">
            {!logoError ? (
              <img
                src={logoSrc}
                alt="Globe Mart Logo"
                className="navbar-brand-logo-img"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="navbar-brand-fallback">GM</span>
            )}
          </span>

          <span className="navbar-brand-text-group">
            <span className="navbar-brand-title">Globe Mart</span>
            <span className="navbar-brand-accent">
              {isAdmin ? 'ADMIN CONSOLE' : 'YOUR WORLD OF SHOPPING'}
            </span>
          </span>
        </button>

        {/* Right: User Profile, Cart & Logout */}
        <div className="navbar-actions">
          {!isLoggedIn ? (
            <div className="navbar-desktop-only">
              <button
                type="button"
                className={`navbar-auth-btn ${currentPath === '/login' ? 'active' : ''}`}
                onClick={() => handleRoute('/login')}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`navbar-cart-btn ${currentPath === '/register' ? 'active' : ''}`}
                onClick={() => handleRoute('/register')}
              >
                Register
              </button>
            </div>
          ) : (
            <>
              {isAdmin && (
                <button
                  type="button"
                  className={`navbar-admin-link navbar-desktop-only ${currentPath === '/admin' ? 'active' : ''}`}
                  aria-current={currentPath === '/admin' ? 'page' : undefined}
                  onClick={() => handleRoute('/admin')}
                >
                  Admin Panel
                </button>
              )}

              {/* User Profile Pill */}
              <button
                type="button"
                className={`navbar-profile-btn ${currentPath.startsWith('/profile') ? 'active' : ''}`}
                aria-current={currentPath.startsWith('/profile') ? 'page' : undefined}
                onClick={() => handleRoute('/profile', onOpenProfile)}
                title="View Profile"
              >
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName || 'User'}
                    className="navbar-avatar-img"
                  />
                ) : (
                  <span className="navbar-avatar-fallback">{initial}</span>
                )}
                <span className="navbar-user-name">{userName || 'User'}</span>
              </button>

              {/* Cart Button with Live Badge */}
              {userRole !== 'admin' && (
                <button
                  type="button"
                  className={`navbar-cart-btn ${currentPath === '/cart' ? 'active' : ''}`}
                  aria-current={currentPath === '/cart' ? 'page' : undefined}
                  aria-label={`Shopping Cart with ${cartCount} items`}
                  onClick={() => handleRoute('/cart', onOpenCart)}
                >
                  <span aria-hidden="true">🛒</span>
                  <span className="navbar-cart-label">Cart</span>
                  <span className="navbar-cart-count">{cartCount}</span>
                </button>
              )}

              {/* Logout Button */}
              {onLogout && (
                <button
                  type="button"
                  className="navbar-logout-btn navbar-desktop-logout"
                  onClick={onLogout}
                >
                  Logout
                </button>
              )}
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="navbar-mobile-toggle"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            <span className={`hamburger-bars ${mobileMenuOpen ? 'open' : ''}`}>
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      {/* Responsive Mobile Drawer */}
      <div className={`navbar-mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="navbar-mobile-drawer-inner">
          {!isLoggedIn ? (
            <>
              <button
                type="button"
                className={`navbar-mobile-link ${currentPath === '/login' ? 'active' : ''}`}
                onClick={() => handleRoute('/login')}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`navbar-mobile-link ${currentPath === '/register' ? 'active' : ''}`}
                onClick={() => handleRoute('/register')}
              >
                Register
              </button>
            </>
          ) : (
            <>
              {isAdmin && (
                <button
                  type="button"
                  className={`navbar-mobile-link navbar-mobile-admin ${currentPath === '/admin' ? 'active' : ''}`}
                  onClick={() => handleRoute('/admin')}
                >
                  Admin Panel
                </button>
              )}

              <button
                type="button"
                className={`navbar-mobile-link ${currentPath.startsWith('/profile') ? 'active' : ''}`}
                onClick={() => handleRoute('/profile', onOpenProfile)}
              >
                Profile ({userName || 'User'})
              </button>

              {userRole !== 'admin' && (
                <button
                  type="button"
                  className={`navbar-mobile-link ${currentPath === '/cart' ? 'active' : ''}`}
                  onClick={() => handleRoute('/cart', onOpenCart)}
                >
                  Cart ({cartCount})
                </button>
              )}

              {onLogout && (
                <button
                  type="button"
                  className="navbar-mobile-link navbar-mobile-logout"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                >
                  Logout
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}