import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
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

export default function ProductDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const {
    session,
  } = useAuth();

  const [
    product,
    setProduct,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    activeImage,
    setActiveImage,
  ] = useState(0);

  const [
    quantity,
    setQuantity,
  ] = useState(1);

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const { data } =
          await api.get(
            `/products/${id}`
          );

        if (!cancelled) {
          setProduct(
            data.product ||
              data
          );
        }
      } catch (error) {
        console.error(
          "Product load error:",
          error
        );

        if (!cancelled) {
          setError(
            "Could not load this product."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  function getImageUrl(image) {
    if (!image) {
      return "";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `${BACKEND_URL}${image}`;
  }

  async function addToCart() {
    if (
      session?.role !== "user"
    ) {
      alert(
        "Please login as a customer to add items to your cart."
      );

      navigate("/login");

      return;
    }

    try {
      await api.post(
        `/cart/${product._id}`
      );

      alert(
        `${product.name} added to cart.`
      );
    } catch (error) {
      console.error(
        "Add to cart error:",
        error
      );

      alert(
        "Could not add product to cart."
      );
    }
  }

  async function addToWishlist() {
    if (
      session?.role !== "user"
    ) {
      alert(
        "Please login as a customer to save items to your wishlist."
      );

      navigate("/login");

      return;
    }

    try {
      await api.post(
        `/wishlist/${product._id}`
      );

      alert(
        `${product.name} saved to wishlist.`
      );
    } catch (error) {
      console.error(
        "Wishlist error:",
        error
      );

      alert(
        "Could not save product to wishlist."
      );
    }
  }

  if (loading) {
    return (
      <section className="section">
        <div className="wrap">
          <p className="empty-state">
            Loading product...
          </p>
        </div>
      </section>
    );
  }

  if (
    error ||
    !product
  ) {
    return (
      <section className="section">
        <div className="wrap">
          <p className="empty-state">
            {error ||
              "Product not found."}
          </p>
        </div>
      </section>
    );
  }

  const images =
    product.images || [];

  const mainImage =
    images.length > 0
      ? getImageUrl(
          images[
            activeImage
          ]
        )
      : "";

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <h1>
            Product Details
          </h1>

          <p>
            Home / Product /{" "}
            {product.name}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 1fr) minmax(0, 1fr)",
              gap: "50px",
              alignItems:
                "start",
            }}
          >
            {/* LEFT SIDE */}
            <div>
              <div
                style={{
                  width: "100%",
                  minHeight:
                    "480px",
                  borderRadius:
                    "22px",
                  overflow:
                    "hidden",
                  background:
                    "#f6f3e8",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  border:
                    "1px solid rgba(0,0,0,0.06)",
                }}
              >
                {mainImage ? (
                  <img
                    src={
                      mainImage
                    }
                    alt={
                      product.name
                    }
                    style={{
                      width:
                        "100%",
                      height:
                        "480px",
                      objectFit:
                        "cover",
                      display:
                        "block",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width:
                        "150px",
                      color:
                        "var(--leaf-dark)",
                    }}
                  >
                    <Icon
                      type={
                        product.icon
                      }
                    />
                  </div>
                )}
              </div>

              {images.length >
                1 && (
                <div
                  style={{
                    display:
                      "flex",
                    gap: "12px",
                    marginTop:
                      "16px",
                    flexWrap:
                      "wrap",
                  }}
                >
                  {images.map(
                    (
                      image,
                      index
                    ) => (
                      <button
                        key={
                          index
                        }
                        type="button"
                        onClick={() =>
                          setActiveImage(
                            index
                          )
                        }
                        style={{
                          width:
                            "84px",
                          height:
                            "84px",
                          padding: 0,
                          borderRadius:
                            "12px",
                          overflow:
                            "hidden",
                          cursor:
                            "pointer",
                          border:
                            activeImage ===
                            index
                              ? "2px solid var(--leaf-dark)"
                              : "1px solid #ddd",
                          background:
                            "#fff",
                        }}
                      >
                        <img
                          src={getImageUrl(
                            image
                          )}
                          alt={`${product.name} ${
                            index +
                            1
                          }`}
                          style={{
                            width:
                              "100%",
                            height:
                              "100%",
                            objectFit:
                              "cover",
                          }}
                        />
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* RIGHT SIDE */}
            <div>
              <span
                className="tag-pill"
                style={{
                  display:
                    "inline-block",
                  marginBottom:
                    "18px",
                }}
              >
                {product.cat}
              </span>

              <h2
                style={{
                  fontSize:
                    "38px",
                  lineHeight:
                    1.15,
                  margin:
                    "0 0 12px",
                  color:
                    "var(--leaf-dark)",
                }}
              >
                {product.name}
              </h2>

              <div
                style={{
                  fontSize:
                    "28px",
                  fontWeight:
                    "700",
                  marginBottom:
                    "12px",
                }}
              >
                ₹{product.price}
              </div>

              {product.unit && (
                <p
                  style={{
                    fontWeight:
                      "600",
                    marginBottom:
                      "22px",
                  }}
                >
                  Pack Size:{" "}
                  {product.unit}
                </p>
              )}

              <p
                style={{
                  fontSize:
                    "15.5px",
                  lineHeight:
                    "1.8",
                  color:
                    "#5d655c",
                  marginBottom:
                    "30px",
                }}
              >
                {product.desc}
              </p>

              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: "14px",
                  marginBottom:
                    "28px",
                }}
              >
                <strong>
                  Quantity
                </strong>

                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    border:
                      "1px solid #ddd",
                    borderRadius:
                      "30px",
                    overflow:
                      "hidden",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(
                        (value) =>
                          Math.max(
                            1,
                            value -
                              1
                          )
                      )
                    }
                    style={{
                      width:
                        "42px",
                      height:
                        "42px",
                      border: 0,
                      background:
                        "transparent",
                      cursor:
                        "pointer",
                      fontSize:
                        "20px",
                    }}
                  >
                    −
                  </button>

                  <span
                    style={{
                      minWidth:
                        "38px",
                      textAlign:
                        "center",
                      fontWeight:
                        "700",
                    }}
                  >
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(
                        (value) =>
                          value +
                          1
                      )
                    }
                    style={{
                      width:
                        "42px",
                      height:
                        "42px",
                      border: 0,
                      background:
                        "transparent",
                      cursor:
                        "pointer",
                      fontSize:
                        "20px",
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div
                style={{
                  display:
                    "flex",
                  gap: "14px",
                  flexWrap:
                    "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={
                    addToCart
                  }
                  className="btn-primary"
                  style={{
                    minWidth:
                      "190px",
                  }}
                >
                  Add to Cart
                </button>

                <button
                  type="button"
                  onClick={
                    addToWishlist
                  }
                  style={{
                    minWidth:
                      "190px",
                    padding:
                      "13px 22px",
                    borderRadius:
                      "30px",
                    border:
                      "1px solid var(--leaf-dark)",
                    background:
                      "transparent",
                    color:
                      "var(--leaf-dark)",
                    fontWeight:
                      "700",
                    cursor:
                      "pointer",
                  }}
                >
                  ♡ Add to Wishlist
                </button>
              </div>

              <div
                style={{
                  marginTop:
                    "36px",
                  padding:
                    "22px",
                  borderRadius:
                    "16px",
                  background:
                    "#f7f5ec",
                }}
              >
                <h3
                  style={{
                    marginTop: 0,
                    marginBottom:
                      "10px",
                  }}
                >
                  Product Details
                </h3>

                <p
                  style={{
                    margin: 0,
                    lineHeight:
                      "1.7",
                    color:
                      "#60675e",
                  }}
                >
                  Category:{" "}
                  {product.cat}
                  <br />
                  Pack Size:{" "}
                  {product.unit ||
                    "Not specified"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}