import { Link } from "react-router-dom";

export default function AdminSidebar({
  activeSection,
  setActiveSection,
  logout,
  sidebarOpen,
  setSidebarOpen,
}) {
  const menuItems = [
    {
      key: "dashboard",
      label: "Dashboard",
    },
    {
      key: "products",
      label: "Products",
    },
    {
      key: "orders",
      label: "Orders",
    },
    {
      key: "customers",
      label: "Customers",
    },
    {
      key: "categories",
      label: "Categories",
    },
  ];

  function handleMenuClick(key) {
    setActiveSection(key);
    setSidebarOpen(false);
  }

  return (
    <>
      <div
        className={`admin-sidebar-overlay ${
          sidebarOpen ? "show" : ""
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`admin-sidebar ${
          sidebarOpen ? "open" : ""
        }`}
      >
        {/* Mobile Close Button */}
        <button
          type="button"
          className="admin-sidebar-close"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close admin menu"
        >
          ✕
        </button>

        {/* Logo */}
        <div
          style={{
            paddingBottom: "26px",
            marginBottom: "22px",
            borderBottom:
              "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "#f7f1df",
                color: "var(--leaf-dark)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily:
                  "var(--font-display)",
                fontSize: "20px",
                fontWeight: "700",
                border:
                  "1px solid var(--gold)",
              }}
            >
              AK
            </div>

            <div>
              <div
                style={{
                  fontFamily:
                    "var(--font-display)",
                  fontSize: "20px",
                  fontWeight: "700",
                }}
              >
                AK Herbs
              </div>

              <div
                style={{
                  fontSize: "11px",
                  opacity: 0.75,
                  marginTop: "3px",
                }}
              >
                Admin Panel
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {menuItems.map((item) => {
            const active =
              activeSection === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() =>
                  handleMenuClick(item.key)
                }
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "13px 16px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: active
                    ? "700"
                    : "500",
                  background: active
                    ? "#f6f0df"
                    : "transparent",
                  color: active
                    ? "var(--leaf-dark)"
                    : "#fff",
                  transition:
                    "0.2s ease",
                }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "30px",
          }}
        >
          <Link
            to="/"
            onClick={() =>
              setSidebarOpen(false)
            }
            style={{
              display: "block",
              padding: "12px 16px",
              color: "#fff",
              textDecoration: "none",
              marginBottom: "10px",
              opacity: 0.9,
            }}
          >
            ← View Store
          </Link>

          <button
            type="button"
            onClick={logout}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border:
                "1px solid rgba(255,255,255,0.45)",
              background: "transparent",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}