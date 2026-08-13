import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const BACKEND_URL =
  (
    import.meta.env.VITE_API_URL ||
    'http://localhost:5000/api'
  ).replace(/\/api\/?$/, '');

export default function Account() {
  const {
    session,
    logout,
    updateUserProfile,
  } = useAuth();

  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    api
      .get('/auth/me')
      .then(({ data }) =>
        setProfile(data.user)
      )
      .finally(() =>
        setLoading(false)
      );
  }, []);

  if (loading) {
    return (
      <section className="dashboard-shell">
        <div className="wrap">
          <p className="empty-state">
            Loading your account…
          </p>
        </div>
      </section>
    );
  }

  const wish =
    profile?.wishlist || [];

  const cart =
    profile?.cart || [];

  const groupedCart =
    Object.values(
      cart.reduce(
        (acc, product) => {
          const id =
            String(product._id);

          if (!acc[id]) {
            acc[id] = {
              ...product,
              quantity: 0,
            };
          }

          acc[id].quantity += 1;

          return acc;
        },
        {}
      )
    );

  function getProductImage(product) {
    const image =
      product?.images?.[0];

    if (!image) {
      return '';
    }

    if (
      image.startsWith('http://') ||
      image.startsWith('https://')
    ) {
      return image;
    }

    return `${BACKEND_URL}${image}`;
  }

  async function increaseCart(
    productId
  ) {
    try {
      const { data } =
        await api.post(
          `/cart/${productId}`
        );

      setProfile(
        (current) => ({
          ...current,
          cart: data.cart,
        })
      );

      updateUserProfile({
        cart: data.cart,
      });
    } catch (error) {
      console.error(
        'Increase cart error:',
        error
      );
    }
  }

  async function decreaseCart(
    productId
  ) {
    try {
      const { data } =
        await api.delete(
          `/cart/${productId}`
        );

      setProfile(
        (current) => ({
          ...current,
          cart: data.cart,
        })
      );

      updateUserProfile({
        cart: data.cart,
      });
    } catch (error) {
      console.error(
        'Decrease cart error:',
        error
      );
    }
  }

  async function removeCartProduct(
    productId,
    quantity
  ) {
    try {
      let latestCart = cart;

      for (
        let i = 0;
        i < quantity;
        i++
      ) {
        const { data } =
          await api.delete(
            `/cart/${productId}`
          );

        latestCart =
          data.cart;
      }

      setProfile(
        (current) => ({
          ...current,
          cart: latestCart,
        })
      );

      updateUserProfile({
        cart: latestCart,
      });
    } catch (error) {
      console.error(
        'Remove cart product error:',
        error
      );
    }
  }

  return (
    <section className="dashboard-shell">
      <div className="wrap">

        {/* ACCOUNT HEADER */}
        <div
          className="dashboard-card"
          style={{
            marginBottom: 28,
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <h2
              style={{
                color:
                  'var(--leaf-dark)',
                fontSize: 24,
              }}
            >
              Welcome,{' '}
              {
                session.profile
                  .name
              }
            </h2>

            <p
              style={{
                marginTop: 6,
              }}
            >
              {
                session.profile
                  .email
              }
            </p>
          </div>

          <button
            className="btn btn-outline-dark"
            onClick={logout}
          >
            Logout
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div
          className="grid grid-3"
          style={{
            marginBottom: 36,
          }}
        >
          <div className="dashboard-card">
            <h3
              style={{
                fontSize: 16,
                color:
                  'var(--leaf-dark)',
              }}
            >
              Cart Items
            </h3>

            <p
              style={{
                fontSize: 28,
                fontFamily:
                  'var(--font-display)',
                color:
                  'var(--gold)',
                marginTop: 8,
              }}
            >
              {cart.length}
            </p>
          </div>

          <div className="dashboard-card">
            <h3
              style={{
                fontSize: 16,
                color:
                  'var(--leaf-dark)',
              }}
            >
              Wishlist
            </h3>

            <p
              style={{
                fontSize: 28,
                fontFamily:
                  'var(--font-display)',
                color:
                  'var(--gold)',
                marginTop: 8,
              }}
            >
              {wish.length}
            </p>
          </div>

          <div className="dashboard-card">
            <h3
              style={{
                fontSize: 16,
                color:
                  'var(--leaf-dark)',
              }}
            >
              Orders Placed
            </h3>

            <p
              style={{
                fontSize: 28,
                fontFamily:
                  'var(--font-display)',
                color:
                  'var(--gold)',
                marginTop: 8,
              }}
            >
              0
            </p>
          </div>
        </div>

        {/* WISHLIST */}
        <div
          className="dashboard-card"
          style={{
            marginBottom: 28,
          }}
        >
          <h3
            style={{
              color:
                'var(--leaf-dark)',
              marginBottom: 16,
            }}
          >
            My Wishlist
          </h3>

          {wish.length ? (
            <table className="table-simple">
              <thead>
                <tr>
                  <th>
                    Product
                  </th>
                  <th>
                    Category
                  </th>
                  <th>
                    Price
                  </th>
                </tr>
              </thead>

              <tbody>
                {wish.map(
                  (product) => (
                    <tr
                      key={
                        product._id
                      }
                    >
                      <td>
                        {
                          product.name
                        }
                      </td>

                      <td>
                        {
                          product.cat
                        }
                      </td>

                      <td>
                        ₹
                        {
                          product.price
                        }
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          ) : (
            <p>
              Your wishlist is
              empty.{' '}
              <a
                href="/product"
                style={{
                  color:
                    'var(--leaf)',
                }}
              >
                Browse products →
              </a>
            </p>
          )}
        </div>

        {/* CART */}
        <div className="dashboard-card">
          <h3
            style={{
              color:
                'var(--leaf-dark)',
              marginBottom: 22,
            }}
          >
            My Cart
          </h3>

          {cart.length ? (
            <div
              style={{
                display: 'grid',
                gap: '18px',
              }}
            >
              {groupedCart.map(
                (product) => {
                  const imageUrl =
                    getProductImage(
                      product
                    );

                  return (
                    <div
                      key={
                        product._id
                      }
                      style={{
                        display:
                          'grid',
                        gridTemplateColumns:
                          '140px minmax(0, 1fr) auto',
                        gap: '22px',
                        alignItems:
                          'center',
                        padding:
                          '18px',
                        border:
                          '1px solid #e3dcc9',
                        borderRadius:
                          '14px',
                        background:
                          '#fffdf8',
                      }}
                    >

                      {/* PRODUCT IMAGE */}
                      <div
                        style={{
                          width:
                            '140px',
                          height:
                            '140px',
                          overflow:
                            'hidden',
                          borderRadius:
                            '12px',
                          background:
                            '#f5f1e6',
                        }}
                      >
                        {imageUrl ? (
                          <img
                            src={
                              imageUrl
                            }
                            alt={
                              product.name
                            }
                            style={{
                              width:
                                '100%',
                              height:
                                '100%',
                              objectFit:
                                'cover',
                              display:
                                'block',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width:
                                '100%',
                              height:
                                '100%',
                              display:
                                'flex',
                              alignItems:
                                'center',
                              justifyContent:
                                'center',
                              color:
                                'var(--leaf-dark)',
                              fontWeight:
                                '600',
                              textAlign:
                                'center',
                              padding:
                                '12px',
                            }}
                          >
                            {
                              product.name
                            }
                          </div>
                        )}
                      </div>

                      {/* PRODUCT INFO */}
                      <div>
                        <div
                          style={{
                            fontSize:
                              '12px',
                            textTransform:
                              'uppercase',
                            letterSpacing:
                              '1px',
                            color:
                              'var(--gold)',
                            marginBottom:
                              '8px',
                          }}
                        >
                          {
                            product.cat
                          }
                        </div>

                        <h3
                          style={{
                            fontSize:
                              '21px',
                            color:
                              'var(--leaf-dark)',
                            margin:
                              '0 0 8px',
                          }}
                        >
                          {
                            product.name
                          }
                        </h3>

                        {product.unit && (
                          <p
                            style={{
                              margin:
                                '0 0 12px',
                              color:
                                '#777',
                              fontSize:
                                '13px',
                            }}
                          >
                            Pack Size:{' '}
                            {
                              product.unit
                            }
                          </p>
                        )}

                        <div
                          style={{
                            fontSize:
                              '22px',
                            fontWeight:
                              '700',
                            color:
                              'var(--leaf-dark)',
                          }}
                        >
                          ₹
                          {
                            product.price
                          }
                        </div>
                      </div>

                      {/* QUANTITY + REMOVE */}
                      <div
                        style={{
                          minWidth:
                            '170px',
                          display:
                            'flex',
                          flexDirection:
                            'column',
                          alignItems:
                            'center',
                          gap: '14px',
                        }}
                      >
                        <span
                          style={{
                            fontSize:
                              '12px',
                            textTransform:
                              'uppercase',
                            letterSpacing:
                              '1px',
                            fontWeight:
                              '600',
                          }}
                        >
                          Quantity
                        </span>

                        <div
                          style={{
                            display:
                              'flex',
                            alignItems:
                              'center',
                            gap: '12px',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              decreaseCart(
                                product._id
                              )
                            }
                            style={{
                              width:
                                '36px',
                              height:
                                '36px',
                              borderRadius:
                                '50%',
                              border:
                                '1px solid #d6cfbd',
                              background:
                                '#fff',
                              cursor:
                                'pointer',
                              fontSize:
                                '18px',
                            }}
                          >
                            −
                          </button>

                          <strong
                            style={{
                              minWidth:
                                '24px',
                              textAlign:
                                'center',
                              fontSize:
                                '16px',
                            }}
                          >
                            {
                              product.quantity
                            }
                          </strong>

                          <button
                            type="button"
                            onClick={() =>
                              increaseCart(
                                product._id
                              )
                            }
                            style={{
                              width:
                                '36px',
                              height:
                                '36px',
                              borderRadius:
                                '50%',
                              border: 0,
                              background:
                                'var(--leaf)',
                              color:
                                '#fff',
                              cursor:
                                'pointer',
                              fontSize:
                                '18px',
                            }}
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeCartProduct(
                              product._id,
                              product.quantity
                            )
                          }
                          style={{
                            border: 0,
                            background:
                              'transparent',
                            color:
                              '#a33',
                            cursor:
                              'pointer',
                            fontWeight:
                              '600',
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <p>
              Your cart is
              empty.{' '}
              <a
                href="/product"
                style={{
                  color:
                    'var(--leaf)',
                }}
              >
                Start shopping →
              </a>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}