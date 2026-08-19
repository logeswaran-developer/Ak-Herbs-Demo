import { useState, useEffect } from 'react';
import {
  Link,
  NavLink,
  useLocation,
} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { session } = useAuth();
  const location = useLocation();

  const [open, setOpen] = useState(false);

  const acctHref = session
    ? session.role === 'admin'
      ? '/admin-dashboard'
      : '/account'
    : '/login';

  const acctLabel = session
    ? session.role === 'admin'
      ? `Admin: ${session.profile.name.split(' ')[0]}`
      : session.profile.name.split(' ')[0]
    : 'Login';

  const wishCount =
    session?.role === 'user'
      ? session.profile.wishlist?.length || 0
      : 0;

  const cartCount =
    session?.role === 'user'
      ? session.profile.cart?.length || 0
      : 0;

  // Route change aana mobile menu automatic-ah close aagum
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Menu open irukkum pothu background page scroll stop
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header className="site-header">
        <div className="wrap">

          {/* MOBILE HAMBURGER */}
          <button
            type="button"
            className="mobile-menu-btn"
            title="Menu"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <svg
              width="23"
              height="23"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            >
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </svg>
          </button>

          {/* LOGO */}
          <Link to="/" className="logo">
            <span className="mark">AK</span>

            <span className="text-block">
              <span className="name">
                AK Herbs
              </span>

              <span className="tag">
                Herbal wellness for life
              </span>
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="main-nav">
            <ul>
              <li>
                <NavLink to="/" end>
                  Home
                </NavLink>
              </li>

              <li>
                <NavLink to="/product">
                  Product
                </NavLink>
              </li>

              <li>
                <NavLink to="/about">
                  About
                </NavLink>
              </li>

              <li>
                <NavLink to="/contact">
                  Contact
                </NavLink>
              </li>

              {session?.role === 'user' && (
                <li>
                  <NavLink to="/orders">
                    My Orders
                  </NavLink>
                </li>
              )}
            </ul>
          </nav>

          {/* HEADER ACTIONS */}
          <div className="header-actions">

            <button
              type="button"
              className="icon-btn"
              title="Wishlist"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M12 21s-7-4.35-9.5-8.5C.7 8.9 2.5 5 6.2 5c2 0 3.4 1 4.8 2.8C12.4 6 13.8 5 15.8 5c3.7 0 5.5 3.9 3.7 7.5C19 16.65 12 21 12 21Z" />
              </svg>

              <span className="count">
                {wishCount}
              </span>
            </button>

            <Link
              to={session ? "/cart" : "/login"}
              className="icon-btn"
              title="Cart"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <circle
                  cx="9"
                  cy="20"
                  r="1.4"
                />

                <circle
                  cx="18"
                  cy="20"
                  r="1.4"
                />

                <path d="M2 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 7H6" />
              </svg>

              <span className="count">
                {cartCount}
              </span>
            </Link>

            <Link
              to={acctHref}
              className="acct-link"
            >
              {acctLabel}
            </Link>

          </div>
        </div>
      </header>

      {/* MOBILE DARK OVERLAY */}
      <div
        className={`mobile-menu-overlay ${
          open ? 'show' : ''
        }`}
        onClick={() => setOpen(false)}
      />

      {/* MOBILE LEFT DRAWER */}
      <aside
        className={`mobile-menu-drawer ${
          open ? 'open' : ''
        }`}
      >
        <div className="mobile-menu-top">

          <div className="mobile-menu-brand">
            <span className="mobile-menu-logo">
              AK
            </span>

            <div>
              <strong>AK Herbs</strong>
              <span>
                Herbal wellness
              </span>
            </div>
          </div>

          <button
            type="button"
            className="mobile-menu-close"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            ×
          </button>

        </div>

        <nav className="mobile-menu-nav">

          <NavLink
            to="/"
            end
            onClick={() => setOpen(false)}
          >
            Home
          </NavLink>

          <NavLink
            to="/product"
            onClick={() => setOpen(false)}
          >
            Product
          </NavLink>

          <NavLink
            to="/about"
            onClick={() => setOpen(false)}
          >
            About
          </NavLink>

          <NavLink
            to="/contact"
            onClick={() => setOpen(false)}
          >
            Contact
          </NavLink>

          {session?.role === 'user' && (
            <NavLink
              to="/account"
              onClick={() => setOpen(false)}
            >
              My Account
            </NavLink>
          )}

          {session?.role === 'admin' && (
            <NavLink
              to="/admin-dashboard"
              onClick={() => setOpen(false)}
            >
              Admin Panel
            </NavLink>
          )}

          {!session && (
            <NavLink
              to="/login"
              onClick={() => setOpen(false)}
            >
              Login
            </NavLink>
          )}

        </nav>

        <div className="mobile-menu-footer">
          <span>AK Herbs</span>
          <p>Herbal wellness for life</p>
        </div>

      </aside>
    </>
  );
}