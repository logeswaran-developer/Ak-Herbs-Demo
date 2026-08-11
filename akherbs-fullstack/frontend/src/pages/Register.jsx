import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', password2: '' });
  const [msg, setMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);

    if (form.password !== form.password2) {
      setMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (form.password.length < 6) {
      setMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setSubmitting(true);
    try {
      await registerUser({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      setMsg({ type: 'success', text: 'Account created! Redirecting…' });
      setTimeout(() => navigate('/account'), 700);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Registration failed.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <div className="badge-ring">AK</div>
        <h1>Create Account</h1>
        <p className="sub">Join AK Herbs for a personalised wellness journey</p>

        {msg && <div className={`form-msg ${msg.type}`}>{msg.text}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="r-name">Full Name</label>
            <input type="text" id="r-name" required placeholder="Your full name" value={form.name} onChange={update('name')} />
          </div>
          <div className="field">
            <label htmlFor="r-email">Email Address</label>
            <input type="email" id="r-email" required placeholder="you@example.com" value={form.email} onChange={update('email')} />
          </div>
          <div className="field">
            <label htmlFor="r-phone">Phone Number</label>
            <input type="tel" id="r-phone" required placeholder="10-digit mobile number" value={form.phone} onChange={update('phone')} />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="r-pass">Password</label>
              <input type="password" id="r-pass" required placeholder="Create a password" value={form.password} onChange={update('password')} />
            </div>
            <div className="field">
              <label htmlFor="r-pass2">Confirm Password</label>
              <input type="password" id="r-pass2" required placeholder="Re-enter password" value={form.password2} onChange={update('password2')} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Account'}
          </button>
        </form>

        <p className="form-note">Already have an account? <Link to="/login">Login here</Link></p>
      </div>
    </section>
  );
}
