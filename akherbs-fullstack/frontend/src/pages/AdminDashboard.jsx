import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import AdminSidebar from "../components/admin/AdminSidebar";

const CATEGORY_OPTIONS = [
  "Nuts & Dry Fruits",
  "Herbal Products",
  "Herbal Soap",
  "Wellness Syrups",
  "Spices & Masalas",
  "Essential Oils",
  "Herbal Powders",
  "Herbal Tea & Drinks",
  "Skin Care",
  "Hair Care",
  "Health Supplements",
  "Combo Packs",
];

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const INITIAL_FORM = {
  name: "",
  cat: CATEGORY_OPTIONS[0],
  price: "",
  unit: "",
  desc: "",
};

export default function AdminDashboard() {
  const { session, logout } = useAuth();

  const [stats, setStats] = useState({
    products: 0,
    users: 0,
    admins: 0,
    orders: 0,
  });

  const [
  activeSection,
  setActiveSection,
] = useState("dashboard");

  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [orders, setOrders] = useState([]);

  const [form, setForm] =
    useState(INITIAL_FORM);

  const [images, setImages] = useState([]);

  const [addMsg, setAddMsg] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [addingProduct, setAddingProduct] =
    useState(false);

  /* Edit Product States */
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState(INITIAL_FORM);
  const [editImages, setEditImages] = useState([]);
  const [updatingProduct, setUpdatingProduct] = useState(false);
  const [editMsg, setEditMsg] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Image previews
  |--------------------------------------------------------------------------
  */

  const imagePreviews = useMemo(() => {
    return images.map((image) => ({
      file: image,
      url: URL.createObjectURL(image),
    }));
  }, [images]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [imagePreviews]);

  /*
  |--------------------------------------------------------------------------
  | Load dashboard data
  |--------------------------------------------------------------------------
  */

  async function loadAll() {
    try {
      setLoading(true);

      const [
        statsRes,
        usersRes,
        productsRes,
        messagesRes,
        ordersRes,
      ] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/products"),
        api.get("/contact"),
        api.get("/admin/orders"),
      ]);

      setStats(statsRes.data);
      setUsers(
        usersRes.data.users || []
      );
      setProducts(
        productsRes.data.products || []
      );
      setMessages(
        messagesRes.data.messages || []
      );
      setOrders(
        ordersRes.data.orders || []
      );
    } catch (error) {
      console.error(
        "Dashboard loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Normal form update
  |--------------------------------------------------------------------------
  */

  function update(field) {
    return (event) => {
      setForm((currentForm) => ({
        ...currentForm,
        [field]: event.target.value,
      }));
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Image selection
  |--------------------------------------------------------------------------
  */

  function handleImageChange(event) {
    setAddMsg(null);

    const selectedFiles = Array.from(
      event.target.files || []
    );

    if (!selectedFiles.length) {
      return;
    }

    const totalImages =
      images.length + selectedFiles.length;

    if (totalImages > MAX_IMAGES) {
      setAddMsg({
        type: "error",
        text: `Maximum ${MAX_IMAGES} images mattum upload panna mudiyum.`,
      });

      event.target.value = "";
      return;
    }

    const invalidTypeFile =
      selectedFiles.find(
        (file) =>
          !ALLOWED_IMAGE_TYPES.includes(
            file.type
          )
      );

    if (invalidTypeFile) {
      setAddMsg({
        type: "error",
        text: "JPG, JPEG, PNG and WEBP images mattum allowed.",
      });

      event.target.value = "";
      return;
    }

    const oversizedFile =
      selectedFiles.find(
        (file) =>
          file.size > MAX_IMAGE_SIZE
      );

    if (oversizedFile) {
      setAddMsg({
        type: "error",
        text: `"${oversizedFile.name}" image 5 MB-ku mela irukku.`,
      });

      event.target.value = "";
      return;
    }

    setImages((currentImages) => [
      ...currentImages,
      ...selectedFiles,
    ]);

    // Same image-ai marubadi select panna allow pannum
    event.target.value = "";
  }

  /*
  |--------------------------------------------------------------------------
  | Remove selected image
  |--------------------------------------------------------------------------
  */

  function removeSelectedImage(index) {
    setImages((currentImages) =>
      currentImages.filter(
        (_, imageIndex) =>
          imageIndex !== index
      )
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Add Product
  |--------------------------------------------------------------------------
  */

  async function handleAddProduct(event) {
    event.preventDefault();
    setAddMsg(null);

    if (images.length > MAX_IMAGES) {
      setAddMsg({
        type: "error",
        text: "Maximum 5 images mattum upload panna mudiyum.",
      });

      return;
    }

    try {
      setAddingProduct(true);

      const formData = new FormData();

      formData.append(
        "name",
        form.name.trim()
      );

      formData.append(
        "cat",
        form.cat
      );

      formData.append(
        "price",
        String(Number(form.price))
      );

      formData.append(
        "unit",
        form.unit.trim()
      );

      formData.append(
        "desc",
        form.desc.trim()
      );

      images.forEach((image) => {
        formData.append(
          "images",
          image
        );
      });

      await api.post(
        "/products",
        formData
      );

      setAddMsg({
        type: "success",
        text: `"${form.name}" was added to the catalogue.`,
      });

      setForm(INITIAL_FORM);
      setImages([]);

      await loadAll();
    } catch (error) {
      setAddMsg({
        type: "error",
        text:
          error.response?.data
            ?.message ||
          "Could not add product.",
      });
    } finally {
      setAddingProduct(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Remove Product
  |--------------------------------------------------------------------------
  */

  async function handleRemove(id) {
    const confirmed =
      window.confirm(
        "Indha product-ai delete panna sure-ah?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/products/${id}`
      );

      await loadAll();
    } catch (error) {
      window.alert(
        error.response?.data
          ?.message ||
          "Product delete panna mudiyala."
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Edit Product Handlers
  |--------------------------------------------------------------------------
  */

  function startEdit(product) {
    setEditingProduct(product);
    setEditForm({
      name: product.name || "",
      cat: product.cat || CATEGORY_OPTIONS[0],
      price: product.price ? String(product.price) : "",
      unit: product.unit || "",
      desc: product.desc || "",
    });
    setEditImages([]);
    setEditMsg(null);
  }

  function updateEditField(field) {
    return (event) => {
      setEditForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };
  }

  async function handleUpdateProduct(event) {
    event.preventDefault();
    setEditMsg(null);

    if (!editingProduct) return;

    try {
      setUpdatingProduct(true);

      const formData = new FormData();
      formData.append("name", editForm.name.trim());
      formData.append("cat", editForm.cat);
      formData.append("price", String(Number(editForm.price)));
      formData.append("unit", editForm.unit.trim());
      formData.append("desc", editForm.desc.trim());

      editImages.forEach((image) => {
        formData.append("images", image);
      });

      await api.put(`/products/${editingProduct._id}`, formData);

      await loadAll();
      setEditingProduct(null);
    } catch (error) {
      setEditMsg({
        type: "error",
        text: error.response?.data?.message || "Could not update product.",
      });
    } finally {
      setUpdatingProduct(false);
    }
  }

  if (loading) {
    return (
      <section className="dashboard-shell">
        <div className="wrap">
          <p className="empty-state">
            Loading dashboard…
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="dashboard-shell"
      style={{
        padding: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          height: "100vh",
          overflow: "hidden",
          background: "#f7f3e8",
        }}
      >
        <AdminSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          logout={logout}
        />

        <main
          className="admin-main-content"
          style={{
            flex: 1,
            minWidth: 0,
            height: "100vh",
            overflowY: "auto",
            overflowX: "hidden",
            padding: "32px",
          }}
        >
          {activeSection === "dashboard" && (
            <>
          {/* Admin Header */}

        {/* Admin Header */}

        <div className="admin-dashboard-header">
          <div className="admin-welcome">
            <h1>
              Welcome Back, {session.profile.name}{" "}
              <span className="admin-wave">👋</span>
            </h1>

            <p>
              Manage your AK Herbs store from one place.
            </p>
          </div>

          <div className="admin-header-actions">
            <div className="admin-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search..."
                aria-label="Search admin panel"
              />
            </div>

            <button
              type="button"
              className="admin-notification-btn"
              aria-label="Customer enquiries"
              onClick={() => setActiveSection("messages")}
              title={`${messages.length} customer enquiries`}
            >
              🔔
              {messages.length > 0 && (
                <span className="admin-notification-count">
                  {messages.length > 99 ? "99+" : messages.length}
                </span>
              )}
            </button>

            <div className="admin-profile-card">
              <div className="admin-profile-logo">
                AK
              </div>

              <div className="admin-profile-info">
                <strong>
                  {session.profile.name}
                </strong>

                <span>
                  Administrator
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}

        <div
          className="grid grid-4"
          style={{
            marginBottom: 36,
          }}
        >
          <div className="dashboard-card">
            <h3
              style={{
                fontSize: 14,
                color:
                  "var(--leaf-dark)",
              }}
            >
              Products
            </h3>

            <p
              style={{
                fontSize: 26,
                fontFamily:
                  "var(--font-display)",
                color: "var(--gold)",
                marginTop: 8,
              }}
            >
              {stats.products}
            </p>
          </div>

          <div className="dashboard-card">
            <h3
              style={{
                fontSize: 14,
                color:
                  "var(--leaf-dark)",
              }}
            >
              Registered Users
            </h3>

            <p
              style={{
                fontSize: 26,
                fontFamily:
                  "var(--font-display)",
                color: "var(--gold)",
                marginTop: 8,
              }}
            >
              {stats.users}
            </p>
          </div>

          <div className="dashboard-card">
            <h3
              style={{
                fontSize: 14,
                color:
                  "var(--leaf-dark)",
              }}
            >
              Admins
            </h3>

            <p
              style={{
                fontSize: 26,
                fontFamily:
                  "var(--font-display)",
                color: "var(--gold)",
                marginTop: 8,
              }}
            >
              {stats.admins}
            </p>
          </div>

          <div className="dashboard-card">
            <h3
              style={{
                fontSize: 14,
                color:
                  "var(--leaf-dark)",
              }}
            >
              Orders
            </h3>

            <p
              style={{
                fontSize: 26,
                fontFamily:
                  "var(--font-display)",
                color: "var(--gold)",
                marginTop: 8,
              }}
            >
              {stats.orders}
            </p>
          </div>
        </div>

        {/* Recent Products + New Customers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 24,
            marginBottom: 36,
          }}
        >
          <div className="dashboard-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <h3
                style={{
                  color: "var(--leaf-dark)",
                  margin: 0,
                }}
              >
                Recent Products
              </h3>

              <button
                type="button"
                className="btn btn-outline-dark"
                style={{
                  padding: "6px 14px",
                  fontSize: 11,
                }}
                onClick={() => setActiveSection("products")}
              >
                View All →
              </button>
            </div>

            {products.length ? (
              <div style={{ overflowX: "auto" }}>
                <table className="table-simple">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.slice(0, 5).map((product) => (
                      <tr key={product._id}>
                        <td>{product.name}</td>
                        <td>{product.cat}</td>
                        <td>₹{product.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No products added yet.</p>
            )}
          </div>

          <div className="dashboard-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <h3
                style={{
                  color: "var(--leaf-dark)",
                  margin: 0,
                }}
              >
                New Customers
              </h3>

              <button
                type="button"
                className="btn btn-outline-dark"
                style={{
                  padding: "6px 14px",
                  fontSize: 11,
                }}
                onClick={() => setActiveSection("customers")}
              >
                View All →
              </button>
            </div>

            {users.length ? (
              <div style={{ overflowX: "auto" }}>
                <table className="table-simple">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 5).map((user) => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.phone || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No customers have registered yet.</p>
            )}
          </div>
        </div>

            </>
          )}

          {activeSection === "products" && (
            <>
        {/* Add Product */}

        <div
          className="dashboard-card"
          style={{ marginBottom: 28 }}
        >
          <h3
            style={{
              color:
                "var(--leaf-dark)",
              marginBottom: 18,
            }}
          >
            Add New Product
          </h3>

          {addMsg && (
            <div
              className={`form-msg ${addMsg.type}`}
            >
              {addMsg.text}
            </div>
          )}

          <form
            onSubmit={
              handleAddProduct
            }
            encType="multipart/form-data"
          >
            <div className="field-row">
              <div className="field">
                <label>
                  Product Name
                </label>

                <input
                  type="text"
                  required
                  placeholder="e.g. Herbal Face Pack"
                  value={form.name}
                  onChange={update(
                    "name"
                  )}
                />
              </div>

              <div className="field">
                <label>Category</label>

                <select
                  value={form.cat}
                  onChange={update(
                    "cat"
                  )}
                  required
                >
                  {CATEGORY_OPTIONS.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label>
                  Price (₹)
                </label>

                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  placeholder="299"
                  value={form.price}
                  onChange={update(
                    "price"
                  )}
                />
              </div>

              <div className="field">
                <label>
                  Unit / Pack Size
                </label>

                <input
                  type="text"
                  required
                  placeholder="e.g. 100g"
                  value={form.unit}
                  onChange={update(
                    "unit"
                  )}
                />
              </div>
            </div>

            <div className="field">
              <label>
                Short Description
              </label>

              <input
                type="text"
                required
                placeholder="One-line description"
                value={form.desc}
                onChange={update(
                  "desc"
                )}
              />
            </div>

            {/* Product Images */}

            <div className="field">
              <label>
                Product Images
              </label>

              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                multiple
                required={images.length === 0}
                onChange={
                  handleImageChange
                }
                disabled={
                  images.length >=
                  MAX_IMAGES
                }
              />

              <small
                style={{
                  display: "block",
                  marginTop: 7,
                  color: "#6b7280",
                }}
              >
                Maximum 5 images.
                JPG, PNG or WEBP.
                Each image maximum 5
                MB. Selected:{" "}
                {images.length}/
                {MAX_IMAGES}
              </small>
            </div>

            {/* Image Previews */}

            {imagePreviews.length >
              0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(130px, 1fr))",
                  gap: 14,
                  marginBottom: 22,
                }}
              >
                {imagePreviews.map(
                  (
                    preview,
                    index
                  ) => (
                    <div
                      key={`${preview.file.name}-${preview.file.lastModified}-${index}`}
                      style={{
                        position:
                          "relative",
                        border:
                          "1px solid #ddd",
                        borderRadius: 10,
                        padding: 6,
                        background:
                          "#fff",
                      }}
                    >
                      <img
                        src={preview.url}
                        alt={`Selected product ${index + 1}`}
                        style={{
                          width: "100%",
                          height: 120,
                          objectFit:
                            "cover",
                          borderRadius: 7,
                          display:
                            "block",
                        }}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeSelectedImage(
                            index
                          )
                        }
                        aria-label={`Remove image ${index + 1}`}
                        style={{
                          position:
                            "absolute",
                          top: 10,
                          right: 10,
                          width: 28,
                          height: 28,
                          borderRadius:
                            "50%",
                          border: "none",
                          background:
                            "rgba(0, 0, 0, 0.72)",
                          color: "#fff",
                          cursor:
                            "pointer",
                          fontSize: 16,
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>

                      <p
                        title={
                          preview.file
                            .name
                        }
                        style={{
                          margin:
                            "7px 4px 2px",
                          fontSize: 11,
                          whiteSpace:
                            "nowrap",
                          overflow:
                            "hidden",
                          textOverflow:
                            "ellipsis",
                        }}
                      >
                        {
                          preview.file
                            .name
                        }
                      </p>
                    </div>
                  )
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={addingProduct}
              >
                {addingProduct
                  ? "Adding Product..."
                  : "Add Product"}
              </button>

              <button
                type="button"
                className="btn btn-outline-dark"
                disabled={addingProduct}
                onClick={() => {
                  setForm(INITIAL_FORM);
                  setImages([]);
                  setAddMsg(null);
                }}
              >
                Reset Form
              </button>
            </div>
          </form>
        </div>

        {/* Manage Products */}

        <div
          className="dashboard-card"
          style={{ marginBottom: 28 }}
        >
          <h3
            style={{
              color:
                "var(--leaf-dark)",
              marginBottom: 16,
            }}
          >
            Manage Products
          </h3>

          <table className="table-simple">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Unit</th>
                <th>Images</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {products.map(
                (product) => (
                  <tr
                    key={product._id}
                  >
                    <td>
                      {product.name}
                    </td>

                    <td>
                      {product.cat}
                    </td>

                    <td>
                      ₹{product.price}
                    </td>

                    <td>
                      {product.unit}
                    </td>

                    <td>
                      {product.images
                        ?.length || 0}
                    </td>

                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{
                            padding: "6px 14px",
                            fontSize: 11,
                          }}
                          onClick={() => startEdit(product)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="btn btn-outline-dark"
                          style={{
                            padding: "6px 14px",
                            fontSize: 11,
                          }}
                          onClick={() =>
                            handleRemove(
                              product._id
                            )
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}

              {!products.length && (
                <tr>
                  <td colSpan="6">
                    No products added
                    yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

            </>
          )}

          {activeSection === "customers" && (
            <>
        {/* Customers */}

        <div className="dashboard-card">
          <h3
            style={{
              color:
                "var(--leaf-dark)",
              marginBottom: 16,
            }}
          >
            Registered Customers
          </h3>

          {users.length ? (
            <table className="table-simple">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      {user.name}
                    </td>

                    <td>
                      {user.email}
                    </td>

                    <td>
                      {user.phone ||
                        "—"}
                    </td>

                    <td>
                      <span className="pill green">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>
              No customers have
              registered yet.
            </p>
          )}
        </div>
            </>
          )}

          {activeSection === "categories" && (
            <>
              {/* Categories Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 28,
                  flexWrap: "wrap",
                  gap: 16,
                }}
              >
                <div>
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--leaf-dark)",
                      margin: 0,
                      fontSize: 24,
                    }}
                  >
                    📂 Categories
                  </h2>
                  <p
                    style={{
                      color: "var(--ink-soft)",
                      marginTop: 6,
                      fontSize: 14,
                    }}
                  >
                    All product categories available in your store
                  </p>
                </div>

                <span
                  className="pill green"
                  style={{ fontSize: 13, padding: "6px 16px" }}
                >
                  {CATEGORY_OPTIONS.length} Categories
                </span>
              </div>

              {/* Categories Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 20,
                  marginBottom: 36,
                }}
              >
                {CATEGORY_OPTIONS.map((cat, idx) => {
                  const catIcons = [
                    "🥜", "🌿", "🧼", "🍯",
                    "🌶️", "💧", "🫘", "🍵",
                    "✨", "💆", "💊", "📦",
                  ];
                  const catColors = [
                    "#fef3c7", "#d1fae5", "#e0e7ff", "#fce7f3",
                    "#fee2e2", "#dbeafe", "#fde68a", "#d1fae5",
                    "#ede9fe", "#fce7f3", "#cffafe", "#f3f4f6",
                  ];
                  const catBorders = [
                    "#f59e0b", "#10b981", "#6366f1", "#ec4899",
                    "#ef4444", "#3b82f6", "#d97706", "#059669",
                    "#8b5cf6", "#db2777", "#06b6d4", "#9ca3af",
                  ];

                  const productCount = products.filter(
                    (p) => p.cat === cat
                  ).length;

                  return (
                    <div
                      key={cat}
                      className="dashboard-card"
                      style={{
                        borderLeft: `4px solid ${
                          catBorders[idx % catBorders.length]
                        }`,
                        background: `linear-gradient(135deg, #fff 60%, ${
                          catColors[idx % catColors.length]
                        })`,
                        transition: "transform 0.2s, box-shadow 0.2s",
                        cursor: "default",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform =
                          "translateY(-3px)";
                        e.currentTarget.style.boxShadow =
                          "0 8px 25px rgba(0,0,0,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform =
                          "translateY(0)";
                        e.currentTarget.style.boxShadow = "";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          marginBottom: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background:
                              catColors[idx % catColors.length],
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 24,
                            flexShrink: 0,
                          }}
                        >
                          {catIcons[idx % catIcons.length]}
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <h4
                            style={{
                              margin: 0,
                              color: "var(--leaf-dark)",
                              fontSize: 15,
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {cat}
                          </h4>
                          <span
                            style={{
                              fontSize: 12,
                              color: "var(--ink-soft)",
                            }}
                          >
                            {productCount}{" "}
                            {productCount === 1
                              ? "product"
                              : "products"}
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          width: "100%",
                          height: 4,
                          borderRadius: 4,
                          background: "#e5e7eb",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${
                              products.length
                                ? Math.max(
                                    (productCount /
                                      products.length) *
                                      100,
                                    productCount > 0 ? 8 : 0
                                  )
                                : 0
                            }%`,
                            height: "100%",
                            borderRadius: 4,
                            background:
                              catBorders[
                                idx % catBorders.length
                              ],
                            transition: "width 0.5s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Category Summary Table */}
              <div className="dashboard-card">
                <h3
                  style={{
                    color: "var(--leaf-dark)",
                    marginBottom: 16,
                  }}
                >
                  Category Summary
                </h3>

                <div style={{ overflowX: "auto" }}>
                  <table className="table-simple">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Category Name</th>
                        <th>Products</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {CATEGORY_OPTIONS.map((cat, idx) => {
                        const count = products.filter(
                          (p) => p.cat === cat
                        ).length;

                        return (
                          <tr key={cat}>
                            <td>{idx + 1}</td>
                            <td>
                              <strong>{cat}</strong>
                            </td>
                            <td>{count}</td>
                            <td>
                              <span
                                className={`pill ${
                                  count > 0
                                    ? "green"
                                    : ""
                                }`}
                                style={
                                  count === 0
                                    ? {
                                        background:
                                          "#f3f4f6",
                                        color:
                                          "#6b7280",
                                      }
                                    : {}
                                }
                              >
                                {count > 0
                                  ? "Active"
                                  : "Empty"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeSection === "orders" && (
            <div className="dashboard-card">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  marginBottom: 22,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h3 style={{ color: "var(--leaf-dark)", marginBottom: 5 }}>
                    Customer Orders Management
                  </h3>
                  <p>Track and manage customer order status.</p>
                </div>
                <span className="pill green">{orders.length} Orders Total</span>
              </div>

              {orders.length ? (
                <div style={{ overflowX: "auto" }}>
                  <table className="table-simple">
                    <thead>
                      <tr>
                        <th>Order ID & Date</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((ord) => (
                        <tr key={ord._id}>
                          <td>
                            <strong>#{ord._id.slice(-6)}</strong>
                            <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                              {new Date(ord.createdAt).toLocaleDateString("en-IN")}
                            </div>
                          </td>
                          <td>
                            <div><strong>{ord.user?.name || ord.shippingAddress?.name}</strong></div>
                            <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                              {ord.shippingAddress?.phone}
                            </div>
                          </td>
                          <td>
                            {ord.items?.map((it, i) => (
                              <div key={i} style={{ fontSize: 13 }}>
                                {it.name} (x{it.quantity})
                              </div>
                            ))}
                          </td>
                          <td>
                            <strong>₹{ord.totalAmount}</strong>
                            <div style={{ fontSize: 11, color: "#6b7280" }}>{ord.paymentMethod}</div>
                          </td>
                          <td>
                            <span
                              className="pill"
                              style={{
                                background:
                                  ord.status === "Delivered" ? "#d1fae5" :
                                  ord.status === "Shipped" ? "#dbeafe" :
                                  ord.status === "Processing" ? "#fef3c7" : "#f3f4f6",
                                color:
                                  ord.status === "Delivered" ? "#065f46" :
                                  ord.status === "Shipped" ? "#1e40af" :
                                  ord.status === "Processing" ? "#92400e" : "#374151",
                              }}
                            >
                              {ord.status}
                            </span>
                          </td>
                          <td>
                            <select
                              value={ord.status}
                              onChange={async (e) => {
                                const newStatus = e.target.value;
                                try {
                                  await api.put(`/admin/orders/${ord._id}/status`, { status: newStatus });
                                  loadAll();
                                } catch (err) {
                                  alert("Failed to update status");
                                }
                              }}
                              style={{ padding: "4px 8px", borderRadius: "6px", fontSize: "12px" }}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No orders placed yet.</p>
              )}
            </div>
          )}

          {activeSection === "messages" && (
            <div className="dashboard-card">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  marginBottom: 22,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h3
                    style={{
                      color: "var(--leaf-dark)",
                      marginBottom: 5,
                    }}
                  >
                    Customer Enquiries
                  </h3>

                  <p>
                    Messages received from the Contact page.
                  </p>
                </div>

                <span className="pill green">
                  {messages.length} Messages
                </span>
              </div>

              {messages.length ? (
                <div style={{ overflowX: "auto" }}>
                  <table className="table-simple">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Contact</th>
                        <th>Message</th>
                        <th>Date</th>
                      </tr>
                    </thead>

                    <tbody>
                      {messages.map((message) => (
                        <tr key={message._id}>
                          <td>
                            <strong>{message.name}</strong>
                          </td>

                          <td>
                            <div>{message.email}</div>
                            <div
                              style={{
                                marginTop: 4,
                                fontSize: 12,
                                color: "var(--ink-soft)",
                              }}
                            >
                              {message.phone || "No phone"}
                            </div>
                          </td>

                          <td
                            style={{
                              minWidth: 260,
                              whiteSpace: "normal",
                              lineHeight: 1.6,
                            }}
                          >
                            {message.message}
                          </td>

                          <td style={{ whiteSpace: "nowrap" }}>
                            {message.createdAt
                              ? new Date(
                                  message.createdAt
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  No customer enquiries yet.
                </div>
              )}
            </div>
          )}

          {/* Edit Product Modal */}
          {editingProduct && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2000,
                padding: "20px",
              }}
              onClick={() => setEditingProduct(null)}
            >
              <div
                className="dashboard-card"
                style={{
                  maxWidth: "600px",
                  width: "100%",
                  maxHeight: "90vh",
                  overflowY: "auto",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <h3 style={{ color: "var(--leaf-dark)", margin: 0 }}>
                    Edit Product
                  </h3>
                  <button
                    type="button"
                    style={{
                      border: "none",
                      background: "transparent",
                      fontSize: "24px",
                      cursor: "pointer",
                    }}
                    onClick={() => setEditingProduct(null)}
                  >
                    ×
                  </button>
                </div>

                {editMsg && (
                  <div className={`form-msg ${editMsg.type}`}>
                    {editMsg.text}
                  </div>
                )}

                <form onSubmit={handleUpdateProduct} encType="multipart/form-data">
                  <div className="field-row">
                    <div className="field">
                      <label>Product Name</label>
                      <input
                        type="text"
                        required
                        value={editForm.name}
                        onChange={updateEditField("name")}
                      />
                    </div>

                    <div className="field">
                      <label>Category</label>
                      <select
                        value={editForm.cat}
                        onChange={updateEditField("cat")}
                        required
                      >
                        {CATEGORY_OPTIONS.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="field-row">
                    <div className="field">
                      <label>Price (₹)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        step="0.01"
                        value={editForm.price}
                        onChange={updateEditField("price")}
                      />
                    </div>

                    <div className="field">
                      <label>Unit / Pack Size</label>
                      <input
                        type="text"
                        required
                        value={editForm.unit}
                        onChange={updateEditField("unit")}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>Short Description</label>
                    <input
                      type="text"
                      required
                      value={editForm.desc}
                      onChange={updateEditField("desc")}
                    />
                  </div>

                  <div className="field">
                    <label>Replace Images (Optional)</label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      multiple
                      onChange={(e) => {
                        setEditImages(Array.from(e.target.files || []));
                      }}
                    />
                    <small style={{ display: "block", marginTop: 7, color: "#6b7280" }}>
                      Leave empty to keep existing images. Max 5 images.
                    </small>
                  </div>

                  <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={updatingProduct}
                    >
                      {updatingProduct ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-dark"
                      disabled={updatingProduct}
                      onClick={() => setEditingProduct(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </section>
  );
}