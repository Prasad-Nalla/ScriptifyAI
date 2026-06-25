const express  = require("express");
const multer   = require("multer");
const path     = require("path");
const router   = express.Router();
const { protect } = require("../middleware/authMiddleware");
const User = require("../models/User");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = [".png", ".jpg", ".jpeg", ".gif"];
    if (!allowed.includes(path.extname(file.originalname).toLowerCase())) {
      return cb(new Error("Only images are allowed"), false);
    }
    cb(null, true);
  },
});

router.get("/me", protect, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  return res.json(user);
});

router.patch("/me", protect, async (req, res) => {
  const { fullName, email } = req.body;
  const updates = {};
  if (fullName) updates.fullName = fullName;
  if (email) updates.email = email.toLowerCase();

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
    context: "query",
  }).select("-password");

  return res.json(user);
});

router.post("/avatar", protect, upload.single("avatar"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No avatar file uploaded" });
  }

  const serverUrl = process.env.SERVER_URL || "http://localhost:5000";
  const avatarUrl = `${serverUrl}/uploads/${req.file.filename}`;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { avatar: avatarUrl },
    { new: true }
  ).select("-password");

  return res.json(user);
});

router.post("/handwriting-sample", protect, upload.single("sample"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No handwriting sample file uploaded" });
  }

  const serverUrl = process.env.SERVER_URL || "http://localhost:5000";
  const sampleUrl = `${serverUrl}/uploads/${req.file.filename}`;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { handwritingSample: sampleUrl },
    { new: true }
  ).select("-password");

  return res.json(user);
});

module.exports = router;