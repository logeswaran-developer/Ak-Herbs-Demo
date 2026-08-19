import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const { data } = await api.get('/orders');
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(status) {
    switch (status) {
      case 'Delivered':
        return <span className="pill green">Delivered</span>;
      case 'Shipped':
        return <span className="pill" style={{ background: '#dbeafe', color: '#1e40af' }}>Shipped</span>;
      case 'Processing':
        return <span className="pill" style={{ background: '#fef3c7', color: '#92400e' }}>Processing</span>;
      case 'Cancelled':
        return <span className="pill" style={{ background: '#fee2e2', color: '#991b1b' }}>Cancelled</span>;
      default:
        return <span className="pill" style={{ background: '#f3f4f6', color: '#374151' }}>Pending</span>;
    }
  }

  if (loading) {
    return (
      <div className="wrap" style={{ padding: '60px 0', textAlign: 'center' }}>
        <h2>Loading your order history...</h2>
      </div>
    );
  }

  return (
    <div className="wrap" style={{ padding: '40px 0' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--leaf-dark)', marginBottom: '24px' }}>
        📦 My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="dashboard-card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🛍️</span>
          <h3 style={{ color: 'var(--leaf-dark)', marginBottom: '8px' }}>No orders found</h3>
          <p style={{ color: 'var(--ink-soft)', marginBottom: '24px' }}>You haven't placed any orders yet.</p>
          <Link to="/product" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => (
            <div
              key={order._id}
              className="dashboard-card"
              style={{
                padding: '24px',
                borderRadius: '16px',
                borderLeft: '5px solid var(--gold)',
              }}
            >
              {/* Order Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  borderBottom: '1px solid #eee',
                  paddingBottom: '16px',
                  marginBottom: '16px',
                }}
              >
                <div>
                  <span style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Order ID
                  </span>
                  <h4 style={{ margin: '2px 0 0', color: 'var(--leaf-dark)', fontSize: '18px' }}>
                    #{order._id}
                  </h4>
                  <small style={{ color: 'var(--ink-soft)' }}>
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </small>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  {getStatusBadge(order.status)}
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--leaf-dark)' }}>
                    Total: ₹{order.totalAmount}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      background: '#fdfbf7',
                      padding: '10px 14px',
                      borderRadius: '8px',
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: '50px',
                        height: '50px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                        border: '1px solid #eee',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: 'var(--leaf-dark)', fontSize: '15px' }}>{item.name}</strong>
                      <div style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
                        Quantity: {item.quantity} × ₹{item.price}
                      </div>
                    </div>
                    <strong style={{ color: 'var(--leaf-dark)' }}>
                      ₹{item.quantity * item.price}
                    </strong>
                  </div>
                ))}
              </div>

              {/* Order Footer / Shipping Details */}
              <div
                style={{
                  background: '#f8f9fa',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div>
                  <strong>Delivery Address:</strong> {order.shippingAddress.name}, {order.shippingAddress.address}, {order.shippingAddress.city} - {order.shippingAddress.pincode} (Ph: {order.shippingAddress.phone})
                </div>
                <div>
                  <strong>Payment Method:</strong> {order.paymentMethod}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
