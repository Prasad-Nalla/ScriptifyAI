/* ══════════════════════════════════════════════════════════════
   fontGeneratorService.js — High-Precision Grid Cell Extractor & OTF Font Compiler
   Scriptify AI by Prasad Nalla
   ══════════════════════════════════════════════════════════════ */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const potrace = require("potrace");
const opentype = require("opentype.js");
const { CHARACTER_MAP, getCharacterPixelBoundingBox } = require("./gridExtractor");

/**
 * Processes an uploaded calibration template photo, extracts 68 character cells,
 * vectorizes each glyph, and builds a custom OpenType (.otf) font.
 *
 * @param {string} userId - ID of the user
 * @param {string} samplePath - File path to uploaded calibration sheet image
 * @returns {Promise<{ fontPath: string, fontUrl: string, glyphCount: number }>}
 */
async function generateFontFromCalibrationSheet(userId, samplePath) {
  try {
    // 1. Read image metadata
    const metadata = await sharp(samplePath).metadata();
    const imgWidth = metadata.width;
    const imgHeight = metadata.height;

    if (!imgWidth || !imgHeight) {
      throw new Error("Invalid calibration sheet image dimensions");
    }

    // 2. Prepare .notdef Glyph (Required by OpenType spec)
    const notdefGlyph = new opentype.Glyph({
      name: ".notdef",
      unicode: 0,
      advanceWidth: 650,
      path: new opentype.Path(),
    });

    const glyphs = [notdefGlyph];
    let extractedCount = 0;

    // 3. Extract 68 Grid Cells
    for (let i = 0; i < CHARACTER_MAP.length; i++) {
      const charInfo = getCharacterPixelBoundingBox(i, imgWidth, imgHeight);
      if (!charInfo) continue;

      const { char, unicode, left, top, width, height } = charInfo;

      // Ensure valid extraction crop bounds
      const cropLeft = Math.max(0, Math.min(imgWidth - 1, left));
      const cropTop  = Math.max(0, Math.min(imgHeight - 1, top));
      const cropWidth  = Math.max(1, Math.min(imgWidth - cropLeft, width));
      const cropHeight = Math.max(1, Math.min(imgHeight - cropTop, height));

      try {
        // Preprocess character cell: grayscale + thresholding to isolate ink strokes
        const croppedBuffer = await sharp(samplePath)
          .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
          .grayscale()
          .threshold(160) // Binarize: black ink strokes on white background
          .png()
          .toBuffer();

        // Vectorize cropped cell to SVG using potrace
        const svgString = await new Promise((resolve, reject) => {
          potrace.trace(croppedBuffer, { threshold: 128 }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });

        // Parse path 'd' attribute from SVG
        const match = svgString.match(/d="([^"]+)"/);
        const pathData = match ? match[1] : "";

        const glyphPath = new opentype.Path();
        if (pathData) {
          glyphPath.fromSVG(pathData);
        }

        // Create Glyph
        const glyph = new opentype.Glyph({
          name: char === "." ? "period" : char === "," ? "comma" : char === "!" ? "exclam" : char === "?" ? "question" : char === "+" ? "plus" : char === "-" ? "hyphen" : char,
          unicode: unicode,
          advanceWidth: 650,
          path: glyphPath,
        });

        glyphs.push(glyph);
        extractedCount++;
      } catch (cellError) {
        console.warn(`[fontGeneratorService] Warning: Failed to extract character '${char}' at cell ${i}:`, cellError.message);
      }
    }

    // 4. Compile OpenType (.otf) Font
    const font = new opentype.Font({
      familyName: `CustomFont_${userId.toString().slice(-6)}`,
      styleName: "Regular",
      unitsPerEm: 1000,
      ascender: 800,
      descender: -200,
      glyphs: glyphs,
    });

    // 5. Save Font File
    const fontFileName = `custom-${userId}-${Date.now()}.otf`;
    const uploadsDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const fontPath = path.join(uploadsDir, fontFileName);
    const arrayBuffer = font.toArrayBuffer();
    fs.writeFileSync(fontPath, Buffer.from(arrayBuffer));

    const serverUrl = process.env.SERVER_URL || "http://localhost:5000";
    const fontUrl = `${serverUrl}/uploads/${fontFileName}`;

    console.log(`✅ Custom font successfully generated with ${extractedCount} glyphs at: ${fontPath}`);

    return {
      fontPath,
      fontUrl,
      glyphCount: extractedCount,
    };
  } catch (error) {
    console.error("❌ fontGeneratorService error:", error);
    throw error;
  }
}

module.exports = {
  generateFontFromCalibrationSheet,
};
