/* ══════════════════════════════════════════════════════════════
   gridConfig.js — Calibration Grid Sheet Metadata & Mapping
   Scriptify AI by Prasad Nalla
   ══════════════════════════════════════════════════════════════ */

export const GRID_CONFIG = {
  pageWidthMM: 210,   // A4 width
  pageHeightMM: 297,  // A4 height
  marginTopMM: 25,    // Leave top space for header title & markers
  marginLeftMM: 15,
  marginRightMM: 15,
  marginBottomMM: 15,
  cols: 8,
  rows: 9,
  markerSizeMM: 6,     // Size of 4 corner alignment boxes
};

// Calculate grid cell dimensions
GRID_CONFIG.gridWidthMM  = GRID_CONFIG.pageWidthMM - GRID_CONFIG.marginLeftMM - GRID_CONFIG.marginRightMM;
GRID_CONFIG.gridHeightMM = GRID_CONFIG.pageHeightMM - GRID_CONFIG.marginTopMM - GRID_CONFIG.marginBottomMM;
GRID_CONFIG.cellWidthMM  = GRID_CONFIG.gridWidthMM / GRID_CONFIG.cols;
GRID_CONFIG.cellHeightMM = GRID_CONFIG.gridHeightMM / GRID_CONFIG.rows;

// 68 Characters: A-Z (26), a-z (26), 0-9 (10), Punctuation (6)
export const CHARACTER_MAP = [
  // Row 1, 2, 3, 4 (A-Z)
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
  'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
  'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
  'Y', 'Z',

  // Row 4, 5, 6, 7 (a-z)
  'a', 'b', 'c', 'd', 'e', 'f',
  'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
  'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
  'w', 'x', 'y', 'z',

  // Row 7, 8 (0-9)
  '0', '1', '2', '3', '4', '5', '6', '7',
  '8', '9',

  // Row 9 (Punctuation)
  '.', ',', '!', '?', '+', '-'
];

export function getCellCoordinates(index) {
  if (index < 0 || index >= CHARACTER_MAP.length) return null;
  const col = index % GRID_CONFIG.cols;
  const row = Math.floor(index / GRID_CONFIG.cols);
  const x = GRID_CONFIG.marginLeftMM + col * GRID_CONFIG.cellWidthMM;
  const y = GRID_CONFIG.marginTopMM + row * GRID_CONFIG.cellHeightMM;
  return {
    char: CHARACTER_MAP[index],
    row,
    col,
    xMM: x,
    yMM: y,
    widthMM: GRID_CONFIG.cellWidthMM,
    heightMM: GRID_CONFIG.cellHeightMM,
  };
}
