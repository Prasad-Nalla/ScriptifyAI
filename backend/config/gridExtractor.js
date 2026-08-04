/* ══════════════════════════════════════════════════════════════
   gridExtractor.js — Server-side Grid Coordinates & Character Map
   Scriptify AI by Prasad Nalla
   ══════════════════════════════════════════════════════════════ */

const GRID_CONFIG = {
  pageWidthMM: 210,
  pageHeightMM: 297,
  marginTopMM: 25,
  marginLeftMM: 15,
  marginRightMM: 15,
  marginBottomMM: 15,
  cols: 8,
  rows: 9,
  markerSizeMM: 6,
};

GRID_CONFIG.gridWidthMM  = GRID_CONFIG.pageWidthMM - GRID_CONFIG.marginLeftMM - GRID_CONFIG.marginRightMM;
GRID_CONFIG.gridHeightMM = GRID_CONFIG.pageHeightMM - GRID_CONFIG.marginTopMM - GRID_CONFIG.marginBottomMM;
GRID_CONFIG.cellWidthMM  = GRID_CONFIG.gridWidthMM / GRID_CONFIG.cols;
GRID_CONFIG.cellHeightMM = GRID_CONFIG.gridHeightMM / GRID_CONFIG.rows;

const CHARACTER_MAP = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
  'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
  'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
  'Y', 'Z',
  'a', 'b', 'c', 'd', 'e', 'f',
  'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
  'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
  'w', 'x', 'y', 'z',
  '0', '1', '2', '3', '4', '5', '6', '7',
  '8', '9',
  '.', ',', '!', '?', '+', '-'
];

/**
 * Calculates pixel bounding box for character at index relative to image width and height
 */
function getCharacterPixelBoundingBox(index, imageWidth, imageHeight) {
  if (index < 0 || index >= CHARACTER_MAP.length) return null;
  const col = index % GRID_CONFIG.cols;
  const row = Math.floor(index / GRID_CONFIG.cols);

  const scaleX = imageWidth / GRID_CONFIG.pageWidthMM;
  const scaleY = imageHeight / GRID_CONFIG.pageHeightMM;

  const leftMM = GRID_CONFIG.marginLeftMM + col * GRID_CONFIG.cellWidthMM;
  const topMM  = GRID_CONFIG.marginTopMM + row * GRID_CONFIG.cellHeightMM;

  // Add 1.5mm inner padding to avoid capturing grid lines
  const padMM = 1.5;
  const cropLeftMM   = leftMM + padMM;
  const cropTopMM    = topMM + padMM;
  const cropWidthMM  = GRID_CONFIG.cellWidthMM - (padMM * 2);
  const cropHeightMM = GRID_CONFIG.cellHeightMM - (padMM * 2);

  return {
    char: CHARACTER_MAP[index],
    unicode: CHARACTER_MAP[index].charCodeAt(0),
    left: Math.max(0, Math.floor(cropLeftMM * scaleX)),
    top: Math.max(0, Math.floor(cropTopMM * scaleY)),
    width: Math.max(1, Math.floor(cropWidthMM * scaleX)),
    height: Math.max(1, Math.floor(cropHeightMM * scaleY)),
  };
}

module.exports = {
  GRID_CONFIG,
  CHARACTER_MAP,
  getCharacterPixelBoundingBox,
};
