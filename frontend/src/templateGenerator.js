/* ══════════════════════════════════════════════════════════════
   templateGenerator.js — PDF Calibration Template Generator
   Scriptify AI by Prasad Nalla
   ══════════════════════════════════════════════════════════════ */

import { jsPDF } from "jspdf";
import { GRID_CONFIG, CHARACTER_MAP, getCellCoordinates } from "./gridConfig";

export function generateCalibrationTemplatePDF() {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // 1. Header & Title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(30, 41, 59); // Dark slate
  pdf.text("Scriptify AI — Handwriting Calibration Sheet", 15, 12);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(100, 116, 139);
  pdf.text("Write each character clearly in dark ink (black or blue) inside its box. Keep letters centered.", 15, 17);

  // 2. Corner Alignment Markers (Fiducials for Deskewing)
  const ms = GRID_CONFIG.markerSizeMM;
  const corners = [
    { x: 5, y: 5 },                                    // Top-Left
    { x: GRID_CONFIG.pageWidthMM - 5 - ms, y: 5 },      // Top-Right
    { x: 5, y: GRID_CONFIG.pageHeightMM - 5 - ms },     // Bottom-Left
    { x: GRID_CONFIG.pageWidthMM - 5 - ms, y: GRID_CONFIG.pageHeightMM - 5 - ms }, // Bottom-Right
  ];

  corners.forEach(({ x, y }) => {
    // Draw solid black square
    pdf.setFillColor(0, 0, 0);
    pdf.rect(x, y, ms, ms, "F");
    // Draw white center dot
    pdf.setFillColor(255, 255, 255);
    pdf.rect(x + ms / 3, y + ms / 3, ms / 3, ms / 3, "F");
  });

  // 3. Render 68 Character Grid Boxes
  for (let i = 0; i < CHARACTER_MAP.length; i++) {
    const coords = getCellCoordinates(i);
    if (!coords) continue;

    const { xMM, yMM, widthMM, heightMM, char } = coords;

    // Draw Cell Border
    pdf.setDrawColor(203, 213, 225); // #cbd5e1 light gray border
    pdf.setLineWidth(0.3);
    pdf.rect(xMM, yMM, widthMM, heightMM);

    // Cell Top-Left Label
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184); // Light text label
    pdf.text(char, xMM + 1.5, yMM + 4);

    // Subtle Baseline Guide Line (75% height)
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.15);
    const baselineY = yMM + heightMM * 0.75;
    pdf.line(xMM + 2, baselineY, xMM + widthMM - 2, baselineY);
  }

  // 4. Footer Branding
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(148, 163, 184);
  pdf.text("Scriptify AI by Prasad Nalla • Calibration Grid v1.0", 15, 292);

  // Trigger Download
  pdf.save(`ScriptifyAI-Calibration-Sheet.pdf`);
}
