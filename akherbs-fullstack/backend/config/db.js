const mongoose = require("mongoose");

async function connectDB() {
  try {
    const uri =
      process.env.MONGO_URI ||
      "mongodb://127.0.0.1:27017/akherbs";

    await mongoose.connect(uri);

    console.log(
      "✅ MongoDB Connected:",
      mongoose.connection.host
    );
  } catch (error) {
    console.error(
      "❌ MongoDB Connection Failed:",
      error.message
    );

    process.exit(1);
  }
}

module.exports = connectDB;