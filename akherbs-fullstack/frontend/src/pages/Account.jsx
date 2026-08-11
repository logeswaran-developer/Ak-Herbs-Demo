import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Account() {
  const { session, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => setProfile(data.user))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <section className="dashboard-shell"><div className="wrap"><p className="empty-state">Loading your account…</p></div></section>;

  const wish = profile?.wishlist || [];
  const cart = profile?.cart || [];

  return (
    <section className="dashboard-shell">
      <div className="wrap">
        <div className="dashboard-card" style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ color: 'var(--leaf-dark)', fontSize: 24 }}>Welcome, {session.profile.name}</h2>
            <p style={{ marginTop: 6 }}>{session.profile.email}</p>
          </div>
          <button className="btn btn-outline-dark" onClick={logout}>Logout</button>
        </div>

        <div className="grid grid-3" style={{ marginBottom: 36 }}>
          <div className="dashboard-card"><h3 style={{ fontSize: 16, color: 'var(--leaf-dark)' }}>Cart Items</h3><p style={{ fontSize: 28, fontFamily: 'var(--font-display)', color: 'var(--gold)', marginTop: 8 }}>{cart.length}</p></div>
          <div className="dashboard-card"><h3 style={{ fontSize: 16, color: 'var(--leaf-dark)' }}>Wishlist</h3><p style={{ fontSize: 28, fontFamily: 'var(--font-display)', color: 'var(--gold)', marginTop: 8 }}>{wish.length}</p></div>
          <div className="dashboard-card"><h3 style={{ fontSize: 16, color: 'var(--leaf-dark)' }}>Orders Placed</h3><p style={{ fontSize: 28, fontFamily: 'var(--font-display)', color: 'var(--gold)', marginTop: 8 }}>0</p></div>
        </div>

        <div className="dashboard-card" style={{ marginBottom: 28 }}>
          <h3 style={{ color: 'var(--leaf-dark)', marginBottom: 16 }}>My Wishlist</h3>
          {wish.length ? (
            <table className="table-simple">
              <thead><tr><th>Product</th><th>Category</th><th>Price</th></tr></thead>
              <tbody>{wish.map((p) => <tr key={p._id}><td>{p.name}</td><td>{p.cat}</td><td>₹{p.price}</td></tr>)}</tbody>
            </table>
          ) : <p>Your wishlist is empty. <a href="/product" style={{ color: 'var(--leaf)' }}>Browse products →</a></p>}
        </div>

        <div className="dashboard-card">
          <h3 style={{ color: 'var(--leaf-dark)', marginBottom: 16 }}>My Cart</h3>
          {cart.length ? (
            <table className="table-simple">
              <thead><tr><th>Product</th><th>Category</th><th>Price</th></tr></thead>
              <tbody>{cart.map((p, i) => <tr key={p._id + i}><td>{p.name}</td><td>{p.cat}</td><td>₹{p.price}</td></tr>)}</tbody>
            </table>
          ) : <p>Your cart is empty. <a href="/product" style={{ color: 'var(--leaf)' }}>Start shopping →</a></p>}
        </div>
      </div>
    </section>
  );
}
