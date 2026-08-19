const express = require("express");
const fs = require("fs");
const path = require("path");

const Product = require("../models/Product");

const {
  protect,
  requireAdmin,
} = require("../middleware/auth");

const uploadProductImages = require(
  "../middleware/uploadProductImages"
);

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Helper: Uploaded files delete
|--------------------------------------------------------------------------
*/

const deleteUploadedFiles = (files = []) => {
  files.forEach((file) => {
    if (!file?.path) return;

    fs.unlink(file.path, (error) => {
      if (
        error &&
        error.code !== "ENOENT"
      ) {
        console.error(
          "Uploaded file delete error:",
          error.message
        );
      }
    });
  });
};

/*
|--------------------------------------------------------------------------
| Helper: Product image delete
|--------------------------------------------------------------------------
*/

const deleteProductImages = (
  images = []
) => {
  images.forEach((imagePath) => {
    if (
      !imagePath ||
      imagePath.startsWith("http")
    ) {
      return;
    }

    const normalizedPath =
      imagePath.replace(/^[/\\]+/, "");

    const fullPath = path.join(
      __dirname,
      "..",
      normalizedPath
    );

    fs.unlink(fullPath, (error) => {
      if (
        error &&
        error.code !== "ENOENT"
      ) {
        console.error(
          "Product image delete error:",
          error.message
        );
      }
    });
  });
};

/*
|--------------------------------------------------------------------------
| GET /api/products
|--------------------------------------------------------------------------
| Public route
| Optional category filter: ?cat=CategoryName
*/

router.get("/", async (req, res) => {
  try {
    const filter = {};

    if (
      req.query.cat &&
      req.query.cat !== "All"
    ) {
      filter.cat = req.query.cat;
    }

    const products = await Product.find(
      filter
    ).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch products.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET /api/products/:id
|--------------------------------------------------------------------------
| Public route
*/

router.get("/:id", async (req, res) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch product.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| POST /api/products
|--------------------------------------------------------------------------
| Admin only
| Content-Type: multipart/form-data
| Image field name: images
| Maximum images: 5
*/

router.post(
  "/",
  protect,
  requireAdmin,

  (req, res, next) => {
    uploadProductImages.array(
      "images",
      5
    )(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          success: false,
          message:
            error.message ||
            "Image upload failed.",
        });
      }

      next();
    });
  },

  async (req, res) => {
    try {
      const {
        name,
        cat,
        price,
        unit,
        desc,
      } = req.body;

      if (
        !name?.trim() ||
        !cat?.trim() ||
        price === undefined ||
        price === null ||
        price === "" ||
        !unit?.trim() ||
        !desc?.trim()
      ) {
        deleteUploadedFiles(
          req.files
        );

        return res.status(400).json({
          success: false,
          message:
            "Name, category, price, unit and description are required.",
        });
      }

      const numericPrice =
        Number(price);

      if (
        Number.isNaN(numericPrice) ||
        numericPrice < 0
      ) {
        deleteUploadedFiles(
          req.files
        );

        return res.status(400).json({
          success: false,
          message:
            "Price must be a valid positive number.",
        });
      }

      if (
        req.files &&
        req.files.length > 5
      ) {
        deleteUploadedFiles(
          req.files
        );

        return res.status(400).json({
          success: false,
          message:
            "Maximum 5 product images are allowed.",
        });
      }

      const images = (
        req.files || []
      ).map(
        (file) =>
          `/uploads/products/${file.filename}`
      );

      const product =
        await Product.create({
          name: name.trim(),
          cat: cat.trim(),
          price: numericPrice,
          unit: unit.trim(),
          desc: desc.trim(),
          images,
          createdBy: req.user.id,
        });

      return res.status(201).json({
        success: true,
        message:
          "Product added successfully.",
        product,
      });
    } catch (error) {
      // Database error vandha uploaded images clean pannum
      deleteUploadedFiles(req.files);

      return res.status(500).json({
        success: false,
        message:
          "Unable to add product.",
        error: error.message,
      });
    }
  }
);


/*
|--------------------------------------------------------------------------
| PUT /api/products/:id
|--------------------------------------------------------------------------
| Admin only
| Update existing product details & optional images
*/

router.put(
  "/:id",
  protect,
  requireAdmin,

  (req, res, next) => {
    uploadProductImages.array("images", 5)(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message || "Image upload failed.",
        });
      }
      next();
    });
  },

  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        deleteUploadedFiles(req.files);
        return res.status(404).json({
          success: false,
          message: "Product not found.",
        });
      }

      const { name, cat, price, unit, desc } = req.body;

      if (name?.trim()) product.name = name.trim();
      if (cat?.trim()) product.cat = cat.trim();
      if (price !== undefined && price !== null && price !== "") {
        const numericPrice = Number(price);
        if (Number.isNaN(numericPrice) || numericPrice < 0) {
          deleteUploadedFiles(req.files);
          return res.status(400).json({
            success: false,
            message: "Price must be a valid positive number.",
          });
        }
        product.price = numericPrice;
      }
      if (unit?.trim()) product.unit = unit.trim();
      if (desc?.trim()) product.desc = desc.trim();

      if (req.files && req.files.length > 0) {
        deleteProductImages(product.images);
        product.images = req.files.map(
          (file) => `/uploads/products/${file.filename}`
        );
      }

      await product.save();

      return res.status(200).json({
        success: true,
        message: "Product updated successfully.",
        product,
      });
    } catch (error) {
      deleteUploadedFiles(req.files);
      return res.status(500).json({
        success: false,
        message: "Unable to update product.",
        error: error.message,
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| DELETE /api/products/:id
|--------------------------------------------------------------------------
| Admin only
| Product delete aagumbodhu local images-um delete aagum
*/

router.delete(
  "/:id",
  protect,
  requireAdmin,
  async (req, res) => {
    try {
      const product =
        await Product.findById(
          req.params.id
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found.",
        });
      }

      deleteProductImages(
        product.images
      );

      await product.deleteOne();

      return res.status(200).json({
        success: true,
        message:
          "Product and its images removed successfully.",
        id: req.params.id,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          "Unable to delete product.",
        error: error.message,
      });
    }
  }
);

module.exports = router;