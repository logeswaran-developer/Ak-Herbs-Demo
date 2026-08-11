import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    try {
      await loginUser(email, password);
      setMsg({ type: 'success', text: 'Login successful! Redirecting…' });
      setTimeout(() => navigate('/account'), 500);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Login failed.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <div className="badge-ring">AK</div>
        <h1>Welcome Back</h1>
        <p className="sub">Login to your AK Herbs account</p>

        {msg && <div className={`form-msg ${msg.type}`}>{msg.text}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="l-email">Email Address</label>
            <input type="email" id="l-email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="l-pass">Password</label>
            <input type="password" id="l-pass" required placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="remember-row">
            <label><input type="checkbox" /> Remember me</label>
            <a href="#" className="small-link">Forgot password?</a>
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <p className="form-note">New to AK Herbs? <Link to="/register">Create an account</Link></p>
        <p className="form-note">Are you an admin? <Link to="/admin-login">Admin Login</Link></p>
      </div>
    </section>
  );
}
