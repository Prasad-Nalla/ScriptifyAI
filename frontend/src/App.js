import { useState, useEffect, useRef, useCallback } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "./App.css";
import AuthPanel from "./AuthPanel";
import "./AuthPanel.css";
 
/* ══════════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════════ */
const FONTS = [
  /* ── Handwriting ── */
  { id:"lora",       label:"Lora",            category:"Serif",       featured:false, url:"https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400&display=swap",                        family:"'Lora', serif" },
  { id:"caveat",     label:"Caveat",          category:"Handwriting", featured:true,  url:"https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap",                                     family:"'Caveat', cursive" },
  { id:"kalam",      label:"Kalam",           category:"Handwriting", featured:true,  url:"https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&display=swap",                                  family:"'Kalam', cursive" },
  { id:"indie",      label:"Indie Flower",    category:"Handwriting", featured:true,  url:"https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap",                                            family:"'Indie Flower', cursive" },
  { id:"patrick",    label:"Patrick Hand",    category:"Handwriting", featured:false, url:"https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap",                                            family:"'Patrick Hand', cursive" },
  { id:"handlee",    label:"Handlee",         category:"Handwriting", featured:false, url:"https://fonts.googleapis.com/css2?family=Handlee&display=swap",                                                 family:"'Handlee', cursive" },
  { id:"mali",       label:"Mali",            category:"Handwriting", featured:false, url:"https://fonts.googleapis.com/css2?family=Mali:wght@400;700&display=swap",                                       family:"'Mali', cursive" },
  { id:"gochi",      label:"Gochi Hand",      category:"Handwriting", featured:false, url:"https://fonts.googleapis.com/css2?family=Gochi+Hand&display=swap",                                              family:"'Gochi Hand', cursive" },
  { id:"crayon",     label:"Permanent Marker",category:"Handwriting", featured:true,  url:"https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap",                                        family:"'Permanent Marker', cursive" },
  { id:"rocksalt",   label:"Rock Salt",       category:"Handwriting", featured:false, url:"https://fonts.googleapis.com/css2?family=Rock+Salt&display=swap",                                               family:"'Rock Salt', cursive" },
  { id:"shadows",    label:"Shadows Into Light",category:"Handwriting",featured:false,url:"https://fonts.googleapis.com/css2?family=Shadows+Into+Light&display=swap",                                      family:"'Shadows Into Light', cursive" },
  { id:"homemade",   label:"Homemade Apple",  category:"Handwriting", featured:false, url:"https://fonts.googleapis.com/css2?family=Homemade+Apple&display=swap",                                          family:"'Homemade Apple', cursive" },
  { id:"nothing",    label:"Nothing You Could Do",category:"Handwriting",featured:false,url:"https://fonts.googleapis.com/css2?family=Nothing+You+Could+Do&display=swap",                                  family:"'Nothing You Could Do', cursive" },
  { id:"reenie",     label:"Reenie Beanie",   category:"Handwriting", featured:false, url:"https://fonts.googleapis.com/css2?family=Reenie+Beanie&display=swap",                                           family:"'Reenie Beanie', cursive" },
  { id:"pangolin",   label:"Pangolin",        category:"Handwriting", featured:false, url:"https://fonts.googleapis.com/css2?family=Pangolin&display=swap",                                                family:"'Pangolin', cursive" },
  { id:"zeyada",     label:"Zeyada",          category:"Handwriting", featured:false, url:"https://fonts.googleapis.com/css2?family=Zeyada&display=swap",                                                  family:"'Zeyada', cursive" },
  /* ── Calligraphy / Brush ── */
  { id:"dancing",    label:"Dancing Script",  category:"Calligraphy", featured:true,  url:"https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap",                             family:"'Dancing Script', cursive" },
  { id:"pacifico",   label:"Pacifico",        category:"Calligraphy", featured:true,  url:"https://fonts.googleapis.com/css2?family=Pacifico&display=swap",                                                family:"'Pacifico', cursive" },
  { id:"satisfy",    label:"Satisfy",         category:"Calligraphy", featured:true,  url:"https://fonts.googleapis.com/css2?family=Satisfy&display=swap",                                                 family:"'Satisfy', cursive" },
  { id:"greatvibes", label:"Great Vibes",     category:"Calligraphy", featured:true,  url:"https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap",                                             family:"'Great Vibes', cursive" },
  { id:"allura",     label:"Allura",          category:"Calligraphy", featured:true,  url:"https://fonts.googleapis.com/css2?family=Allura&display=swap",                                                  family:"'Allura', cursive" },
  { id:"pinyon",     label:"Pinyon Script",   category:"Calligraphy", featured:false, url:"https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap",                                           family:"'Pinyon Script', cursive" },
  { id:"qwitcher",   label:"Qwitcher Grypen", category:"Calligraphy", featured:false, url:"https://fonts.googleapis.com/css2?family=Qwitcher+Grypen&display=swap",                                         family:"'Qwitcher Grypen', cursive" },
  { id:"birthstone", label:"Birthstone",      category:"Calligraphy", featured:false, url:"https://fonts.googleapis.com/css2?family=Birthstone&display=swap",                                              family:"'Birthstone', cursive" },
  { id:"rouge",      label:"Rouge Script",    category:"Calligraphy", featured:false, url:"https://fonts.googleapis.com/css2?family=Rouge+Script&display=swap",                                            family:"'Rouge Script', cursive" },
  { id:"mr_dafoe",   label:"Mr Dafoe",        category:"Calligraphy", featured:false, url:"https://fonts.googleapis.com/css2?family=Mr+Dafoe&display=swap",                                                family:"'Mr Dafoe', cursive" },
  { id:"blacksword", label:"주아체 (Juah)",   category:"Calligraphy", featured:false, url:"https://fonts.googleapis.com/css2?family=Nanum+Brush+Script&display=swap",                                      family:"'Nanum Brush Script', cursive" },
  /* ── Serif ── */
  { id:"playfair",   label:"Playfair Display",category:"Serif",       featured:false, url:"https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap",            family:"'Playfair Display', serif" },
  { id:"crimson",    label:"Crimson Text",    category:"Serif",       featured:false, url:"https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,700;1,400&display=swap",                family:"'Crimson Text', serif" },
  { id:"cormorant",  label:"Cormorant Garamond",category:"Serif",     featured:false, url:"https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400&display=swap",          family:"'Cormorant Garamond', serif" },
  { id:"bitter",     label:"Bitter",          category:"Serif",       featured:false, url:"https://fonts.googleapis.com/css2?family=Bitter:ital,wght@0,400;0,700;1,400&display=swap",                      family:"'Bitter', serif" },
  { id:"spectral",   label:"Spectral",        category:"Serif",       featured:false, url:"https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,700;1,400&display=swap",                    family:"'Spectral', serif" },
  /* ── Monospace / Typewriter ── */
  { id:"courier",    label:"Courier Prime",   category:"Monospace",   featured:false, url:"https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap",               family:"'Courier Prime', monospace" },
  { id:"spacemono",  label:"Space Mono",      category:"Monospace",   featured:false, url:"https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap",                  family:"'Space Mono', monospace" },
  { id:"ibmplexmono",label:"IBM Plex Mono",   category:"Monospace",   featured:false, url:"https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,700;1,400&display=swap",               family:"'IBM Plex Mono', monospace" },
  { id:"oxanium",    label:"Oxanium",         category:"Monospace",   featured:false, url:"https://fonts.googleapis.com/css2?family=Oxanium:wght@400;700&display=swap",                                    family:"'Oxanium', monospace" },
  { id:"nova",       label:"Nova Mono",       category:"Monospace",   featured:false, url:"https://fonts.googleapis.com/css2?family=Nova+Mono&display=swap",                                               family:"'Nova Mono', monospace" },
  { id:"share",      label:"Share Tech Mono", category:"Monospace",   featured:false, url:"https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap",                                         family:"'Share Tech Mono', monospace" },
];

const PAPER_STYLES = [
  { id:"a4",           label:"A4 White",        icon:"🗒",  description:"Clean white sheet" },
  { id:"single-ruled", label:"Single Ruled",     icon:"📋",  description:"Classic ruled lines" },
  { id:"double-4line", label:"4-Line School",    icon:"✏️",  description:"4-line practice" },
  { id:"double-feint", label:"Feint & Margin",   icon:"📓",  description:"Two-line + margin" },
  { id:"double-college",label:"College Ruled",   icon:"🎓",  description:"College double rule" },
  { id:"grid",         label:"Graph Grid",       icon:"⊞",  description:"5mm engineering grid" },
  { id:"dotted",       label:"Dotted",           icon:"⁝",  description:"Bullet journal dots" },
  { id:"legal",        label:"Legal Pad",        icon:"📜",  description:"Yellowed legal pad" },
];

const INK_COLORS = [
  { id:"blue",     label:"Royal Blue",  value:"#1a3a8f" },
  { id:"black",    label:"Jet Black",   value:"#1a1a1a" },
  { id:"navy",     label:"Dark Navy",   value:"#0d1b4b" },
  { id:"red",      label:"Crimson",     value:"#8b1a1a" },
  { id:"green",    label:"Forest",      value:"#1a5c2a" },
  { id:"purple",   label:"Purple",      value:"#4a1a8b" },
  { id:"brown",    label:"Sepia",       value:"#5c3a1a" },
  { id:"teal",     label:"Teal",        value:"#0d4a4a" },
];

const PAPER_COLORS = [
  { id:"white",  label:"White",      value:"#ffffff" },
  { id:"cream",  label:"Cream",      value:"#fef9ee" },
  { id:"yellow", label:"Legal Pad",  value:"#fefbd8" },
  { id:"blue",   label:"Blue Tint",  value:"#eef4ff" },
  { id:"pink",   label:"Rose",       value:"#fff0f3" },
  { id:"green",  label:"Mint",       value:"#f0faf4" },
];

function getPaperBg(styleId, paperColorVal) {
  const lineColor = "rgba(150,190,230,0.55)";
  const lineColorDark = "rgba(150,190,230,0.45)";
  switch (styleId) {
    case "single-ruled":
      return `repeating-linear-gradient(transparent,transparent 31px,${lineColor} 31px,${lineColor} 32px)`;
    case "double-4line":
      return `repeating-linear-gradient(
        transparent 0px, transparent 7px,
        ${lineColor} 7px, ${lineColor} 8px,
        transparent 8px, transparent 16px,
        ${lineColorDark} 16px, ${lineColorDark} 17px,
        transparent 17px, transparent 40px,
        ${lineColor} 40px, ${lineColor} 41px,
        transparent 41px, transparent 48px
      )`;
    case "double-feint":
      return `repeating-linear-gradient(
        transparent 0px, transparent 28px,
        ${lineColor} 28px, ${lineColor} 29px,
        transparent 29px, transparent 36px,
        ${lineColorDark} 36px, ${lineColorDark} 37px,
        transparent 37px, transparent 65px
      )`;
    case "double-college":
      return `repeating-linear-gradient(
        transparent 0px, transparent 26px,
        ${lineColor} 26px, ${lineColor} 27px,
        transparent 27px, transparent 31px,
        ${lineColorDark} 31px, ${lineColorDark} 32px,
        transparent 32px, transparent 60px
      )`;
    case "grid":
      return `
        repeating-linear-gradient(rgba(150,190,230,0.35) 0px,transparent 1px,transparent 31px,rgba(150,190,230,0.35) 31px),
        repeating-linear-gradient(90deg,rgba(150,190,230,0.35) 0px,transparent 1px,transparent 31px,rgba(150,190,230,0.35) 31px)
      `;
    case "dotted":
      return `radial-gradient(circle,rgba(150,190,230,0.7) 1.2px,transparent 1.2px)`;
    case "legal":
      return `repeating-linear-gradient(transparent,transparent 31px,rgba(200,180,120,0.5) 31px,rgba(200,180,120,0.5) 32px)`;
    default:
      return "none";
  }
}

function getPaperBgSize(styleId) {
  if (styleId === "dotted") return "28px 28px";
  return "auto";
}

function getPaperBgPosition(styleId) {
  if (styleId === "a4") return "0px";
  if (styleId === "single-ruled") return "12px";
  if (styleId === "legal") return "12px";
  if (styleId === "double-4line") return "15px";
  if (styleId === "double-college") return "34px";
  if (styleId === "double-feint") return "33px";
  return "16px";
}

function getPaperBaseColor(styleId, selectedColor) {
  if (styleId === "legal") return "#fefbd8";
  return selectedColor;
}

function getPaperInnerTopPadding(styleId) {
  if (["single-ruled", "double-4line", "double-feint", "double-college", "grid", "dotted", "legal"].includes(styleId)) {
    return 18;
  }
  return 40;
}

function getPaperLineHeight(styleId, defaultHeight, fontSize = 22) {
  if (styleId === "single-ruled" || styleId === "legal") return (fontSize * 1.27) + "px";
  if (styleId === "double-college") return (fontSize * 2.54) + "px";
  if (styleId === "double-4line") return (fontSize * 2) + "px";
  if (styleId === "double-feint") return (fontSize * 2.77) + "px";
  if (styleId === "grid" || styleId === "dotted") return (fontSize * 1.45) + "px";
  return defaultHeight;
}

function getMarginLeftPx(marginMode) {
  if (marginMode === "narrow") return 46;
  if (marginMode === "wide")   return 88;
  return 64;
}

function getBadgeClass(cat) {
  if (cat === "Handwriting") return "badge badge-handwriting";
  if (cat === "Calligraphy") return "badge badge-calligraphy";
  if (cat === "Serif")       return "badge badge-serif";
  return "badge badge-monospace";
}

function countWords(str) { return str.trim() ? str.trim().split(/\s+/).length : 0; }
function countLines(str) { return str ? str.split("\n").length : 1; }
function estimatePages(str, fs) { const linesPerPage = Math.floor(480 / (fs * 1.6)); return Math.max(1, Math.ceil(countLines(str) / linesPerPage)); }

export default function App() {
  const [theme,         setTheme]         = useState("dark");
  const [text,          setText]          = useState("The quick brown fox jumps over the lazy dog.\nABCDEFGHIJKLMNOPQRSTUVWXYZ\nabcdefghijklmnopqrstuvwxyz\n0123456789");
  const [pageTitle,     setPageTitle]     = useState("My Notes");
  const [showTitle,     setShowTitle]     = useState(true);
  const [selectedFont,  setSelectedFont]  = useState(FONTS[0]);
  const [fontSize,      setFontSize]      = useState(22);
  const [letterSpacing, setLetterSpacing] = useState(1);
  const [lineHeight,    setLineHeight]    = useState(2.2);
  const [inkColor,      setInkColor]      = useState(INK_COLORS[0]);
  const [inkOpacity,    setInkOpacity]    = useState(100);
  const [paperColor,    setPaperColor]    = useState(PAPER_COLORS[0]);
  const [paperStyle,    setPaperStyle]    = useState(PAPER_STYLES[0]);
  const [marginMode,    setMarginMode]    = useState("normal");
  const [slant,         setSlant]         = useState(0);
  const [zoom,          setZoom]          = useState(100);
  const [activeTab,     setActiveTab]     = useState("editor");
  const [uploadedFile,  setUploadedFile]  = useState(null);
  const [pdfFile,       setPdfFile]       = useState(null);
  const [handwritingSampleUrl, setHandwritingSampleUrl] = useState("");
  const [isSampleUploading, setIsSampleUploading] = useState(false);
  const [isPdfConverting, setIsPdfConverting] = useState(false);
  const [convertedPdfUrl, setConvertedPdfUrl] = useState("");
  const [conversionMessage, setConversionMessage] = useState("");
  const [fontCategory,  setFontCategory]  = useState("All");
  const [isConverting,  setIsConverting]  = useState(false);
  const [converted,     setConverted]     = useState(false);
  const [inkDrag,       setInkDrag]       = useState(false);
  const [docDrag,       setDocDrag]       = useState(false);
  const [flipKey,       setFlipKey]       = useState(0);
  const [printMode,     setPrintMode]     = useState(false);
  const [authOpen,      setAuthOpen]      = useState(false);
  const [loggedInUser,  setLoggedInUser]  = useState(() => {
    const saved = localStorage.getItem("scriptify_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [editorFontSize, setEditorFontSize] = useState(16);
  const [editorInkColor, setEditorInkColor] = useState(INK_COLORS[0]);
  const [titleFontSize, setTitleFontSize] = useState(18);
  const [titleInkColor, setTitleInkColor] = useState(INK_COLORS[0]);
  const [titleFont, setTitleFont] = useState(FONTS[0]);
  const previewRef = useRef(null);

  const parseJsonResponse = async (res) => {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return await res.json();
    }
    const text = await res.text();
    throw new Error(text || `${res.status} ${res.statusText}`);
  };

  useEffect(() => {
    FONTS.forEach(f => {
      if (!document.querySelector(`link[href="${f.url}"]`)) {
        const l = document.createElement("link");
        l.rel = "stylesheet"; l.href = f.url;
        document.head.appendChild(l);
      }
    });
  }, []);

  useEffect(() => {
    if (loggedInUser?.handwritingSample) {
      setHandwritingSampleUrl(loggedInUser.handwritingSample);
    }
  }, [loggedInUser]);

  const simulateConvert = useCallback(() => {
    if (!text) return;
    setIsConverting(true);
    setConverted(false);
    setTimeout(() => {
      setIsConverting(false);
      setConverted(true);
    }, 1200);
  }, [text]);

  const handleDocFile = (file) => {
    if (!file) return;
    if (file.type === "application/pdf") setPdfFile(URL.createObjectURL(file));
    setUploadedFile(file);
  };

  const isTextDocument = (file) => {
    return file?.type === "text/plain" || file?.name?.toLowerCase().endsWith(".txt");
  };

  const isImageDocument = (file) => {
    return file?.type?.startsWith("image/");
  };

  const uploadSample = async (file) => {
    if (!file) return;
    setIsSampleUploading(true);
    setConversionMessage("");

    const token = localStorage.getItem("scriptify_token");
    const formData = new FormData();
    formData.append("sample", file);

    try {
      const res = await fetch("http://localhost:5000/api/user/handwriting-sample", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await parseJsonResponse(res);
      if (!res.ok) throw new Error(data.message || data || "Upload failed");

      setHandwritingSampleUrl(data.handwritingSample);
      setLoggedInUser((prev) => ({ ...prev, handwritingSample: data.handwritingSample }));
      localStorage.setItem("scriptify_user", JSON.stringify({ ...loggedInUser, handwritingSample: data.handwritingSample }));
      setConversionMessage("Handwriting sample uploaded successfully.");
    } catch (error) {
      setConversionMessage(error.message || "Failed to upload handwriting sample.");
    } finally {
      setIsSampleUploading(false);
    }
  };

  const convertPdf = async () => {
    const isPdf = uploadedFile?.type === "application/pdf";
    const isTxt = isTextDocument(uploadedFile);
    const isImage = isImageDocument(uploadedFile);
    if (!uploadedFile || (!isPdf && !isTxt && !isImage)) {
      setConversionMessage("Please select a PDF, image, or TXT file first.");
      return;
    }

    if (!loggedInUser) {
      setConversionMessage("Please sign in to convert documents.");
      return;
    }

    setIsPdfConverting(true);
    setConversionMessage("");
    setConvertedPdfUrl("");

    const token = localStorage.getItem("scriptify_token");
    if (!token) {
      setConversionMessage("Missing auth token. Please sign in again.");
      setIsPdfConverting(false);
      return;
    }

    const formData = new FormData();
    formData.append("pdf", uploadedFile);
    formData.append("title", uploadedFile.name);
    formData.append("fontSize", fontSize);
    formData.append("inkColor", inkColor.value);
    formData.append("paperStyle", paperStyle.id);
    formData.append("paperColor", paperColor.value);
    formData.append("marginMode", marginMode);
    formData.append("pageTitle", pageTitle);
    formData.append("titleFontSize", titleFontSize);
    formData.append("titleInkColor", titleInkColor.value);
    formData.append("titleFont", titleFont.id);
    formData.append("selectedFont", selectedFont.id);

    try {
      const res = await fetch("http://localhost:5000/api/document/convert", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await parseJsonResponse(res);
      if (!res.ok) throw new Error(data.message || data || "Conversion failed");

      setConvertedPdfUrl(data.convertedPdfUrl || data.convertedUrl || "");
      setConversionMessage("PDF converted successfully.");

      if (data.document) {
        setLoggedInUser((prev) => ({ ...prev }));
      }
    } catch (error) {
      setConversionMessage(error.message || "PDF conversion failed.");
    } finally {
      setIsPdfConverting(false);
    }
  };

  const downloadAsPNG = async () => {
    if (!previewRef.current) return;
    const wrapper = previewRef.current.parentElement;
    const originalTransform = wrapper?.style.transform;
    const originalWidth = wrapper?.style.width;
    if (wrapper) {
      wrapper.style.transform = "none";
      wrapper.style.width = "100%";
    }
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const a = document.createElement("a");
      a.download = `scriptify-${Date.now()}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    } catch (error) {
      console.error("PNG export failed:", error);
      alert("PNG export failed. Please make sure html2canvas is installed and the preview content is visible.");
    } finally {
      if (wrapper) {
        wrapper.style.transform = originalTransform;
        wrapper.style.width = originalWidth;
      }
    }
  };

  const downloadPreviewPdf = async () => {
    if (!previewRef.current) return;
    const wrapper = previewRef.current.parentElement;
    const originalTransform = wrapper?.style.transform;
    const originalWidth = wrapper?.style.width;
    if (wrapper) {
      wrapper.style.transform = "none";
      wrapper.style.width = "100%";
    }
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
      pdf.save(`scriptify-preview-${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("PDF export failed. Please make sure jsPDF and html2canvas are installed.");
    } finally {
      if (wrapper) {
        wrapper.style.transform = originalTransform;
        wrapper.style.width = originalWidth;
      }
    }
  };

  const changePaperStyle = (ps) => {
    setPaperStyle(ps); setFlipKey(k => k + 1); setConverted(false);
  };

  const categories   = ["All", "Featured", ...new Set(FONTS.map(f => f.category))];
  const filteredFonts = fontCategory === "All"     ? FONTS
                      : fontCategory === "Featured" ? FONTS.filter(f => f.featured)
                      : FONTS.filter(f => f.category === fontCategory);

  const isDark      = theme === "dark";
  const marginLeft  = getMarginLeftPx(marginMode);
  const bgColor     = getPaperBaseColor(paperStyle.id, paperColor.value);
  const bgImage     = getPaperBg(paperStyle.id, paperColor.value);
  const bgSize      = getPaperBgSize(paperStyle.id);
  const bgPositionY = getPaperBgPosition(paperStyle.id);
  const innerPaddingTop = getPaperInnerTopPadding(paperStyle.id);
  const previewLineHeight = getPaperLineHeight(paperStyle.id, lineHeight, fontSize);
  const marginClass = marginMode === "narrow" ? "margin-narrow" : marginMode === "wide" ? "margin-wide" : "margin-normal";

  const hexToRgba = (hex, opacity) => {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${opacity/100})`;
  };

  return (
    <div className={`app ${theme}`}>

      {/* ════════ NAVBAR ════════ */}
      <nav className="navbar">
        <a className="navbar-brand" href="#home">
          <div className="navbar-logo-icon">✒️</div>
          <div>
            <div className="navbar-brand-name">Scriptify <span className="shimmer-text">AI</span></div>
            <div className="navbar-by">by Prasad Nalla</div>
          </div>
        </a>
        <div className="navbar-links">
          {[["#home","Home"],["#features","App"],["#about","About"],["#how","How It Works"]].map(([href,label]) => (
            <a key={href} href={href} className="nav-link">{label}</a>
          ))}
        </div>
        <div className="navbar-actions">
          <button className="ghost-btn" onClick={() => setTheme(isDark ? "light" : "dark")}>
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
          {loggedInUser ? (
            <div className="navbar-user">
              <div className="navbar-avatar">
                {(loggedInUser.photoPreview || loggedInUser.avatar)
                  ? <img src={loggedInUser.photoPreview || loggedInUser.avatar} alt="avatar" className="navbar-avatar-img" />
                  : <span>{loggedInUser.fullName?.[0]?.toUpperCase() || "U"}</span>
                }
              </div>
              <span className="navbar-username">{loggedInUser.fullName || loggedInUser.email}</span>
              <button
                className="ghost-btn ghost-btn-sm"
                style={{marginLeft:4,fontSize:11}}
                onClick={() => {
                  localStorage.removeItem("scriptify_token");
                  localStorage.removeItem("scriptify_user");
                  setLoggedInUser(null);
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <button className="ghost-btn" onClick={() => setAuthOpen(true)}>Sign In</button>
              <button className="glow-btn"  onClick={() => setAuthOpen(true)}>Get Started →</button>
            </>
          )}
        </div>
      </nav>

      {/* ════════ AUTH PANEL ════════ */}
      <AuthPanel
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        theme={theme}
        onLogin={(user) => { setLoggedInUser(user); setAuthOpen(false); }}
      />

      {/* ════════ HERO ════════ */}
      <section className="hero" id="home">
        <div className="hero-blob" style={{width:500,height:500,background:"#6366f1",top:-200,left:-100}} />
        <div className="hero-blob" style={{width:400,height:400,background:"#8b5cf6",bottom:-100,right:-80}} />
        <div className="hero-badge fade-up">
          <span className="hero-badge-dot" />
          AI-Powered · 40+ Fonts · Realistic Paper · A–Z, a–z, 0–9
        </div>
        <h1 className="hero-title fade-up-1">
          Convert Text Into<br />
          <span className="shimmer-text">Beautiful Handwriting.</span>
        </h1>
        <p className="hero-subtitle fade-up-2">
          Scriptify AI transforms your typed text, PDFs, and images into authentic handwriting —
          in your own style or 40+ curated fonts, rendered on realistic paper.
        </p>
        <div className="hero-buttons fade-up-3">
          <button className="glow-btn hero-btn-lg" onClick={() => document.getElementById("features")?.scrollIntoView({behavior:"smooth"})}>
            Start Writing →
          </button>
          <button className="ghost-btn hero-btn-lg" onClick={() => document.getElementById("about")?.scrollIntoView({behavior:"smooth"})}>
            Our Story ✦
          </button>
        </div>
        <div className="hero-papers fade-up-4">
          <div className="hero-paper-card hpc-1">
            <p className="hero-paper-text" style={{fontFamily:"'Kalam',cursive",color:"#1a3a8f"}}>
              Hello! This is Scriptify AI ✨<br />Your handwriting, digitally.
            </p>
          </div>
          <div className="hero-paper-card hpc-2">
            <p className="hero-paper-text" style={{fontFamily:"'Dancing Script',cursive",color:"#4a1a8b",fontSize:18}}>
              ABCDEFG 0123456789<br />Beautiful, natural writing.
            </p>
          </div>
        </div>
      </section>

      {/* ════════ MAIN APP ════════ */}
      <section className="main-section" id="features">
        <div className="tab-bar">
          {[{id:"editor",icon:"✏️",label:"Text Editor"},{id:"upload",icon:"📁",label:"Upload File"},{id:"fonts",icon:"🔤",label:"Font Gallery"}].map(t => (
            <button key={t.id} className={`tab-btn ${activeTab===t.id?"active":""}`} onClick={() => setActiveTab(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <div className="main-grid">

          {/* ── SIDEBAR ── */}
          <div className="sidebar">
            {activeTab === "editor" && (
              <div className="section-card">
                <div className="card-title">✏️ Content</div>
                <input className="page-title-input" placeholder="Page title (e.g. My Notes)" value={pageTitle} onChange={e => setPageTitle(e.target.value)} />
                <div style={{marginTop:12, display:"flex", flexDirection:"column", gap:12}}>
                  <div className="ctrl-row">
                    <div className="ctrl-label-row">
                      <span className="ctrl-label">Title Font</span>
                    </div>
                    <select className="control-select" value={titleFont.id} onChange={e => setTitleFont(FONTS.find(f => f.id === e.target.value))}>
                      {FONTS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                    </select>
                  </div>
                  <div className="ctrl-row">
                    <div className="ctrl-label-row">
                      <span className="ctrl-label">Title Size</span>
                      <span className="ctrl-val">{titleFontSize}px</span>
                    </div>
                    <input type="range" className="control-slider" min={12} max={32} step={1} value={titleFontSize}
                      onChange={e=>{setTitleFontSize(parseInt(e.target.value))}} />
                  </div>
                  <div className="ctrl-row">
                    <div className="ctrl-label" style={{marginBottom:8}}>Title Ink Color</div>
                    <div className="swatch-row">
                      {INK_COLORS.map(c => (
                        <div key={c.id} className={`color-swatch ${titleInkColor.id===c.id?"active":""}`}
                          title={c.label} style={{background:c.value}} onClick={()=>{setTitleInkColor(c)}} />
                      ))}
                    </div>
                  </div>
                </div>
                <textarea className="text-input" value={text} onChange={e => { setText(e.target.value); setConverted(false); }} placeholder="Type or paste your text here..." style={{fontFamily: selectedFont.family, fontSize: editorFontSize, color: editorInkColor.value, lineHeight: 1.5, letterSpacing: letterSpacing + "px"}} />
                <div className="text-footer">
                  <span className="text-stats">{text.length} chars · {countWords(text)} words</span>
                  <button className="ghost-btn ghost-btn-sm" onClick={() => { setText(""); setConverted(false); }}>Clear</button>
                </div>
                <div style={{marginTop:12, display:"flex", flexDirection:"column", gap:12}}>
                  <div className="ctrl-row">
                    <div className="ctrl-label-row">
                      <span className="ctrl-label">Editor Font Size</span>
                      <span className="ctrl-val">{editorFontSize}px</span>
                    </div>
                    <input type="range" className="control-slider" min={12} max={32} step={1} value={editorFontSize}
                      onChange={e=>{setEditorFontSize(parseInt(e.target.value))}} />
                  </div>
                  <div className="ctrl-row">
                    <div className="ctrl-label" style={{marginBottom:8}}>Editor Ink Color</div>
                    <div className="swatch-row">
                      {INK_COLORS.map(c => (
                        <div key={c.id} className={`color-swatch ${editorInkColor.id===c.id?"active":""}`}
                          title={c.label} style={{background:c.value}} onClick={()=>{setEditorInkColor(c)}} />
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{marginTop:12,display:"flex",alignItems:"center",gap:10}}>
                  <input type="checkbox" id="showTitle" checked={showTitle} onChange={e => setShowTitle(e.target.checked)} style={{accentColor:"#6366f1"}} />
                  <label htmlFor="showTitle" style={{fontSize:12,opacity:.7,cursor:"pointer"}}>Show page title on paper</label>
                </div>
              </div>
            )}

            {activeTab === "upload" && (
              <div className="section-card">
                <div className="card-title">📁 Upload Document</div>
                <div className={`upload-zone ${docDrag?"drag-over":""}`}
                  onDragOver={e=>{e.preventDefault();setDocDrag(true)}}
                  onDragLeave={()=>setDocDrag(false)}
                  onDrop={e=>{e.preventDefault();setDocDrag(false);handleDocFile(e.dataTransfer.files[0])}}>
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg,.txt" onChange={e=>handleDocFile(e.target.files[0])} />
                  <div className="upload-icon">📄</div>
                  <div className="upload-title">Drop PDF, image, or TXT</div>
                  <div className="upload-sub">or click to browse. Upload handwriting image below.</div>
                </div>
                {uploadedFile && (
                  <>
                    <div className="file-info">
                      <span style={{fontSize:20}}>✅</span>
                      <div>
                        <div className="file-info-name">{uploadedFile.name}</div>
                        <div className="file-info-size">{(uploadedFile.size/1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                    <button className="glow-btn glow-btn-full" onClick={loggedInUser ? convertPdf : () => setAuthOpen(true)} disabled={isPdfConverting}>
                      {isPdfConverting ? "Converting document..." : loggedInUser ? "Convert Document to Handwriting →" : "Sign in to convert"}
                    </button>
                    {conversionMessage && <div className="auth-success" style={{marginTop:8}}>{conversionMessage}</div>}
                    {convertedPdfUrl && (
                      <div style={{marginTop:8}}>
                        <a href={convertedPdfUrl} target="_blank" rel="noreferrer" className="ghost-btn ghost-btn-sm">
                          Download Converted Handwriting PDF
                        </a>
                      </div>
                    )}
                  </>
                )}
                <div style={{marginTop:18}}>
                  <div className="card-title">🖊️ Handwriting Sample</div>
                  <div className={`upload-zone ${inkDrag?"drag-over":""}`}
                    onDragOver={e=>{e.preventDefault();setInkDrag(true)}}
                    onDragLeave={()=>setInkDrag(false)}
                    onDrop={e=>{e.preventDefault();setInkDrag(false); const file=e.dataTransfer.files[0]; uploadSample(file); }}>
                    <input type="file" accept=".png,.jpg,.jpeg" onChange={e=>uploadSample(e.target.files[0])} />
                    <div className="upload-icon">✍️</div>
                    <div className="upload-title">Upload handwriting photo</div>
                    <div className="upload-sub">Must contain A–Z, a–z, 0–9. Optional: improves the output style.</div>
                  </div>
                  {handwritingSampleUrl && (
                    <div className="file-info" style={{marginTop:10}}>
                      <span style={{fontSize:20}}>🖋️</span>
                      <div>
                        <div className="file-info-name">Sample uploaded</div>
                        <div className="file-info-size">{handwritingSampleUrl}</div>
                      </div>
                    </div>
                  )}
                  {isSampleUploading && <div style={{marginTop:8}}>Uploading sample…</div>}
                </div>
              </div>
            )}

            {activeTab === "fonts" && (
              <div className="section-card">
                <div className="card-title">🔤 Font Gallery — {FONTS.length} Fonts</div>
                <div className="filter-pills">
                  {categories.map(c => (
                    <button key={c} className={`filter-pill ${fontCategory===c?"active":""}`} onClick={()=>setFontCategory(c)}>{c}</button>
                  ))}
                </div>
                <div className="font-list">
                  {filteredFonts.map(f => (
                    <div key={f.id} className={`font-card ${selectedFont.id===f.id?"selected":""}`} onClick={() => { setSelectedFont(f); setConverted(false); }}>
                      <div className="font-card-header">
                        <span className="font-card-name">{f.label}{f.featured?" ⭐":""}</span>
                        <span className={getBadgeClass(f.category)}>{f.category}</span>
                      </div>
                      <div className="font-card-preview" style={{fontFamily:f.family,color:inkColor.value}}>Aa Bb Cc 123</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STYLE CONTROLS */}
            <div className="section-card">
              <div className="card-title">🎛️ Style Controls</div>
              <div className="size-presets">
                {[["S",14],["M",20],["L",26],["XL",32]].map(([lbl,val]) => (
                  <button key={lbl} className={`size-preset-btn ${fontSize===val?"active":""}`} onClick={()=>{setFontSize(val);setConverted(false);}}>{lbl}</button>
                ))}
              </div>
              {[
                {label:"Font Size",      val:fontSize,      set:setFontSize,      min:10, max:42, step:1,   unit:"px"},
                {label:"Letter Spacing", val:letterSpacing, set:setLetterSpacing, min:-2, max:8,  step:0.5, unit:"px"},
                {label:"Line Height",    val:lineHeight,    set:setLineHeight,    min:1.4,max:3.8,step:0.1, unit:"×"},
                {label:"Slant / Tilt",   val:slant,         set:setSlant,         min:-20,max:20, step:1,   unit:"°"},
                {label:"Ink Opacity",    val:inkOpacity,    set:setInkOpacity,    min:20, max:100,step:1,   unit:"%"},
              ].map(ctrl => (
                <div className="ctrl-row" key={ctrl.label}>
                  <div className="ctrl-label-row">
                    <span className="ctrl-label">{ctrl.label}</span>
                    <span className="ctrl-val">{ctrl.val}{ctrl.unit}</span>
                  </div>
                  <input type="range" className="control-slider" min={ctrl.min} max={ctrl.max} step={ctrl.step} value={ctrl.val}
                    onChange={e=>{ctrl.set(parseFloat(e.target.value));setConverted(false);}} />
                </div>
              ))}
              <div className="ctrl-row">
                <div className="ctrl-label" style={{marginBottom:8}}>Ink Color</div>
                <div className="swatch-row">
                  {INK_COLORS.map(c => (
                    <div key={c.id} className={`color-swatch ${inkColor.id===c.id?"active":""}`}
                      title={c.label} style={{background:c.value}} onClick={()=>{setInkColor(c);setConverted(false);}} />
                  ))}
                </div>
              </div>
              <div className="ctrl-row">
                <div className="ctrl-label" style={{marginBottom:8}}>Paper Color</div>
                <div className="swatch-row">
                  {PAPER_COLORS.map(c => (
                    <div key={c.id} className={`color-swatch ${paperColor.id===c.id?"active":""}`}
                      title={c.label}
                      style={{background:c.value,border:c.id==="white"?"2px solid #d1d5db":"2px solid transparent"}}
                      onClick={()=>{setPaperColor(c);setConverted(false);}} />
                  ))}
                </div>
              </div>
              <div className="ctrl-row">
                <div className="ctrl-label" style={{marginBottom:8}}>Paper Style</div>
                <div className="paper-btns">
                  {PAPER_STYLES.map(p => (
                    <button key={p.id} className={`paper-btn ${paperStyle.id===p.id?"active":""}`}
                      onClick={()=>changePaperStyle(p)} title={p.description}>
                      <span className="paper-btn-icon">{p.icon}</span>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="ctrl-row">
                <div className="ctrl-label" style={{marginBottom:8}}>Margins</div>
                <div className="margin-btns">
                  {[["narrow","Narrow"],["normal","Normal"],["wide","Wide"]].map(([val,lbl]) => (
                    <button key={val} className={`margin-btn ${marginMode===val?"active":""}`}
                      onClick={()=>{setMarginMode(val);setConverted(false);}}>{lbl}</button>
                  ))}
                </div>
              </div>
            </div>

            <button className="glow-btn glow-btn-full" onClick={simulateConvert} disabled={isConverting}>
              {isConverting ? "✍️ Converting..." : converted ? "✅ Convert Again" : "✨ Convert to Handwriting"}
            </button>
          </div>

          {/* ── PREVIEW PANEL ── */}
          <div className="preview-panel">
            <div className="preview-header">
              <div>
                <div className="preview-title-text">Live Preview</div>
                <div className="preview-meta">
                  {selectedFont.label} · {selectedFont.category} · {paperStyle.label}
                  {converted && <span className="success-check">✓</span>}
                  {printMode && <span className="print-badge">🖨️ Print Mode</span>}
                </div>
              </div>
              <div className="preview-actions">
                <button className="ghost-btn ghost-btn-sm" onClick={()=>setPrintMode(p=>!p)}
                  style={{color:printMode?"#22c55e":"inherit",borderColor:printMode?"#22c55e":"rgba(99,102,241,0.38)"}}>
                  🖨️ Print Mode
                </button>
                <button className="ghost-btn ghost-btn-sm" onClick={downloadAsPNG}>⬇️ PNG</button>
                <button className="ghost-btn ghost-btn-sm" onClick={()=>window.print()}>🖨️ Print</button>
                <button className="glow-btn" style={{fontSize:13,padding:"8px 18px"}} onClick={downloadPreviewPdf}>⬇️ Export PDF</button>
              </div>
            </div>
            <div className="zoom-bar">
              <span className="ctrl-label">🔍 Zoom</span>
              <input type="range" className="control-slider" min={50} max={150} step={5} value={zoom}
                onChange={e=>setZoom(parseInt(e.target.value))} style={{maxWidth:200}} />
              <span className="zoom-label">{zoom}%</span>
              <button className="ghost-btn ghost-btn-sm" onClick={()=>setZoom(100)}>Reset</button>
            </div>
            <div style={{transform:`scale(${zoom/100})`,transformOrigin:"top left",width:`${10000/zoom}%`}}>
              <div ref={previewRef} key={flipKey} className={`paper-outer style-${paperStyle.id} ${flipKey>0?"paper-flip-anim":""}`}
                style={{backgroundColor:bgColor, backgroundImage:bgImage, backgroundSize:bgSize, backgroundPositionY:bgPositionY}}>
                {paperStyle.id !== "a4" && (
                  <div className="notebook-holes">
                    {[0,1,2,3].map(i => <div key={i} className="notebook-hole" />)}
                  </div>
                )}
                <div className={`paper-inner ${marginClass}`} style={{paddingTop:innerPaddingTop}}>
                  {paperStyle.id !== "a4" && paperStyle.id !== "grid" && paperStyle.id !== "dotted" && (
                    <div className="margin-line" style={{left:marginLeft}} />
                  )}
                  {isConverting && (
                    <div className="converting-overlay">
                      <div className="converting-pen">✍️</div>
                      <div className="converting-label">Converting to handwriting...</div>
                      <div className="writing-dots"><span/><span/><span/></div>
                    </div>
                  )}
                  {showTitle && pageTitle && (
                    <div className="paper-page-title" style={{color: titleInkColor.value, fontFamily: titleFont.family, fontSize: titleFontSize}}>{pageTitle}</div>
                  )}
                  <div className={`notebook-text ${converted?"converted":""}`} style={{
                    fontFamily:    selectedFont.family,
                    fontSize:      fontSize,
                    color:         hexToRgba(inkColor.value, inkOpacity),
                    letterSpacing: letterSpacing+"px",
                    lineHeight:    previewLineHeight,
                    transform:     `skewX(${slant}deg)`,
                    opacity:       isConverting ? 0 : 1,
                  }}>
                    {text || "Start typing to see your handwriting preview..."}
                  </div>
                </div>
              </div>
            </div>
            <div className="stats-bar">
              {[
                {val:countWords(text),           key:"Words"},
                {val:text.length,                key:"Characters"},
                {val:countLines(text),            key:"Lines"},
                {val:estimatePages(text,fontSize),key:"Pages"},
                {val:selectedFont.label,          key:"Font"},
                {val:`${fontSize}px`,             key:"Size"},
              ].map(s=>(
                <div className="stat-item" key={s.key}>
                  <span className="stat-val">{s.val}</span>
                  <span className="stat-key">{s.key}</span>
                </div>
              ))}
            </div>
            <div className="specimen-card">
              <div className="specimen-title">Full Character Specimen — {selectedFont.label}</div>
              <div style={{fontFamily:selectedFont.family,fontSize:Math.min(fontSize,26),color:hexToRgba(inkColor.value,inkOpacity),lineHeight:2,letterSpacing:letterSpacing+"px"}}>
                <div style={{marginBottom:4}}>A B C D E F G H I J K L M N O P Q R S T U V W X Y Z</div>
                <div style={{marginBottom:4}}>a b c d e f g h i j k l m n o p q r s t u v w x y z</div>
                <div>0 1 2 3 4 5 6 7 8 9 ! @ # $ % &amp; * ( ) , . ? ' " - + = /</div>
              </div>
            </div>
            {pdfFile && (
              <div className="pdf-card">
                <div className="pdf-card-title">📄 Uploaded PDF</div>
                <iframe src={pdfFile} className="pdf-frame" title="PDF Preview" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ════════ ABOUT SECTION ════════ */}
      <section className="about-section" id="about">
        <div className="about-inner">
          <div className="about-note-card">
            <div className="about-note-holes">
              {[0,1,2].map(i=><div key={i} className="about-note-hole"/>)}
            </div>
            <p className="about-note-text">
              I read an article where one point<br />
              really stayed with me — that reading<br />
              content written in YOUR OWN handwriting<br />
              helps your brain recognise each letter<br />
              instantly, because it already knows your<br />
              personal letter shapes. That's what gives<br />
              real grasping power — not just any font,<br />
              but YOUR handwriting. ✨<br /><br />
              So I built Scriptify AI — convert any text<br />
              into your own handwriting style, and let<br />
              your brain do the rest.
            </p>
            <p className="about-note-sig">— Prasad Nalla</p>
          </div>
          <div className="about-text-side">
            <div className="about-eyebrow">✦ Our Story</div>
            <h2 className="about-heading">
              Why I Built<br />
              <span className="shimmer-text">Scriptify AI</span>
            </h2>
            <p className="about-para">
              It started with an article. I read that when you study notes written in
              <strong> your own handwriting</strong>, your brain recognises those letter
              shapes instantly — because it built familiarity with them over years of writing.
              That personal pattern recognition is what creates faster grasping power.
            </p>
            <p className="about-para">
              Any font looks the same to everyone. But <strong>your handwriting is unique to you</strong> —
              and your brain processes it faster than any generic typeface. Scriptify AI
              lets you convert assignments, PDFs, and notes into your personal handwriting
              style so every revision session becomes more effective.
            </p>
            <p className="about-para">
              Whether it's exam prep, assignments, journaling or creative writing —
              <strong> your handwriting, your brain, your edge.</strong>
            </p>
            <div className="about-tags">
              {["Assignments","Handwriting","Student Life","AI","Productivity","Creative Writing"].map(t=>(
                <span key={t} className="about-tag">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════ HOW IT WORKS ════════ */}
      <section className="how-section" id="how">
        <h2 className="section-heading">How It <span className="shimmer-text">Works</span></h2>
        <div className="how-cards">
          {[
            {icon:"📸",title:"Upload Sample",  desc:"Photo of your handwriting with A–Z, a–z, 0–9 so AI learns every character shape."},
            {icon:"🧠",title:"AI Analyzes",    desc:"Python ML extracts character shapes, baseline slant, spacing rhythm and stroke weight."},
            {icon:"📄",title:"Input Content",  desc:"Paste text, upload a PDF, image, or TXT file — any source works."},
            {icon:"🎨",title:"Style It",       desc:"Choose paper style, ink color, font, margins, zoom — full creative control."},
            {icon:"✍️",title:"Convert",        desc:"Hit Convert and watch your text transform into authentic handwriting in real time."},
            {icon:"⬇️",title:"Export",         desc:"Download as PNG, export PDF, or send straight to print — ready to submit."},
          ].map((c,i)=>(
            <div key={i} className="how-card">
              <div className="how-card-icon">{c.icon}</div>
              <div className="how-card-title">{c.title}</div>
              <div className="how-card-desc">{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ FEATURES GRID ════════ */}
      <section className="features-section">
        <h2 className="section-heading">Built for <span className="shimmer-text">Serious Use</span></h2>
        <div className="features-grid">
          {[
            {icon:"🗒",title:"8 Paper Styles",     desc:"A4, Single/Double Rule (3 variants), Graph, Dotted, Legal Pad — all photo-realistic."},
            {icon:"🔤",title:"40+ Curated Fonts",  desc:"Handwriting, Calligraphy, Serif, and Monospace fonts — all Google Fonts, load instantly."},
            {icon:"🎨",title:"Ink & Paper Colors", desc:"8 ink colors and 6 paper tones with full opacity control for authentic realism."},
            {icon:"⬇️",title:"PNG & PDF Export",   desc:"Download your output as a high-res PNG or print-ready PDF instantly."},
            {icon:"🔍",title:"Zoom Control",        desc:"Scale the preview from 50% to 150% for pixel-perfect accuracy before exporting."},
            {icon:"📐",title:"Margin Settings",     desc:"Narrow, Normal, and Wide margin presets match real notebook and assignment paper."},
            {icon:"📊",title:"Live Stats",          desc:"Real-time word count, character count, line count and estimated page count."},
            {icon:"🖨️",title:"Print Mode",         desc:"Toggle print-ready mode to strip UI chrome and output a clean page."},
            {icon:"🧬",title:"Character Specimen",  desc:"Preview every character A–Z, a–z, 0–9 in your chosen font and color before converting."},
          ].map((f,i)=>(
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer className="footer">
        <div className="footer-brand">
          <span style={{fontSize:22}}>✍️</span>
          <span className="footer-brand-name">Scriptify <span className="shimmer-text">AI</span></span>
        </div>
        <p className="footer-author">Crafted with ❤️ by Prasad Nalla</p>
        <p className="footer-sub">AI-Powered Handwriting Converter · MERN Stack · Python ML</p>
        <p className="footer-copy">© 2026 Scriptify AI — Prasad Nalla. All rights reserved.</p>
      </footer>

    </div>
  );
}