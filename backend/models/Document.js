const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title:        { type: String, default: "Untitled Document" },
  content:      { type: String, default: "" },
  font:         { type: String, default: "Caveat" },
  fontSize:     { type: Number, default: 22 },
  inkColor:     { type: String, default: "#1a3a8f" },
  paperStyle:   { type: String, default: "a4" },
  pdfUrl:       { type: String, default: "" },
  convertedUrl:     { type: String, default: "" },
  convertedPdfUrl:  { type: String, default: "" },
  status:           { type: String, default: "ready" },
  createdAt:        { type: Date, default: Date.now },
});

module.exports = mongoose.model("Document", DocumentSchema);