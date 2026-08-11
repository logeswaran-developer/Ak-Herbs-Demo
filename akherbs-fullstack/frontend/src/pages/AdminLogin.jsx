import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    try {
      await loginAdmin(email, password);
      setMsg({ type: 'success', text: 'Welcome back! Redirecting to dashboard…' });
      setTimeout(() => navigate('/admin-dashboard'), 500);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Login failed.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-shell">
      <div className="auth-card admin-card">
        <div className="badge-ring">AK</div>
        <h1>Admin Login</h1>
        <p className="sub">Manage products, orders and store settings</p>

        {msg && <div className={`form-msg ${msg.type}`}>{msg.text}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="a-email">Admin Email</label>
            <input type="email" id="a-email" required placeholder="admin@akherbs.in" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="a-pass">Password</label>
            <input type="password" id="a-pass" required placeholder="Enter admin password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-gold btn-block" disabled={submitting}>
            {submitting ? 'Logging in…' : 'Login to Dashboard'}
          </button>
        </form>

        <p className="form-note">New admin? <Link to="/admin-register">Register here</Link></p>
        <p className="form-note">Not an admin? <Link to="/login">Customer Login</Link></p>
      </div>
    </section>
  );
}
