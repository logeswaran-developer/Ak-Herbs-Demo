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
  const [categories, setCategories] = useState([]);

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    order: "",
    isActive: true,
  });
  const [categoryImage, setCategoryImage] = useState(null);
  const [categoryMsg, setCategoryMsg] = useState(null);
  const [savingCategory, setSavingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const [form, setForm] =
    useState(INITIAL_FORM);

  const [images, setImages] = useState([]);

  const [addMsg, setAddMsg] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [addingProduct, setAddingProduct] =
    useState(false);

  const [editingId, setEditingId] = useState(null);

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
        categoriesRes,
      ] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/products"),
        api.get("/contact"),
        api.get("/categories/admin/all"),
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

      setCategories(
        categoriesRes.data.categories || []
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
  | Add / Update Product
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

      if (editingId) {
        // Edit mode — existing product-ai update pannum
        await api.put(
          `/products/${editingId}`,
          formData
        );

        setAddMsg({
          type: "success",
          text: `"${form.name}" was updated successfully.`,
        });
      } else {
        // Add mode — puthu product create pannum
        await api.post(
          "/products",
          formData
        );

        setAddMsg({
          type: "success",
          text: `"${form.name}" was added to the catalogue.`,
        });
      }

      setForm(INITIAL_FORM);
      setImages([]);
      setEditingId(null);

      await loadAll();
    } catch (error) {
      setAddMsg({
        type: "error",
        text:
          error.response?.data
            ?.message ||
          (editingId
            ? "Could not update product."
            : "Could not add product."),
      });
    } finally {
      setAddingProduct(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Edit Product
  |--------------------------------------------------------------------------
  */

  function handleEdit(product) {
    setEditingId(product._id);

    setForm({
      name: product.name || "",
      cat: product.cat || CATEGORY_OPTIONS[0],
      price: product.price ?? "",
      unit: product.unit || "",
      desc: product.desc || "",
    });

    // Naam puthu images select panna varaikkum, pazhaya images-ai
    // amaidhiyaa vைchikanum, so image field-ai empty-a vைkanum
    setImages([]);

    setAddMsg(null);

    // Add/Edit form irukra "products" section-ku poidum
    setActiveSection("products");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /*
  |--------------------------------------------------------------------------
  | Cancel Edit
  |--------------------------------------------------------------------------
  */

  function cancelEdit() {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setImages([]);
    setAddMsg(null);
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
  | Category helpers
  |--------------------------------------------------------------------------
  */

  const categoryOptions = categories.length
    ? categories
        .filter((category) => category.isActive)
        .map((category) => category.name)
    : CATEGORY_OPTIONS;

  const getCategoryImageUrl = (imagePath) => {
    if (!imagePath) return "";

    if (
      imagePath.startsWith("http://") ||
      imagePath.startsWith("https://")
    ) {
      return imagePath;
    }

    const apiBase =
      import.meta.env.VITE_API_URL ||
      "http://localhost:5000/api";

    const serverBase = apiBase.replace(
      /\/api\/?$/,
      ""
    );

    return `${serverBase}${imagePath}`;
  };

  function resetCategoryForm() {
    setCategoryForm({
      name: "",
      order: "",
      isActive: true,
    });
    setCategoryImage(null);
    setEditingCategoryId(null);
    setCategoryMsg(null);
  }

  function handleCategoryImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      setCategoryImage(null);
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setCategoryMsg({
        type: "error",
        text: "JPG, JPEG, PNG or WEBP image mattum allowed.",
      });
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setCategoryMsg({
        type: "error",
        text: "Category image maximum 5 MB mattum irukkanum.",
      });
      event.target.value = "";
      return;
    }

    setCategoryMsg(null);
    setCategoryImage(file);
  }

  async function handleSaveCategory(event) {
    event.preventDefault();
    setCategoryMsg(null);

    if (!categoryForm.name.trim()) {
      setCategoryMsg({
        type: "error",
        text: "Category name required.",
      });
      return;
    }

    if (!editingCategoryId && !categoryImage) {
      setCategoryMsg({
        type: "error",
        text: "Category image required.",
      });
      return;
    }

    try {
      setSavingCategory(true);

      const formData = new FormData();
      formData.append(
        "name",
        categoryForm.name.trim()
      );
      formData.append(
        "order",
        categoryForm.order === ""
          ? "0"
          : String(Number(categoryForm.order))
      );
      formData.append(
        "isActive",
        String(categoryForm.isActive)
      );

      if (categoryImage) {
        formData.append("image", categoryImage);
      }

      if (editingCategoryId) {
        await api.put(
          `/categories/${editingCategoryId}`,
          formData
        );

        setCategoryMsg({
          type: "success",
          text: "Category updated successfully.",
        });
      } else {
        await api.post(
          "/categories",
          formData
        );

        setCategoryMsg({
          type: "success",
          text: "Category added successfully.",
        });
      }

      setCategoryForm({
        name: "",
        order: "",
        isActive: true,
      });
      setCategoryImage(null);
      setEditingCategoryId(null);

      await loadAll();
    } catch (error) {
      setCategoryMsg({
        type: "error",
        text:
          error.response?.data?.message ||
          "Category save panna mudiyala.",
      });
    } finally {
      setSavingCategory(false);
    }
  }

  function handleEditCategory(category) {
    setEditingCategoryId(category._id);

    setCategoryForm({
      name: category.name || "",
      order: category.order ?? "",
      isActive: category.isActive !== false,
    });

    setCategoryImage(null);
    setCategoryMsg(null);
    setActiveSection("categories");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDeleteCategory(category) {
    const confirmed = window.confirm(
      `"${category.name}" category-ai delete panna sure-ah?`
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/categories/${category._id}`
      );

      if (editingCategoryId === category._id) {
        resetCategoryForm();
      }

      await loadAll();
    } catch (error) {
      window.alert(
        error.response?.data?.message ||
        "Category delete panna mudiyala."
      );
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
        {/* Add / Edit Product */}

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
            {editingId
              ? "Edit Product"
              : "Add New Product"}
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
                  {categoryOptions.map(
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
                {editingId
                  ? " (puthu image select pannala na, pazhaya images amaidhiyaa irukum)"
                  : ""}
              </label>

              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                multiple
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

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <button
                type="submit"
                className="btn btn-primary"
                disabled={addingProduct}
              >
                {addingProduct
                  ? editingId
                    ? "Updating Product..."
                    : "Adding Product..."
                  : editingId
                  ? "Update Product"
                  : "Add Product"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="btn btn-outline-dark"
                  onClick={cancelEdit}
                  disabled={addingProduct}
                >
                  Cancel Edit
                </button>
              )}
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
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                        }}
                      >
                        <button
                          type="button"
                          className="btn btn-outline-dark"
                          style={{
                            padding:
                              "6px 16px",
                            fontSize: 11,
                          }}
                          onClick={() =>
                            handleEdit(
                              product
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="btn btn-outline-dark"
                          style={{
                            padding:
                              "6px 16px",
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
              <div
                className="dashboard-card"
                style={{ marginBottom: 28 }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    flexWrap: "wrap",
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <h3
                      style={{
                        color: "var(--leaf-dark)",
                        marginBottom: 5,
                      }}
                    >
                      {editingCategoryId
                        ? "Edit Category"
                        : "Add New Category"}
                    </h3>

                    <p
                      style={{
                        margin: 0,
                        color: "var(--ink-soft)",
                      }}
                    >
                      Home page Shop by Category section-ai inga manage pannalaam.
                    </p>
                  </div>

                  <span className="pill green">
                    {categories.length} Categories
                  </span>
                </div>

                {categoryMsg && (
                  <div
                    className={`form-msg ${categoryMsg.type}`}
                    style={{ marginBottom: 18 }}
                  >
                    {categoryMsg.text}
                  </div>
                )}

                <form
                  onSubmit={handleSaveCategory}
                  encType="multipart/form-data"
                >
                  <div className="field-row">
                    <div className="field">
                      <label>Category Name</label>

                      <input
                        type="text"
                        required
                        placeholder="e.g. Herbal Powders"
                        value={categoryForm.name}
                        onChange={(event) =>
                          setCategoryForm((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="field">
                      <label>Display Order</label>

                      <input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="e.g. 1"
                        value={categoryForm.order}
                        onChange={(event) =>
                          setCategoryForm((current) => ({
                            ...current,
                            order: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="field-row">
                    <div className="field">
                      <label>
                        Category Image
                        {editingCategoryId
                          ? " (optional while editing)"
                          : ""}
                      </label>

                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        onChange={handleCategoryImageChange}
                      />

                      <small
                        style={{
                          display: "block",
                          marginTop: 7,
                          color: "#6b7280",
                        }}
                      >
                        One image. JPG, PNG or WEBP. Maximum 5 MB.
                      </small>

                      {categoryImage && (
                        <div
                          style={{
                            marginTop: 12,
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <img
                            src={URL.createObjectURL(categoryImage)}
                            alt="Category preview"
                            style={{
                              width: 76,
                              height: 76,
                              objectFit: "cover",
                              borderRadius: "50%",
                              border: "3px solid #e7eadc",
                            }}
                          />

                          <span
                            style={{
                              fontSize: 12,
                              color: "#667085",
                            }}
                          >
                            {categoryImage.name}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="field">
                      <label>Status</label>

                      <select
                        value={
                          categoryForm.isActive
                            ? "active"
                            : "inactive"
                        }
                        onChange={(event) =>
                          setCategoryForm((current) => ({
                            ...current,
                            isActive:
                              event.target.value === "active",
                          }))
                        }
                      >
                        <option value="active">
                          Active
                        </option>

                        <option value="inactive">
                          Inactive
                        </option>
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={savingCategory}
                    >
                      {savingCategory
                        ? "Saving..."
                        : editingCategoryId
                        ? "Update Category"
                        : "Add Category"}
                    </button>

                    {editingCategoryId && (
                      <button
                        type="button"
                        className="btn btn-outline-dark"
                        onClick={resetCategoryForm}
                        disabled={savingCategory}
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="dashboard-card">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    flexWrap: "wrap",
                    marginBottom: 18,
                  }}
                >
                  <div>
                    <h3
                      style={{
                        color: "var(--leaf-dark)",
                        marginBottom: 5,
                      }}
                    >
                      Manage Categories
                    </h3>

                    <p style={{ margin: 0 }}>
                      Active categories customer home page-la show aagum.
                    </p>
                  </div>
                </div>

                {categories.length ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(190px, 1fr))",
                      gap: 18,
                    }}
                  >
                    {categories.map((category) => (
                      <div
                        key={category._id}
                        style={{
                          border: "1px solid #e5e7d8",
                          borderRadius: 16,
                          background: "#fff",
                          padding: 16,
                          textAlign: "center",
                        }}
                      >
                        <img
                          src={getCategoryImageUrl(
                            category.image
                          )}
                          alt={category.name}
                          style={{
                            width: 118,
                            height: 118,
                            borderRadius: "50%",
                            objectFit: "cover",
                            display: "block",
                            margin: "0 auto 14px",
                            border: "4px solid #f1f3e8",
                          }}
                        />

                        <h4
                          style={{
                            margin: "0 0 6px",
                            color: "var(--leaf-dark)",
                            fontSize: 15,
                          }}
                        >
                          {category.name}
                        </h4>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 7,
                            marginBottom: 14,
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              padding: "4px 8px",
                              borderRadius: 20,
                              background:
                                category.isActive
                                  ? "#edf5e8"
                                  : "#f3f4f6",
                              color:
                                category.isActive
                                  ? "#365719"
                                  : "#6b7280",
                            }}
                          >
                            {category.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>

                          <span
                            style={{
                              fontSize: 11,
                              padding: "4px 8px",
                              borderRadius: 20,
                              background: "#f7f3e8",
                              color: "#6b5a38",
                            }}
                          >
                            Order {category.order ?? 0}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 8,
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            type="button"
                            className="btn btn-outline-dark"
                            style={{
                              padding: "6px 14px",
                              fontSize: 11,
                            }}
                            onClick={() =>
                              handleEditCategory(category)
                            }
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
                              handleDeleteCategory(category)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    No categories added yet. First category-ai mela irukkura form-la add pannunga.
                  </div>
                )}
              </div>
            </>
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

        </main>
      </div>
    </section>
  );
}