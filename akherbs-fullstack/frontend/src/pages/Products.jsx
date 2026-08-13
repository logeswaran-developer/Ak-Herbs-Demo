import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import api from "../api/axios";

import {
  useAuth,
} from "../context/AuthContext";

import {
  Icon,
} from "../assets/icons";

const BACKEND_URL =
  (
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api"
  ).replace(/\/api\/?$/, "");

export default function Products() {
    const navigate = useNavigate();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const activeCat =
    searchParams.get("cat") ||
    "All";

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const {
  session,
  updateUserProfile,
  } = useAuth();

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError("");

    api
      .get("/products")
      .then(({ data }) => {
        if (!cancelled) {
          setProducts(
            data.products || []
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(
            "Could not load products. Is the backend running?"
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const categories =
    useMemo(
      () => [
        "All",
        ...new Set(
          products
            .map(
              (product) =>
                product.cat
            )
            .filter(Boolean)
        ),
      ],
      [products]
    );

  const visible =
    activeCat === "All"
      ? products
      : products.filter(
          (product) =>
            product.cat ===
            activeCat
        );

  async function addToCart(id) {
  if (session?.role !== "user") {
    alert(
      "Please login as a customer to add items to your cart."
    );
    return;
  }

  try {
    const { data } = await api.post(
      `/cart/${id}`
    );

    updateUserProfile({
      cart: data.cart || [],
    });
  } catch (error) {
    console.error(
      "Add to cart error:",
      error
    );

    alert(
      error.response?.data?.message ||
        "Could not add product to cart."
    );
  }
}

  async function toggleWishlist(id) {
  if (session?.role !== "user") {
    alert(
      "Please login as a customer to save items to your wishlist."
    );
    return;
  }

  try {
    const { data } = await api.post(
      `/wishlist/${id}`
    );

    updateUserProfile({
      wishlist: data.wishlist || [],
    });
  } catch (error) {
    console.error(
      "Wishlist error:",
      error
    );

    alert(
      error.response?.data?.message ||
        "Could not update wishlist."
    );
  }
}

  function getProductImage(
    product
  ) {
    const image =
      product?.images?.[0];

    if (!image) {
      return "";
    }

    if (
      image.startsWith(
        "http://"
      ) ||
      image.startsWith(
        "https://"
      )
    ) {
      return image;
    }

    return `${BACKEND_URL}${image}`;
  }

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <h1>
            Shop All Products
          </h1>

          <p>
            Home / Product
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="filter-bar">
            {categories.map(
              (category) => (
                <button
                  key={
                    category
                  }
                  className={
                    category ===
                    activeCat
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setSearchParams(
                      category ===
                        "All"
                        ? {}
                        : {
                            cat: category,
                          }
                    )
                  }
                >
                  {category}
                </button>
              )
            )}
          </div>

          {loading && (
            <p className="empty-state">
              Loading
              products…
            </p>
          )}

          {error && (
            <p className="empty-state">
              {error}
            </p>
          )}

          {!loading &&
            !error && (
              <div className="grid grid-4">
                {visible.map(
                  (product) => {
                    const imageUrl =
                      getProductImage(
                        product
                      );
                    const isWishlisted =
                      session?.profile?.wishlist?.some(
                        (item) =>
                          String(item?._id || item) ===
                          String(product._id)
                      );

                    return (
                      <div
                          key={product._id}
                          className="product-card"
                          onClick={() =>
                            navigate(`/product/${product._id}`)
                          }
                          style={{
                            cursor: "pointer",
                          }}
                        >
                        <div
                          className="thumb"
                          style={{
                            color:
                              "var(--leaf-dark)",
                            position:
                              "relative",
                            overflow:
                              "hidden",
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
                                  "100%",
                                height:
                                  "100%",
                                display:
                                  "block",
                                objectFit:
                                  "cover",
                              }}
                              onError={(
                                event
                              ) => {
                                event.currentTarget.style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <Icon
                              type={
                                product.icon
                              }
                            />
                          )}

                          <span
                            className="tag-pill"
                            style={{
                              position:
                                "absolute",
                              top: "14px",
                              left: "14px",
                              zIndex: 2,
                            }}
                          >
                            {
                              product.cat
                            }
                          </span>

                          <button
                            className={`fav ${isWishlisted ? "active" : ""}`}
                            title={
                              isWishlisted
                                ? "Remove from wishlist"
                                : "Save to wishlist"
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(product._id);
                            }}
                            style={{
                              position: "absolute",
                              zIndex: 2,
                            }}
                          >
                                                      <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill={
                                isWishlisted
                                  ? "currentColor"
                                  : "none"
                              }
                              stroke="currentColor"
                              strokeWidth="1.8"
                            >
                              <path d="M12 21s-7-4.35-9.5-8.5C.7 8.9 2.5 5 6.2 5c2 0 3.4 1 4.8 2.8C12.4 6 13.8 5 15.8 5c3.7 0 5.5 3.9 3.7 7.5C19 16.65 12 21 12 21Z" />
                            </svg>
                          </button>
                        </div>

                        <div className="body">
                          <div className="cat">
                            {
                              product.unit
                            }
                          </div>

                          <h3>
                            {
                              product.name
                            }
                          </h3>

                          <p
                            style={{
                              fontSize:
                                13.5,
                            }}
                          >
                            {
                              product.desc
                            }
                          </p>

                          <div className="price">
                            <span className="amt">
                              ₹
                              {
                                product.price
                              }
                            </span>

                            <button
                              className="add-btn"
                              title="Add to cart"
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product._id);
                              }}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M12 5v14M5 12h14" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}

          {!loading &&
            !error &&
            visible.length ===
              0 && (
              <p className="empty-state">
                No products
                found in this
                category yet.
              </p>
            )}
        </div>
      </section>
    </>
  );
}