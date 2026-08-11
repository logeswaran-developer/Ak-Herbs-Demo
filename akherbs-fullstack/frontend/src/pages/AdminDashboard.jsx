import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

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

  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);

  const [form, setForm] =
    useState(INITIAL_FORM);

  const [images, setImages] = useState([]);

  const [addMsg, setAddMsg] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [addingProduct, setAddingProduct] =
    useState(false);

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
      ] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/products"),
      ]);

      setStats(statsRes.data);
      setUsers(
        usersRes.data.users || []
      );
      setProducts(
        productsRes.data.products || []
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
    <section className="dashboard-shell">
      <div className="wrap">
        {/* Admin Header */}

        <div
          className="dashboard-card"
          style={{
            marginBottom: 28,
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <h2
              style={{
                color:
                  "var(--leaf-dark)",
                fontSize: 24,
              }}
            >
              Welcome,{" "}
              {session.profile.name}
            </h2>

            <p style={{ marginTop: 6 }}>
              {session.profile.email} ·
              Store Administrator
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline-dark"
            onClick={logout}
          >
            Logout
          </button>
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

            <button
              type="submit"
              className="btn btn-primary"
              disabled={addingProduct}
            >
              {addingProduct
                ? "Adding Product..."
                : "Add Product"}
            </button>
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
      </div>
    </section>
  );
}