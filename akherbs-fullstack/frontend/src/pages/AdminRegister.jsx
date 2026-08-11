import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRegister() {
  const [form, setForm] = useState({ name: '', email: '', password: '', password2: '', code: '' });
  const [msg, setMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { registerAdmin } = useAuth();
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
      await registerAdmin({ name: form.name, email: form.email, password: form.password, code: form.code });
      setMsg({ type: 'success', text: 'Admin account created! Redirecting…' });
      setTimeout(() => navigate('/admin-dashboard'), 700);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Registration failed.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-shell">
      <div className="auth-card admin-card">
        <div className="badge-ring">AK</div>
        <h1>Admin Registration</h1>
        <p className="sub">Create a new store administrator account</p>

        {msg && <div className={`form-msg ${msg.type}`}>{msg.text}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="ar-name">Full Name</label>
            <input type="text" id="ar-name" required placeholder="Admin name" value={form.name} onChange={update('name')} />
          </div>
          <div className="field">
            <label htmlFor="ar-email">Admin Email</label>
            <input type="email" id="ar-email" required placeholder="you@akherbs.in" value={form.email} onChange={update('email')} />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="ar-pass">Password</label>
              <input type="password" id="ar-pass" required placeholder="Create a password" value={form.password} onChange={update('password')} />
            </div>
            <div className="field">
              <label htmlFor="ar-pass2">Confirm Password</label>
              <input type="password" id="ar-pass2" required placeholder="Re-enter password" value={form.password2} onChange={update('password2')} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="ar-code">Admin Access Code</label>
            <input type="text" id="ar-code" required placeholder="Enter access code" value={form.code} onChange={update('code')} />
          </div>
          <button type="submit" className="btn btn-gold btn-block" disabled={submitting}>
            {submitting ? 'Creating…' : 'Register Admin Account'}
          </button>
        </form>

        <p className="form-note">Already registered? <Link to="/admin-login">Admin Login</Link></p>
      </div>
    </section>
  );
}
