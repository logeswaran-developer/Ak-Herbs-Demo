import { useState } from 'react';
import api from '../api/axios';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [msg, setMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    try {
      const { data } = await api.post('/contact', form);
      setMsg({ type: 'success', text: data.message });
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="page-banner">
        <div className="wrap">
          <h1>Contact Us</h1>
          <div className="crumbs">Home / Contact</div>
        </div>
      </section>

      <section className="section">
        <div className="wrap two-col">
          <div>
            <div className="contact-brand-banner">
              <img src="/images/ak-herbs-logo-banner.jpg" alt="AK Herbs — Herbal wellness for life" />
            </div>
            <span className="eyebrow">Get In Touch</span>
            <h2 style={{ margin: '16px 0 24px', fontSize: 32, color: 'var(--leaf-dark)' }}>We'd love to hear from you</h2>
            <p style={{ marginBottom: 28 }}>Have a question about a product or your order? Send us a message and our team will get back to you shortly.</p>
            <div className="dashboard-card" style={{ marginBottom: 16 }}>
              <strong style={{ color: 'var(--leaf-dark)' }}>Address</strong>
              <p style={{ marginTop: 6 }}>10/19, Ramasamy Garden Street, Royapettah, Chennai - 600014</p>
            </div>
            <div className="dashboard-card" style={{ marginBottom: 16 }}>
              <strong style={{ color: 'var(--leaf-dark)' }}>Phone</strong>
              <p style={{ marginTop: 6 }}>9566057407 / 9444461018</p>
            </div>
            <div className="dashboard-card">
              <strong style={{ color: 'var(--leaf-dark)' }}>Email</strong>
              <p style={{ marginTop: 6 }}>hindukrishnakumar2810@gmail.com</p>
            </div>
          </div>

          <div className="auth-card" style={{ boxShadow: 'none', margin: 0 }}>
            {msg && <div className={`form-msg ${msg.type}`}>{msg.text}</div>}
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="c-name">Full Name</label>
                <input type="text" id="c-name" required placeholder="Your name" value={form.name} onChange={update('name')} />
              </div>
              <div className="field">
                <label htmlFor="c-email">Email</label>
                <input type="email" id="c-email" required placeholder="you@example.com" value={form.email} onChange={update('email')} />
              </div>
              <div className="field">
                <label htmlFor="c-phone">Phone</label>
                <input type="tel" id="c-phone" placeholder="10-digit mobile number" value={form.phone} onChange={update('phone')} />
              </div>
              <div className="field">
                <label htmlFor="c-msg">Message</label>
                <textarea id="c-msg" rows="4" required placeholder="How can we help?" value={form.message} onChange={update('message')} />
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
