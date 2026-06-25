const express  = require("express");
const multer   = require("multer");
const path     = require("path");
const router   = express.Router();
const {
  getDocuments,
  saveDocument,
  deleteDocument,
  convertPdf,
} = require("../controllers/documentController");
const { protect } = require("../middleware/authMiddleware");

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const folder = file.mimetype === "application/pdf"
        ? path.join(__dirname, "..", "uploads")
        : path.join(__dirname, "..", "uploads");
      cb(null, folder);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.mimetype === "text/plain" || file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only PDF, image, or TXT files are allowed"), false);
  },
});

router.get("/",        protect, getDocuments);
router.post("/",       protect, saveDocument);
router.delete("/:id",  protect, deleteDocument);
router.post("/convert", protect, upload.single("pdf"), convertPdf);

module.exports = router;