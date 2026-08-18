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

  const wishCount =
    session?.role === 'user'
      ? session.profile.wishlist?.length || 0
      : 0;

  const cartCount =
    session?.role === 'user'
      ? session.profile.cart?.length || 0
      : 0;

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const navLinkStyle = ({ isActive }) => ({
    textDecoration: 'none',
    color: isActive ? '#44651b' : '#182510',
    fontWeight: isActive ? '700' : '600',
    fontSize: '14px',
    padding: '27px 0 24px',
    borderBottom: isActive
      ? '2px solid #698732'
      : '2px solid transparent',
    transition: '0.2s ease',
    whiteSpace: 'nowrap',
  });

  return (
    <>
      {/* TOP GREEN BAR */}
      <div
        className="desktop-top-bar"
        style={{
          background: '#173d1c',
          color: '#fff',
          fontSize: '12px',
        }}
      >
        <div
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
            }}
          >
            <span style={{ fontSize: '14px' }}>🌿</span>
            <span>Free Shipping on orders above ₹499</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
            }}
          >
            <a
              href="tel:+919876543210"
              style={{
                color: '#fff',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z" />
              </svg>

              +91 98765 43210
            </a>

            <a
              href="mailto:support@akherbs.com"
              style={{
                color: '#fff',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="14"
                  rx="2"
                />
                <path d="m3 7 9 6 9-6" />
              </svg>

              support@akherbs.com
            </a>

            <span style={{ cursor: 'pointer' }}>◎</span>
            <span style={{ cursor: 'pointer' }}>f</span>
            <span style={{ cursor: 'pointer' }}>◉</span>
          </div>
        </div>
      </div>

      {/* MAIN HEADER */}
      <header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #eeeeea',
          position: 'sticky',
          top: 0,
          zIndex: 900,
          boxShadow: '0 2px 12px rgba(0,0,0,0.035)',
        }}
      >
        <div
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            minHeight: '78px',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '25px',
          }}
        >
          {/* MOBILE HAMBURGER */}
          <button
            type="button"
            className="mobile-header-btn"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            style={{
              border: 'none',
              background: 'transparent',
              color: '#183b1c',
              cursor: 'pointer',
              padding: '5px',
            }}
          >
            <svg
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </svg>
          </button>

          {/* LOGO */}
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                lineHeight: 1,
              }}
            >
              <div
                style={{
                  color: '#23451e',
                  display: 'flex',
                  alignItems: 'center',
                  fontFamily: 'Georgia, serif',
                }}
              >
                <span
                  style={{
                    fontSize: '38px',
                    fontWeight: '600',
                    letterSpacing: '-3px',
                  }}
                >
                  AK
                </span>

                <span
                  style={{
                    fontSize: '32px',
                    fontWeight: '400',
                    marginLeft: '3px',
                  }}
                >
                  herbs
                </span>
              </div>

              <span
                style={{
                  color: '#56664d',
                  fontSize: '10px',
                  letterSpacing: '0.5px',
                  marginTop: '2px',
                }}
              >
                Nature&apos;s Goodness, For You
              </span>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <nav
            className="desktop-main-nav"
            style={{
              flex: 1,
            }}
          >
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '30px',
              }}
            >
              <li>
                <NavLink
                  to="/"
                  end
                  style={navLinkStyle}
                >
                  Home
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/product"
                  style={navLinkStyle}
                >
                  Shop
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/product"
                  style={navLinkStyle}
                >
                  Categories
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/product"
                  style={navLinkStyle}
                >
                  Combo Offers
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/about"
                  style={navLinkStyle}
                >
                  About Us
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/contact"
                  style={navLinkStyle}
                >
                  Contact Us
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* RIGHT ACTIONS */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              flexShrink: 0,
            }}
          >
            {/* SEARCH */}
            <button
              className="desktop-action-icon"
              type="button"
              aria-label="Search"
              style={{
                border: 'none',
                background: 'transparent',
                color: '#173d1c',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </button>

            {/* ACCOUNT */}
            <Link
              to={acctHref}
              aria-label="Account"
              style={{
                color: '#173d1c',
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
              }}
            >
              <svg
                width="23"
                height="23"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c.7-4.4 3.4-7 8-7s7.3 2.6 8 7" />
              </svg>
            </Link>

            {/* WISHLIST */}
            <button
              className="desktop-wishlist"
              type="button"
              aria-label="Wishlist"
              style={{
                position: 'relative',
                border: 'none',
                background: 'transparent',
                color: '#173d1c',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M12 21s-7-4.35-9.5-8.5C.7 8.9 2.5 5 6.2 5c2 0 3.4 1 4.8 2.8C12.4 6 13.8 5 15.8 5c3.7 0 5.5 3.9 3.7 7.5C19 16.65 12 21 12 21Z" />
              </svg>

              {wishCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-7px',
                    minWidth: '17px',
                    height: '17px',
                    padding: '0 4px',
                    borderRadius: '20px',
                    background: '#557320',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {wishCount}
                </span>
              )}
            </button>

            {/* CART */}
            <button
              type="button"
              aria-label="Cart"
              style={{
                position: 'relative',
                border: 'none',
                background: 'transparent',
                color: '#173d1c',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <svg
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <circle cx="9" cy="20" r="1.3" />
                <circle cx="18" cy="20" r="1.3" />
                <path d="M2 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 7H6" />
              </svg>

              <span
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-7px',
                  minWidth: '18px',
                  height: '18px',
                  padding: '0 4px',
                  borderRadius: '20px',
                  background: '#557320',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE OVERLAY */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 998,
          }}
        />
      )}

      {/* MOBILE DRAWER */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 'min(82vw, 330px)',
          background: '#fff',
          zIndex: 999,
          transform: open
            ? 'translateX(0)'
            : 'translateX(-105%)',
          transition: 'transform 0.28s ease',
          boxShadow: '10px 0 30px rgba(0,0,0,0.16)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            background: '#173d1c',
            color: '#fff',
            padding: '22px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <strong
              style={{
                display: 'block',
                fontFamily: 'Georgia, serif',
                fontSize: '24px',
              }}
            >
              AK Herbs
            </strong>

            <span
              style={{
                fontSize: '11px',
                opacity: 0.8,
              }}
            >
              Nature&apos;s Goodness, For You
            </span>
          </div>

          <button
            onClick={() => setOpen(false)}
            type="button"
            style={{
              border: 'none',
              background: 'transparent',
              color: '#fff',
              fontSize: '30px',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '15px 18px',
          }}
        >
          {[
            ['Home', '/'],
            ['Shop', '/product'],
            ['Categories', '/product'],
            ['Combo Offers', '/product'],
            ['About Us', '/about'],
            ['Contact Us', '/contact'],
          ].map(([label, path]) => (
            <NavLink
              key={label}
              to={path}
              end={path === '/'}
              onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                padding: '14px 10px',
                color: isActive ? '#557320' : '#273322',
                textDecoration: 'none',
                fontWeight: isActive ? '700' : '600',
                borderBottom: '1px solid #eeeeea',
              })}
            >
              {label}
            </NavLink>
          ))}

          {session?.role === 'user' && (
            <NavLink
              to="/account"
              onClick={() => setOpen(false)}
              style={{
                padding: '14px 10px',
                color: '#273322',
                textDecoration: 'none',
                fontWeight: '600',
                borderBottom: '1px solid #eeeeea',
              }}
            >
              My Account
            </NavLink>
          )}

          {session?.role === 'admin' && (
            <NavLink
              to="/admin-dashboard"
              onClick={() => setOpen(false)}
              style={{
                padding: '14px 10px',
                color: '#273322',
                textDecoration: 'none',
                fontWeight: '600',
                borderBottom: '1px solid #eeeeea',
              }}
            >
              Admin Panel
            </NavLink>
          )}

          {!session && (
            <NavLink
              to="/login"
              onClick={() => setOpen(false)}
              style={{
                padding: '14px 10px',
                color: '#273322',
                textDecoration: 'none',
                fontWeight: '600',
              }}
            >
              Login
            </NavLink>
          )}
        </nav>

        <div
          style={{
            marginTop: 'auto',
            padding: '20px',
            background: '#f6f6ee',
            color: '#395033',
            fontSize: '12px',
          }}
        >
          Free Shipping on orders above ₹499
        </div>
      </aside>

      {/* ONLY RESPONSIVE DISPLAY RULES */}
      <style>
        {`
          .mobile-header-btn {
            display: none;
          }

          @media (max-width: 900px) {
            .desktop-top-bar,
            .desktop-main-nav,
            .desktop-action-icon,
            .desktop-wishlist {
              display: none !important;
            }

            .mobile-header-btn {
              display: inline-flex !important;
              align-items: center;
              justify-content: center;
            }
          }

          @media (max-width: 520px) {
            header > div {
              min-height: 66px !important;
              padding-left: 14px !important;
              padding-right: 14px !important;
              gap: 10px !important;
            }

            header a div div span:first-child {
              font-size: 30px !important;
            }
          }
        `}
      </style>
    </>
  );
}