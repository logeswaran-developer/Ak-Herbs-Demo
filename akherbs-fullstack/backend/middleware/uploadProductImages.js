const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Product images save aagura folder
const uploadDirectory = path.join(
  __dirname,
  "..",
  "uploads",
  "products"
);

// Folder illana automatic-ah create pannum
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const originalName = path
      .parse(file.originalname)
      .name
      .replace(/[^a-zA-Z0-9-_]/g, "-");

    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}-${originalName}${extension}`;

    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new Error(
        "Only JPG, JPEG, PNG and WEBP images are allowed."
      ),
      false
    );
  }

  cb(null, true);
};

const uploadProductImages = multer({
  storage,

  limits: {
    // Oru image maximum 5 MB
    fileSize: 5 * 1024 * 1024,

    // Maximum 5 files
    files: 5,
  },

  fileFilter,
});

module.exports = uploadProductImages;