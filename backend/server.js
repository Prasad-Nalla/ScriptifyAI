const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ensure uploads folders exist
const fs = require("fs");
const uploadsDir = path.join(__dirname, "uploads");
const convertedDir = path.join(uploadsDir, "converted");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(convertedDir)) fs.mkdirSync(convertedDir, { recursive: true });

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/document", require("./routes/document"));
app.use("/api/user",     require("./routes/user"));

app.get("/api/test", (req, res) => {
  res.json({
    message:   "Scriptify Backend is running! ✅",
    version:   "1.0.0",
    developer: "Prasad Nalla"
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Test: http://localhost:${PORT}/api/test`);
});