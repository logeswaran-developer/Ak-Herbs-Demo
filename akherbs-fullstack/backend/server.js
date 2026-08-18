require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const contactRoutes = require("./routes/contactRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const app = express();

/*
|--------------------------------------------------------------------------
| Ensure Upload Directories Exist
|--------------------------------------------------------------------------
*/

const uploadsDirectory = path.join(
  __dirname,
  "uploads"
);

const productUploadsDirectory = path.join(
  uploadsDirectory,
  "products"
);

if (!fs.existsSync(productUploadsDirectory)) {
  fs.mkdirSync(productUploadsDirectory, {
    recursive: true,
  });
}

/*
|--------------------------------------------------------------------------
| CORS Configuration
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow Postman, Thunder Client and server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(
          `CORS blocked for origin: ${origin}`
        )
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

/*
|--------------------------------------------------------------------------
| Body Parsers
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

/*
|--------------------------------------------------------------------------
| Static Uploaded Files
|--------------------------------------------------------------------------
|
| Example URL:
| http://localhost:5000/uploads/products/image-name.jpg
|
*/

app.use(
  "/uploads",
  express.static(uploadsDirectory, {
    fallthrough: true,
    maxAge:
      process.env.NODE_ENV === "production"
        ? "7d"
        : 0,
  })
);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    status: "ok",
    service: "akherbs-backend",
    uploadsUrl: `http://localhost:${process.env.PORT || 5000}/uploads`,
  });
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/contact", contactRoutes);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/*
|--------------------------------------------------------------------------
| Central Error Handler
|--------------------------------------------------------------------------
*/

app.use((error, req, res, next) => {
  console.error("Server error:", error);

  if (
    error.message?.startsWith(
      "CORS blocked"
    )
  ) {
    return res.status(403).json({
      success: false,
      message: error.message,
    });
  }

  return res
    .status(
      error.statusCode ||
        error.status ||
        500
    )
    .json({
      success: false,
      message:
        error.message ||
        "Something went wrong on the server.",
    });
});

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

const PORT =
  process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `AK Herbs API running on http://localhost:${PORT}`
      );

      console.log(
        `Uploads available at http://localhost:${PORT}/uploads`
      );
    });
  } catch (error) {
    console.error(
      "Failed to start AK Herbs server:",
      error.message
    );

    process.exit(1);
  }
};

startServer();