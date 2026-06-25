const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const JimpModule = require("jimp");
const { Jimp, rgbaToInt } = JimpModule;
const PDFDocument = require("pdfkit");
const Tesseract = require("tesseract.js");
const opentype = require("opentype.js");
const potrace = require("potrace");
const sharp = require("sharp");
const Document = require("../models/Document");
const User = require("../models/User");

const hexToRgbaArray = (hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
  255,
];

const getJimpColor = (hex) => {
  const [r, g, b, a] = hexToRgbaArray(hex);
  return rgbaToInt(r, g, b, a);
};

const createBlankJimpImage = async (width, height, hexColor) => {
  const [r, g, b, a] = hexToRgbaArray(hexColor);
  const alpha = a / 255;
  const pngBuffer = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r, g, b, alpha },
    },
  }).png().toBuffer();
  return await Jimp.read(pngBuffer);
};

const getMarginLeftPx = (marginMode) => {
  if (marginMode === "narrow") return 50;
  if (marginMode === "wide") return 90;
  return 70;
};

const drawRect = (image, x, y, w, h, color) => {
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  const xEnd = Math.min(width, x + w);
  const yEnd = Math.min(height, y + h);
  for (let yy = Math.max(0, y); yy < yEnd; yy += 1) {
    for (let xx = Math.max(0, x); xx < xEnd; xx += 1) {
      image.setPixelColor(color, xx, yy);
    }
  }
};

const applyPaperStyle = (image, style, paperColor, marginLeft) => {
  const lightLine = getJimpColor("#96bee6");
  const darkLine = getJimpColor("rgba(150,190,230,0.45)");
  const legalLine = getJimpColor("rgba(200,180,120,0.5)");
  const dotColor = getJimpColor("rgba(150,190,230,0.7)");
  const width = image.bitmap.width;
  const height = image.bitmap.height;

  switch (style) {
    case "single-ruled":
      for (let y = 30; y < height - 20; y += 31) drawRect(image, 0, y, width, 1, lightLine);
      break;
    case "double-4line":
      for (let y = 30; y < height - 20; y += 48) {
        drawRect(image, 0, y, width, 1, lightLine);
        drawRect(image, 0, y + 8, width, 1, lightLine);
      }
      break;
    case "double-feint":
      for (let y = 30; y < height - 20; y += 65) {
        drawRect(image, 0, y, width, 1, lightLine);
        drawRect(image, 0, y + 8, width, 1, darkLine);
      }
      break;
    case "double-college":
      for (let y = 30; y < height - 20; y += 60) {
        drawRect(image, 0, y, width, 1, lightLine);
        drawRect(image, 0, y + 1, width, 1, lightLine);
      }
      drawRect(image, marginLeft, 0, 2, height, lightLine);
      break;
    case "grid":
      for (let y = 30; y < height - 20; y += 31) drawRect(image, 0, y, width, 1, lightLine);
      for (let x = 0; x < width; x += 31) drawRect(image, x, 0, 1, height, lightLine);
      break;
    case "dotted":
      for (let y = 30; y < height - 20; y += 28) {
        for (let x = 30; x < width; x += 31) {
          drawRect(image, x, y, 2, 2, dotColor);
        }
      }
      break;
    case "legal":
      drawRect(image, 0, 0, width, height, getJimpColor(paperColor));
      for (let y = 30; y < height - 20; y += 31) drawRect(image, 0, y, width, 1, legalLine);
      drawRect(image, marginLeft, 0, 2, height, legalLine);
      break;
    default:
      // A4 or unknown: keep the paperColor background only.
      break;
  }
};

const tintTextLayer = async (textLayer, inkColor) => {
  const [r, g, b] = hexToRgbaArray(inkColor);
  textLayer.scan(0, 0, textLayer.bitmap.width, textLayer.bitmap.height, function (x, y, idx) {
    const alpha = this.bitmap.data[idx + 3];
    if (alpha > 0) {
      this.bitmap.data[idx] = r;
      this.bitmap.data[idx + 1] = g;
      this.bitmap.data[idx + 2] = b;
    }
  });
};

exports.getDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.saveDocument = async (req, res) => {
  try {
    const { title, content, font, fontSize, inkColor, paperStyle } = req.body;
    const doc = await Document.create({
      user: req.user.id,
      title, content, font, fontSize, inkColor, paperStyle,
    });
    res.status(201).json({ document: doc, message: "Document saved! ✅" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateCustomFont = async (samplePath) => {
  try {
    // OCR to get text and bounding boxes
    const result = await Tesseract.recognize(samplePath, 'eng');
    const text = result.data.text.replace(/\s/g, ''); // Remove spaces
    const boxes = result.data.words;

    if (!text || boxes.length === 0) throw new Error('No text recognized in sample');

    const glyphs = [];
    for (let i = 0; i < Math.min(text.length, boxes.length); i++) {
      const box = boxes[i].bbox;
      // Crop character
      const croppedBuffer = await sharp(samplePath)
        .extract({ left: box.x0, top: box.y0, width: box.x1 - box.x0, height: box.y1 - box.y0 })
        .png()
        .toBuffer();

      // Vectorize to SVG
      const svg = await new Promise((resolve, reject) => {
        potrace.trace(croppedBuffer, (err, svg) => {
          if (err) reject(err);
          else resolve(svg);
        });
      });

      // Create glyph (simplified; assumes SVG path is usable)
      const glyph = new opentype.Glyph({
        name: text[i],
        unicode: text.charCodeAt(i),
        path: new opentype.Path().fromSVG(svg),
      });
      glyphs.push(glyph);
    }

    // Create font
    const font = new opentype.Font({
      familyName: 'CustomHandwriting',
      styleName: 'Regular',
      unitsPerEm: 1000,
      glyphs: glyphs,
    });

    const fontPath = path.join(__dirname, '..', 'uploads', `custom-${Date.now()}.otf`);
    font.download(fontPath);
    return fontPath;
  } catch (error) {
    console.error('Font generation failed:', error);
    return null;
  }
};

exports.convertPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No document file uploaded" });
    }

    let rawText = "";
    if (req.file.mimetype === "text/plain") {
      rawText = fs.readFileSync(req.file.path, "utf-8").trim();
    } else if (req.file.mimetype.startsWith("image/")) {
      const result = await Tesseract.recognize(req.file.path, 'eng');
      rawText = (result.data.text || "").trim();
    } else {
      const pdfBuffer = fs.readFileSync(req.file.path);
      const result = await pdfParse(pdfBuffer);
      rawText = (result.text || "").trim();
    }

    if (!rawText) {
      return res.status(400).json({ message: req.file.mimetype === "text/plain" ? "TXT file contains no text" : "PDF contains no extractable text" });
    }

    const inkColor = req.body.inkColor || "#1a3a8f";
    const paperStyle = req.body.paperStyle || "a4";
    const paperColor = req.body.paperColor || "#ffffff";
    const marginMode = req.body.marginMode || "normal";
    const pageTitle = req.body.pageTitle || "";
    const titleFontSize = parseInt(req.body.titleFontSize, 10) || 18;
    const titleInkColor = req.body.titleInkColor || inkColor;
    const titleFont = req.body.titleFont || "Helvetica";
    const selectedFont = req.body.selectedFont || "helvetica";
    const fontSize = parseInt(req.body.fontSize, 10) || 22;
    const defaultLineHeight = Math.round(fontSize * 1.6);
    const lineHeight = paperStyle === "double-college" ? Math.round(fontSize * 2.54)
      : paperStyle === "double-4line" ? Math.round(fontSize * 2)
      : paperStyle === "double-feint" ? Math.round(fontSize * 2.77)
      : paperStyle === "single-ruled" || paperStyle === "legal" ? Math.round(fontSize * 1.27)
      : paperStyle === "grid" || paperStyle === "dotted" ? Math.round(fontSize * 1.45)
      : defaultLineHeight;
    const lines = rawText.split(/\r?\n/).filter((line) => line.trim().length > 0);
    const pageWidth = 1200;
    const padding = 30;
    const estimatedHeight = padding * 2 + Math.max(lines.length * lineHeight, 600);

    const baseColor = paperStyle === "legal" ? "#fefbd8" : paperColor;
    const image = await createBlankJimpImage(pageWidth, estimatedHeight, baseColor);

    const marginLeft = getMarginLeftPx(marginMode);
    applyPaperStyle(image, paperStyle, paperColor, marginLeft);

    const user = await User.findById(req.user.id);
    let customFontPath = null;
    if (user?.handwritingSample) {
      const sampleUrl = user.handwritingSample;
      const samplePath = path.join(__dirname, "..", "uploads", path.basename(sampleUrl));
      if (fs.existsSync(samplePath)) {
        customFontPath = await generateCustomFont(samplePath);
      }
    }
    if (user?.avatar) {
      try {
        const samplePath = path.join(__dirname, "..", "uploads", path.basename(user.avatar));
        if (fs.existsSync(samplePath)) {
          const sampleImg = await Jimp.read(samplePath);
          sampleImg.resize(pageWidth, image.bitmap.height);
          sampleImg.opacity(0.12);
          image.composite(sampleImg, 0, 0, { opacitySource: 0.12 });
        }
      } catch (e) {
        // ignore if overlay fails
      }
    }

    const convertedDir = path.join(__dirname, "..", "uploads", "converted");
    if (!fs.existsSync(convertedDir)) fs.mkdirSync(convertedDir, { recursive: true });

    const doc = new PDFDocument({ size: 'A4' });
    if (customFontPath) {
      doc.registerFont('CustomHandwriting', customFontPath);
    }
    const scale = 595 / pageWidth;
    const imageBuffer = await new Promise((resolve, reject) => {
      image.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
        if (err) return reject(err);
        resolve(buffer);
      });
    });
    doc.image(imageBuffer, 0, 0, { width: 595, height: 842 });

    // Add title
    if (pageTitle) {
      doc.font(customFontPath ? 'CustomHandwriting' : 'Helvetica');
      doc.fillColor(titleInkColor);
      doc.fontSize(titleFontSize);
      doc.text(pageTitle, padding * scale, 20);
    }

    // Add text
    doc.font(customFontPath ? 'CustomHandwriting' : 'Helvetica');
    doc.fillColor(inkColor);
    doc.fontSize(fontSize);
    const ruleTextOffset = paperStyle === "double-college" ? Math.round(fontSize * 0.68)
      : paperStyle === "double-4line" ? Math.round(fontSize * 0.55)
      : paperStyle === "double-feint" ? Math.round(fontSize * 0.68)
      : paperStyle === "single-ruled" || paperStyle === "legal" || paperStyle === "grid" || paperStyle === "dotted" ? Math.round(fontSize * 0.18)
      : 30;
    let y = (padding + ruleTextOffset) * scale;
    for (let line of lines) {
      doc.text(line, padding * scale, y, { width: (pageWidth - padding * 2) * scale });
      y += lineHeight * scale;
    }

    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const pdfBuffer = Buffer.concat(buffers);
      const pdfFileName = `converted-${req.user.id}-${Date.now()}.pdf`;
      const pdfPath = path.join(convertedDir, pdfFileName);
      fs.writeFileSync(pdfPath, pdfBuffer);

      const outImageName = `converted-${req.user.id}-${Date.now()}.png`;
      const outImagePath = path.join(convertedDir, outImageName);
      await image.writeAsync(outImagePath);

      const serverUrl = process.env.SERVER_URL || "http://localhost:5000";
      const convertedImageUrl = `${serverUrl}/uploads/converted/${outImageName}`;
      const convertedPdfUrl = `${serverUrl}/uploads/converted/${pdfFileName}`;
      const pdfUrl = `${serverUrl}/uploads/${req.file.filename}`;

      const document = await Document.create({
        user: req.user.id,
        title: req.body.title || req.file.originalname,
        content: rawText,
        pdfUrl,
        convertedUrl: convertedImageUrl,
        convertedPdfUrl,
        status: "converted",
      });

      return res.json({ document, convertedUrl: convertedImageUrl, convertedPdfUrl, text: rawText });
    });
    doc.end();
  } catch (error) {
    console.error("convertPdf error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: "Document deleted!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};