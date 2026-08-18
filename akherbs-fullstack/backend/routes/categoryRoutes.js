const express = require("express");
const fs = require("fs");
const path = require("path");

const Category = require("../models/Category");

const {
  protect,
  requireAdmin,
} = require("../middleware/auth");

const uploadCategoryImage = require(
  "../middleware/uploadCategoryImage"
);

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GET ALL ACTIVE CATEGORIES
|--------------------------------------------------------------------------
| Public
| GET /api/categories
*/

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({
      isActive: true,
    }).sort({
      order: 1,
      createdAt: 1,
    });

    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Unable to load categories.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET ALL CATEGORIES FOR ADMIN
|--------------------------------------------------------------------------
| GET /api/categories/admin/all
*/

router.get(
  "/admin/all",
  protect,
  requireAdmin,
  async (req, res) => {
    try {
      const categories =
        await Category.find().sort({
          order: 1,
          createdAt: 1,
        });

      return res.status(200).json({
        success: true,
        categories,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          "Unable to load categories.",
        error: error.message,
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| CREATE CATEGORY
|--------------------------------------------------------------------------
| POST /api/categories
|
| FormData:
| name
| image
| order
*/

router.post(
  "/",
  protect,
  requireAdmin,
  uploadCategoryImage.single("image"),
  async (req, res) => {
    try {
      const { name, order } = req.body;

      if (!name?.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Category name is required.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "Category image is required.",
        });
      }

      const existing =
        await Category.findOne({
          name: {
            $regex: `^${name.trim()}$`,
            $options: "i",
          },
        });

      if (existing) {
        if (req.file?.path) {
          fs.unlink(
            req.file.path,
            () => {}
          );
        }

        return res.status(409).json({
          success: false,
          message:
            "Category already exists.",
        });
      }

      const imageUrl =
        `/uploads/categories/${req.file.filename}`;

      const category =
        await Category.create({
          name: name.trim(),

          image: imageUrl,

          order:
            Number.isFinite(Number(order))
              ? Number(order)
              : 0,

          createdBy: req.user.id,
        });

      return res.status(201).json({
        success: true,
        message:
          "Category created successfully.",
        category,
      });
    } catch (error) {
      if (req.file?.path) {
        fs.unlink(
          req.file.path,
          () => {}
        );
      }

      return res.status(500).json({
        success: false,
        message:
          "Unable to create category.",
        error: error.message,
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| UPDATE CATEGORY
|--------------------------------------------------------------------------
| PUT /api/categories/:id
*/

router.put(
  "/:id",
  protect,
  requireAdmin,
  uploadCategoryImage.single("image"),
  async (req, res) => {
    try {
      const category =
        await Category.findById(
          req.params.id
        );

      if (!category) {
        if (req.file?.path) {
          fs.unlink(
            req.file.path,
            () => {}
          );
        }

        return res.status(404).json({
          success: false,
          message:
            "Category not found.",
        });
      }

      const {
        name,
        order,
        isActive,
      } = req.body;

      if (
        name &&
        name.trim() !== category.name
      ) {
        const existing =
          await Category.findOne({
            _id: {
              $ne: category._id,
            },

            name: {
              $regex:
                `^${name.trim()}$`,
              $options: "i",
            },
          });

        if (existing) {
          if (req.file?.path) {
            fs.unlink(
              req.file.path,
              () => {}
            );
          }

          return res.status(409).json({
            success: false,
            message:
              "Another category with this name already exists.",
          });
        }

        category.name =
          name.trim();
      }

      if (order !== undefined) {
        category.order =
          Number(order) || 0;
      }

      if (isActive !== undefined) {
        category.isActive =
          String(isActive) === "true";
      }

      if (req.file) {
        const oldImage =
          category.image;

        category.image =
          `/uploads/categories/${req.file.filename}`;

        if (
          oldImage &&
          oldImage.startsWith(
            "/uploads/categories/"
          )
        ) {
          const oldFilePath =
            path.join(
              __dirname,
              "..",
              oldImage
            );

          fs.unlink(
            oldFilePath,
            () => {}
          );
        }
      }

      await category.save();

      return res.status(200).json({
        success: true,
        message:
          "Category updated successfully.",
        category,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          "Unable to update category.",
        error: error.message,
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| DELETE CATEGORY
|--------------------------------------------------------------------------
| DELETE /api/categories/:id
*/

router.delete(
  "/:id",
  protect,
  requireAdmin,
  async (req, res) => {
    try {
      const category =
        await Category.findById(
          req.params.id
        );

      if (!category) {
        return res.status(404).json({
          success: false,
          message:
            "Category not found.",
        });
      }

      if (
        category.image &&
        category.image.startsWith(
          "/uploads/categories/"
        )
      ) {
        const filePath =
          path.join(
            __dirname,
            "..",
            category.image
          );

        fs.unlink(
          filePath,
          () => {}
        );
      }

      await category.deleteOne();

      return res.status(200).json({
        success: true,
        message:
          "Category deleted successfully.",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          "Unable to delete category.",
        error: error.message,
      });
    }
  }
);

module.exports = router;