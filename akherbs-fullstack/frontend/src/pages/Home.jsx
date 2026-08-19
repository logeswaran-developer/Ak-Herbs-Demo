import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import HeroCarousel from '../components/HeroCarousel';
import '../styles/HomeCategories.css';

const getCategoryImageUrl = (imagePath) => {
  if (!imagePath) return '';

  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://')
  ) {
    return imagePath;
  }

  const apiUrl = import.meta.env.VITE_API_URL;

  // Production / absolute backend URL
  if (apiUrl?.startsWith('http')) {
    const serverBase = apiUrl.replace(
      /\/api\/?$/,
      ''
    );

    return `${serverBase}${imagePath}`;
  }

  // Local development
  return `http://localhost:5000${imagePath}`;
};
export default function Home() {
  const { session } = useAuth();

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const isAdmin = session?.role === 'admin';

  useEffect(() => {
    async function loadCategories() {
      try {
        setCategoriesLoading(true);

        const response = await api.get('/categories');

        setCategories(
          response.data.categories || []
        );
      } catch (error) {
        console.error(
          'Home categories loading error:',
          error
        );

        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    }

    loadCategories();
  }, []);

  return (
    <>
      {/* HERO CAROUSEL */}
      <HeroCarousel />

      {!isAdmin && (
        <section className="hero">
          <div className="hero-inner">
            <span className="eyebrow">
              From the House of Kumaaragiri Traders
            </span>

            <h1>
              Herbal wellness, <em>rooted</em> in tradition
            </h1>

            <p className="lede">
              Nuts, dry fruits, Siddha decoctions and handcrafted herbal
              soaps — three decades of natural care, brought to your
              everyday life.
            </p>

            <div className="hero-actions">
              <Link to="/product" className="btn btn-primary">
                Shop the Range
              </Link>

              <Link to="/about" className="btn btn-outline-dark">
                Our Story
              </Link>
            </div>
          </div>
        </section>
      )}

     {/* SHOP BY CATEGORY */}
      <section className="home-categories">
        <div className="home-categories-container">

          <div className="home-categories-heading">
            <h2>Shop by Category</h2>
            <span>❧</span>
          </div>

          {categoriesLoading ? (
            <p className="home-category-status">
              Loading categories...
            </p>
          ) : categories.length > 0 ? (
            <div className="home-category-list">

              {categories.map((category) => (
                <Link
                  key={category._id}
                  to={`/product?cat=${encodeURIComponent(
                    category.name
                  )}`}
                  className="home-category-item"
                >
                  <div className="home-category-image">
                    <img
                      src={getCategoryImageUrl(
                        category.image
                      )}
                      alt={category.name}
                      loading="lazy"
                    />
                  </div>

                  <h3>{category.name}</h3>
                </Link>
              ))}

            </div>
          ) : (
            <p className="home-category-status">
              No categories available.
            </p>
          )}

        </div>
      </section>

      {/* OUR LEGACY */}
      <section className="section section-dark">
        <div className="wrap two-col">
          <div>
            <span className="eyebrow">
              Our Legacy
            </span>

            <h2
              style={{
                margin: '16px 0 20px',
              }}
            >
              With over 3 decades of existence in the field of
              Siddha and Ayurveda
            </h2>

            <p>
              AK Herbs continues a family tradition of sourcing,
              preparing and sharing natural remedies — from the same
              house that has served Chennai for generations.
            </p>

            <div
              style={{
                marginTop: 32,
                display: 'flex',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              <Link
                to="/contact"
                className="btn btn-outline"
              >
                Let's Talk
              </Link>

              <Link
                to="/about"
                className="btn btn-primary"
              >
                Read Our Story
              </Link>
            </div>
          </div>

          <div
            className="img-frame"
            style={{
              borderColor: 'rgba(255,255,255,.15)',
              background: 'rgba(255,255,255,.05)',
            }}
          >
            <svg
              width="120"
              height="120"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d9c39c"
              strokeWidth="1"
            >
              <path d="M4 20c8 0 15-6 16-16C11 5 5 12 5 20" />
              <path d="M5 20c0-4 2-8 7-11" />
            </svg>
          </div>
        </div>
      </section>

      {/* SERVICE FEATURES */}
      <section className="section-tight">
        <div className="wrap">
          <div className="stats-strip">

            <div className="stat-item">
              <div className="ico">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path d="M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7l-9-5Z" />
                </svg>
              </div>

              <div>
                <h4>Secure Payment</h4>
                <p>
                  All our payments are SSL secured.
                </p>
              </div>
            </div>

            <div className="stat-item">
              <div className="ico">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <rect
                    x="3"
                    y="8"
                    width="18"
                    height="12"
                    rx="2"
                  />

                  <path d="M8 8V6a4 4 0 0 1 8 0v2" />
                </svg>
              </div>

              <div>
                <h4>Delivered with Care</h4>
                <p>
                  Natural health, delivered with stealth.
                </p>
              </div>
            </div>

            <div className="stat-item">
              <div className="ico">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <circle
                    cx="12"
                    cy="8"
                    r="4"
                  />

                  <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
                </svg>
              </div>

              <div>
                <h4>Excellent Service</h4>
                <p>
                  Flawless service, always.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section
        className="section"
        style={{
          background: 'var(--cream-deep)',
        }}
      >
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">
              Testimonials
            </span>

            <h2>
              What our customers say
            </h2>
          </div>

          <div className="grid grid-3">

            <div className="testi-card">
              <h4>
                "Nuts and Dry Fruits"
              </h4>

              <p>
                I've been a regular customer of AK Herbs,
                and I must say, their products are top-notch!
                The nuts are always fresh, and the seeds and
                herbs are of excellent quality. Highly recommended
                for anyone.
              </p>

              <div className="stars">
                ★★★★★
              </div>

              <div className="who">
                — Neston Aamose
              </div>
            </div>

            <div className="testi-card">
              <h4>
                "Herbal Products"
              </h4>

              <p>
                AK Herbs has become my trusted source for high-quality
                herbal products. Their herbal supplements are fresh,
                effective, and truly enhance my well-being.
                The customer service is exceptional.
              </p>

              <div className="stars">
                ★★★★★
              </div>

              <div className="who">
                — Ponshika
              </div>
            </div>

            <div className="testi-card">
              <h4>
                "Herbal Soap"
              </h4>

              <p>
                I recently purchased a set of herbal soaps from
                AK Herbs, and they were a huge hit among my friends
                and family! The packaging was beautiful,
                natural fragrance, gentle and nourishing.
              </p>

              <div className="stars">
                ★★★★★
              </div>

              <div className="who">
                — Nithesh
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="section-tight">
        <div
          className="wrap"
          style={{
            textAlign: 'center',
          }}
        >
          <span
            className="eyebrow"
            style={{
              justifyContent: 'center',
            }}
          >
            Ready When You Are
          </span>

          <h2
            style={{
              margin: '16px 0 24px',
              color: 'var(--leaf-dark)',
              fontSize: 32,
            }}
          >
            Contact us to learn more about our products
            <br />
            and how we can support your wellness journey.
          </h2>

          <Link
            to="/contact"
            className="btn btn-primary"
          >
            Let's Talk
          </Link>
        </div>
      </section>
    </>
  );
}