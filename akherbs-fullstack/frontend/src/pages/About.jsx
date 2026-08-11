import { Link } from 'react-router-dom';

export default function About() {
  return (
    <>
      <section className="page-banner">
        <div className="wrap">
          <h1>About AK Herbs</h1>
          <div className="crumbs">Home / About</div>
        </div>
      </section>

      <section className="section">
        <div className="wrap two-col">
          <div className="img-frame">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="var(--leaf-dark)" strokeWidth="1"><path d="M4 20c8 0 15-6 16-16C11 5 5 12 5 20"/><path d="M5 20c0-4 2-8 7-11"/></svg>
          </div>
          <div>
            <span className="eyebrow">Our Story</span>
            <h2 style={{ margin: '16px 0 20px', fontSize: 32, color: 'var(--leaf-dark)' }}>From the house of Kumaaragiri Traders</h2>
            <p>With over three decades of existence in the field of Siddha and Ayurveda, AK Herbs continues a family tradition of sourcing, preparing, and sharing natural remedies. What began as a small trading house has grown into a trusted name for nuts, dry fruits, herbal formulations, and handcrafted soaps.</p>
            <p style={{ marginTop: 16 }}>Every product that carries our name passes through hands that understand tradition — measured, tested, and prepared the honest way, so wellness never feels like a compromise.</p>
          </div>
        </div>
      </section>

      <section className="section-tight" style={{ background: 'var(--cream-deep)' }}>
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">What Guides Us</span>
            <h2>Our Values</h2>
          </div>
          <div className="grid grid-3">
            <div className="cat-card">
              <div className="body">
                <h3>Purity First</h3>
                <p style={{ marginTop: 8, fontSize: 14 }}>No shortcuts — every batch is sourced and prepared with care.</p>
              </div>
            </div>
            <div className="cat-card">
              <div className="body">
                <h3>Traditional Roots</h3>
                <p style={{ marginTop: 8, fontSize: 14 }}>Formulations grounded in Siddha and Ayurvedic practice.</p>
              </div>
            </div>
            <div className="cat-card">
              <div className="body">
                <h3>Honest Service</h3>
                <p style={{ marginTop: 8, fontSize: 14 }}>Straightforward pricing, real support, real people.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="wrap" style={{ textAlign: 'center' }}>
          <span className="eyebrow" style={{ justifyContent: 'center' }}>Ready When You Are</span>
          <h2 style={{ margin: '16px 0 24px', color: 'var(--leaf-dark)', fontSize: 32 }}>Explore the full AK Herbs range</h2>
          <Link to="/product" className="btn btn-primary">Shop Now</Link>
        </div>
      </section>
    </>
  );
}
