import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo-tile">
              <div className="name">AK Herbs</div>
              <div className="tag">Herbal wellness for life</div>
            </div>
          </div>
          <div className="footer-col">
            <h4>Contact Us</h4>
            <ul>
              <li>10/19, Ramasamy Garden Street, Royapettah, Chennai - 600014</li>
              <li>9566057407 / 9444461018</li>
              <li><Link to="/contact">Get directions</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Social Links</h4>
            <ul>
              <li>hindukrishnakumar2810@gmail.com</li>
              <li>Instagram — akherbs_</li>
              <li>Facebook — AK Herbs</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/product">Product</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">Copyright © {new Date().getFullYear()} AK Herbs. All rights reserved.</div>
      </div>
    </footer>
  );
}
