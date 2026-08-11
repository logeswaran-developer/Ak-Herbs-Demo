import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);

  const acctHref = session ? (session.role === 'admin' ? '/admin-dashboard' : '/account') : '/login';
  const acctLabel = session
    ? (session.role === 'admin' ? `Admin: ${session.profile.name.split(' ')[0]}` : session.profile.name.split(' ')[0])
    : 'Login';

  const wishCount = session?.role === 'user' ? (session.profile.wishlist?.length || 0) : 0;
  const cartCount = session?.role === 'user' ? (session.profile.cart?.length || 0) : 0;

  return (
    <header className="site-header">
      <div className="wrap">
        <Link to="/" className="logo">
          <span className="mark">AK</span>
          <span className="text-block">
            <span className="name">AK Herbs</span>
            <span className="tag">Herbal wellness for life</span>
          </span>
        </Link>
        <nav className={`main-nav ${open ? 'open-mobile' : ''}`}>
          <ul>
            <li><NavLink to="/" end>Home</NavLink></li>
            <li><NavLink to="/product">Product</NavLink></li>
            <li><NavLink to="/about">About</NavLink></li>
            <li><NavLink to="/contact">Contact</NavLink></li>
          </ul>
        </nav>
        <div className="header-actions">
          <button className="icon-btn" title="Wishlist">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 21s-7-4.35-9.5-8.5C.7 8.9 2.5 5 6.2 5c2 0 3.4 1 4.8 2.8C12.4 6 13.8 5 15.8 5c3.7 0 5.5 3.9 3.7 7.5C19 16.65 12 21 12 21Z"/></svg>
            <span className="count">{wishCount}</span>
          </button>
          <button className="icon-btn" title="Cart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 7H6"/></svg>
            <span className="count">{cartCount}</span>
          </button>
          <Link to={acctHref} className="acct-link">{acctLabel}</Link>
          <button className="burger icon-btn" title="Menu" onClick={() => setOpen((o) => !o)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          </button>
        </div>
      </div>
    </header>
  );
}
