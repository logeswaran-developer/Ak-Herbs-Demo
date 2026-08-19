import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const BACKEND_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
).replace(/\/api\/?$/, '');

export default function Cart() {
  const { session, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState(null);

  const [shippingAddress, setShippingAddress] = useState({
    name: session?.profile?.name || '',
    phone: session?.profile?.phone || '',
    address: '',
    city: '',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchCart();
  }, []);

  async function fetchCart() {
    try {
      setLoading(true);
      const { data } = await api.get('/cart');
      setCartItems(data.cart || []);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }

  // Group raw cart array of product objects
  const groupedCart = Object.values(
    cartItems.reduce((acc, product) => {
      if (!product || !product._id) return acc;
      const id = String(product._id);
      if (!acc[id]) {
        acc[id] = {
          ...product,
          quantity: 0,
        };
      }
      acc[id].quantity += 1;
      return acc;
    }, {})
  );

  const subtotal = groupedCart.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0
  );
  const shippingFee = subtotal > 500 || subtotal === 0 ? 0 : 50;
  const totalAmount = subtotal + shippingFee;

  function getProductImage(product) {
    const image = product?.images?.[0];
    if (!image) return 'https://via.placeholder.com/100?text=Herb';
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    return `${BACKEND_URL}${image}`;
  }

  async function increaseQty(productId) {
    try {
      const { data } = await api.post(`/cart/${productId}`);
      setCartItems(data.cart || []);
      if (updateUserProfile) {
        updateUserProfile({ cart: data.cart });
      }
    } catch (err) {
      alert('Failed to increase quantity');
    }
  }

  async function decreaseQty(productId) {
    try {
      const { data } = await api.delete(`/cart/${productId}`);
      setCartItems(data.cart || []);
      if (updateUserProfile) {
        updateUserProfile({ cart: data.cart });
      }
    } catch (err) {
      alert('Failed to decrease quantity');
    }
  }

  async function handleCheckout(e) {
    e.preventDefault();
    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city || !shippingAddress.pincode) {
      setErrorMsg('Please complete all shipping address fields.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const orderPayload = {
        items: groupedCart.map((item) => ({
          product: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: getProductImage(item),
        })),
        totalAmount,
        shippingAddress,
        paymentMethod,
      };

      const { data } = await api.post('/orders', orderPayload);
      if (data.success) {
        setCartItems([]);
        if (updateUserProfile) {
          updateUserProfile({ cart: [] });
        }
        setOrderPlaced(true);
        setPlacedOrderId(data.order._id);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="wrap" style={{ padding: '60px 0', textAlign: 'center' }}>
        <h2>Loading your cart...</h2>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="wrap" style={{ padding: '60px 0', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div className="dashboard-card" style={{ padding: '40px 20px', borderRadius: '16px' }}>
          <span style={{ fontSize: '60px' }}>🎉</span>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--leaf-dark)', margin: '16px 0 8px' }}>
            Order Placed Successfully!
          </h2>
          <p style={{ color: 'var(--ink-soft)', marginBottom: '20px' }}>
            Thank you for choosing AK Herbs. Your order ID is <strong>#{placedOrderId?.slice(-6)}</strong>.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/orders" className="btn btn-primary">
              View My Orders
            </Link>
            <Link to="/product" className="btn btn-outline-dark">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap" style={{ padding: '40px 0' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--leaf-dark)', marginBottom: '24px' }}>
        🛒 Shopping Cart
      </h1>

      {groupedCart.length === 0 ? (
        <div className="dashboard-card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🌿</span>
          <h3 style={{ color: 'var(--leaf-dark)', marginBottom: '8px' }}>Your cart is empty</h3>
          <p style={{ color: 'var(--ink-soft)', marginBottom: '24px' }}>Looks like you haven't added any herbal wellness products yet.</p>
          <Link to="/product" className="btn btn-primary">
            Explore Products
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '30px', alignItems: 'start' }}>
          {/* Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {groupedCart.map((item) => (
              <div
                key={item._id}
                className="dashboard-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  padding: '16px',
                  borderRadius: '12px',
                }}
              >
                <img
                  src={getProductImage(item)}
                  alt={item.name}
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #eee',
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: '0 0 6px', color: 'var(--leaf-dark)', fontSize: '16px' }}>
                    {item.name}
                  </h4>
                  <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: '14px' }}>
                    Category: {item.cat || 'Herbal'}
                  </p>
                  <strong style={{ color: 'var(--gold)', fontSize: '16px', display: 'block', marginTop: '4px' }}>
                    ₹{item.price} <small style={{ color: '#888', fontWeight: 400 }}>/ {item.unit || 'pack'}</small>
                  </strong>
                </div>

                {/* Quantity Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8f9fa', padding: '6px 12px', borderRadius: '8px' }}>
                  <button
                    type="button"
                    onClick={() => decreaseQty(item._id)}
                    style={{
                      border: 'none',
                      background: 'none',
                      fontSize: '18px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      color: 'var(--leaf-dark)',
                    }}
                  >
                    -
                  </button>
                  <span style={{ fontWeight: 'bold', fontSize: '15px', minWidth: '20px', textAlign: 'center' }}>
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => increaseQty(item._id)}
                    style={{
                      border: 'none',
                      background: 'none',
                      fontSize: '18px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      color: 'var(--leaf-dark)',
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Total Item Price */}
                <div style={{ textAlign: 'right', minWidth: '90px' }}>
                  <span style={{ fontSize: '12px', color: '#888', display: 'block' }}>Total</span>
                  <strong style={{ fontSize: '16px', color: 'var(--leaf-dark)' }}>
                    ₹{item.price * item.quantity}
                  </strong>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout & Summary Panel */}
          <div className="dashboard-card" style={{ padding: '24px', borderRadius: '16px', sticky: 'top', top: '100px' }}>
            <h3 style={{ margin: '0 0 20px', color: 'var(--leaf-dark)', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
              Order Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-soft)' }}>Subtotal</span>
                <strong>₹{subtotal}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-soft)' }}>Shipping</span>
                <strong>{shippingFee === 0 ? <span style={{ color: 'green' }}>FREE</span> : `₹${shippingFee}`}</strong>
              </div>
              {subtotal < 500 && subtotal > 0 && (
                <small style={{ color: '#d97706', fontSize: '12px' }}>
                  Add ₹{500 - subtotal} more for Free Shipping!
                </small>
              )}
              <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px' }}>
                <strong>Total Pay</strong>
                <strong style={{ color: 'var(--leaf-dark)' }}>₹{totalAmount}</strong>
              </div>
            </div>

            {/* Shipping Form */}
            <form onSubmit={handleCheckout}>
              <h4 style={{ margin: '16px 0 12px', color: 'var(--leaf-dark)', fontSize: '15px' }}>
                📍 Delivery Address
              </h4>

              {errorMsg && (
                <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '12px' }}>
                  {errorMsg}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={shippingAddress.name}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  required
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
                <textarea
                  placeholder="Street Address, House No."
                  required
                  rows="2"
                  value={shippingAddress.address}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', resize: 'vertical' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="City"
                    required
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    required
                    value={shippingAddress.pincode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                  />
                </div>
              </div>

              <h4 style={{ margin: '16px 0 12px', color: 'var(--leaf-dark)', fontSize: '15px' }}>
                💳 Payment Method
              </h4>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px' }}>
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                  />
                  Cash on Delivery
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px' }}>
                  <input
                    type="radio"
                    name="payment"
                    value="Online"
                    checked={paymentMethod === 'Online'}
                    onChange={() => setPaymentMethod('Online')}
                  />
                  Online Pay
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: 'bold' }}
              >
                {submitting ? 'Placing Order...' : `Place Order (₹${totalAmount})`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
