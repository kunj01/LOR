import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate the "Application to Avail Letter Head from Student Store" form as PDF
 * @param {Object} data - Form data containing student and request information
 * @param {string} outputPath - Path where the PDF should be saved
 */
export const generateLetterHeadForm = async (data, outputPath) => {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
  });

  // Create directory if it doesn't exist
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Create write stream
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Helper function to draw a line
  const drawLine = (x, y, width) => {
    doc
      .moveTo(x, y)
      .lineTo(x + width, y)
      .stroke();
  };

  // Helper function to draw checkbox
  const drawCheckbox = (x, y, size = 8, checked = false) => {
    doc.rect(x, y, size, size).stroke();
    if (checked) {
      doc.fontSize(10).text("✓", x + 1, y - 2);
    }
  };

  // Helper function to draw text field (underline)
  const drawTextField = (x, y, width, text = "") => {
    // Place text first, well above the line
    if (text) {
      // place text closer to the underline (smaller gap)
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(text, x, y - 12, {
          width: width,
          align: "left",
        });
    }
    // Draw the line below the text
    drawLine(x, y, width);
  };

  let yPos = 30;
  const lineHeight = 22;
  const leftMargin = 50;
  const rightMargin = 550;
  const fieldWidth = 250;
  const pageWidth = 595; // A4 width in points
  const centerX = pageWidth / 2;

  // Load and place logos at the top
  const logoSize = 90; // CHARUSAT logo size (decreased)
  const cspitLogoSize = 50; // CSPIT logo smaller
  const logoY = 20; // Top position for logos (closer to top margin)
  const logoLeftX = leftMargin;
  const logoRightX = pageWidth - leftMargin - logoSize;

  try {
    // Left logo (CHARUSAT) - try multiple possible paths including __dirname fallbacks
    let charusatLogoPath = path.join(
      process.cwd(),
      "public",
      "form_logo",
      "charsusat.jpeg"
    );
    const fallbackPaths = [
      path.join(
        process.cwd(),
        "backend",
        "public",
        "form_logo",
        "charsusat.jpeg"
      ),
      path.join(__dirname, "..", "..", "public", "form_logo", "charsusat.jpeg"),
      path.join(
        __dirname,
        "..",
        "..",
        "..",
        "public",
        "form_logo",
        "charsusat.jpeg"
      ),
    ];
    for (const p of fallbackPaths) {
      if (!fs.existsSync(charusatLogoPath) && fs.existsSync(p))
        charusatLogoPath = p;
    }
    if (fs.existsSync(charusatLogoPath)) {
      doc.image(charusatLogoPath, logoLeftX, logoY, {
        fit: [logoSize, logoSize],
        align: "left",
      });
      console.log("CHARUSAT logo loaded from:", charusatLogoPath);
    } else {
      console.warn("CHARUSAT logo not found. Tried candidates.");
    }

    // Right logo (CSPIT) - try multiple possible paths including __dirname fallbacks
    let cspitLogoPath = path.join(
      process.cwd(),
      "public",
      "form_logo",
      "cspit.png"
    );
    const fallbackPathsR = [
      path.join(process.cwd(), "backend", "public", "form_logo", "cspit.png"),
      path.join(__dirname, "..", "..", "public", "form_logo", "cspit.png"),
      path.join(
        __dirname,
        "..",
        "..",
        "..",
        "public",
        "form_logo",
        "cspit.png"
      ),
    ];
    for (const p of fallbackPathsR) {
      if (!fs.existsSync(cspitLogoPath) && fs.existsSync(p)) cspitLogoPath = p;
    }
    if (fs.existsSync(cspitLogoPath)) {
      doc.image(cspitLogoPath, logoRightX, logoY, {
        fit: [cspitLogoSize, cspitLogoSize],
        align: "right",
      });
      console.log("CSPIT logo loaded from:", cspitLogoPath);
    } else {
      console.warn("CSPIT logo not found. Tried candidates.");
    }
  } catch (logoError) {
    console.error("Error loading logos:", logoError);
    // Continue without logos if they can't be loaded
  }

  // University/Institute names (centered) between the two logos
  yPos = logoY + 5; // align with logo top
  // Use the page center area to center the three lines nicely
  doc
    .fontSize(10)
    .font("Helvetica")
    .fillColor("black")
    .text("Charotar University of Science and Technology", leftMargin, yPos, {
      align: "center",
      width: 495,
    });
  yPos += 14;
  doc
    .fontSize(10)
    .font("Helvetica")
    .text("Chandubhai S. Patel Institute of Technology", leftMargin, yPos, {
      align: "center",
      width: 495,
    });
  yPos += 14;
  doc
    .fontSize(10)
    .font("Helvetica")
    .text(
      "Kundanben Dinsha Patel Department of Information Technology",
      leftMargin,
      yPos,
      { align: "center", width: 495 }
    );
  yPos += 42; // 3 lines space after last university line

  // Header Section - Title (centered below the university names)
  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .text(
      "APPLICATION TO AVAIL LETTER HEAD FROM STUDENT STORE",
      leftMargin,
      yPos,
      {
        align: "center",
        width: 495,
      }
    );
  yPos += 56; // leave 4 lines of space after heading (4 * 14px)

  // Letter head required section (all options in one line, no long line after OTHER)
  doc
    .fontSize(10)
    .font("Helvetica")
    .text("Letter head required:", leftMargin, yPos);
  const letterHeadType = data.letterHeadType || "CSPIT"; // Default to CSPIT if not specified
  const charusatChecked = letterHeadType === "CHARUSAT";
  const cspitChecked = letterHeadType === "CSPIT";
  const otherChecked = letterHeadType === "OTHER";
  const checkboxSize = 10;
  const checkboxY = yPos - 8;
  let xOpt = leftMargin + 120;
  drawCheckbox(xOpt, checkboxY, checkboxSize, charusatChecked);
  doc
    .fontSize(10)
    .font("Helvetica")
    .text("CHARUSAT", xOpt + 14, yPos - 10);
  xOpt += 80;
  drawCheckbox(xOpt, checkboxY, checkboxSize, cspitChecked);
  doc
    .fontSize(10)
    .font("Helvetica")
    .text("CSPIT", xOpt + 14, yPos - 10);
  xOpt += 80;
  drawCheckbox(xOpt, checkboxY, checkboxSize, otherChecked);
  doc
    .fontSize(10)
    .font("Helvetica")
    .text("OTHER", xOpt + 14, yPos - 10);
  if (otherChecked && data.otherLetterHead) {
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(data.otherLetterHead, xOpt + 60, yPos - 10, { width: 100 });
  }
  yPos += lineHeight;

  // Full Name
  doc.fontSize(10).font("Helvetica").text("Full Name:", leftMargin, yPos);
  const fullName = data.studentFullName || data.studentName || "";
  // Consistent field alignment - all fields start at the same X position
  drawTextField(leftMargin + 120, yPos+5, fieldWidth, fullName);
  yPos += lineHeight + 4;

  // Student ID
  doc.fontSize(10).font("Helvetica").text("Student ID:", leftMargin, yPos);
  const studentId = data.studentId || "";
  // Consistent field alignment
  drawTextField(leftMargin + 120, yPos+5, fieldWidth, studentId);
  yPos += lineHeight + 4;

  // Purpose of Letter head
  doc
    .fontSize(10)
    .font("Helvetica")
    .text("Purpose of Letter head*:", leftMargin, yPos);
  const purpose = data.purpose || "";
  // Align purpose field with other fields (same starting position)
  const purposeFieldX = leftMargin + 120;
  const purposeFieldWidth = fieldWidth + 80; // Wider field for purpose
  const purposeLineHeight = 18; // Space between each line (text + underline)

  // Calculate how many lines of text the purpose will take
  let numTextLines = 1;
  if (purpose) {
    // Estimate lines based on text width (approximate 60 characters per line at 10pt font)
    const charsPerLine = Math.floor(purposeFieldWidth / 7); // Slightly fewer chars per line for safety
    numTextLines = Math.ceil(purpose.length / charsPerLine);
  }

  // Dynamic lines: at least 1 line, maximum 5 lines, based on actual text
  const purposeLines = Math.min(Math.max(numTextLines, 1), 5);

  // Calculate where the first line should start (below label with spacing)
  const purposeStartY = yPos + 18; // Start lines below label with more spacing
  const textOffsetAboveLine = 12; // Distance text should be above the line

  // Write purpose text above the lines, then draw lines below each text line
  if (purpose) {
    // Split text into lines manually to ensure proper alignment
    const charsPerLine = Math.floor(purposeFieldWidth / 7);
    const purposeTextLines = [];
    for (let i = 0; i < purposeLines; i++) {
      const startIdx = i * charsPerLine;
      const endIdx = Math.min(startIdx + charsPerLine, purpose.length);
      if (startIdx < purpose.length) {
        purposeTextLines.push(purpose.substring(startIdx, endIdx));
      }
    }
    
    // Draw text and lines with proper spacing
    for (let i = 0; i < purposeLines; i++) {
      const lineY = purposeStartY + i * purposeLineHeight;
      const textY = lineY - textOffsetAboveLine; // Text 12 points above the line
      
      // Draw the text first
      if (i < purposeTextLines.length && purposeTextLines[i]) {
        doc
          .fontSize(10)
          .font("Helvetica")
          .text(
            purposeTextLines[i],
            purposeFieldX,
            textY,
            {
              width: purposeFieldWidth,
              align: "left",
            }
          );
      }
      
      // Then draw the line below the text
      drawLine(
        purposeFieldX,
        lineY,
        purposeFieldWidth
      );
    }
  } else {
    // Draw empty lines if no purpose
    for (let i = 0; i < purposeLines; i++) {
      drawLine(
        purposeFieldX,
        purposeStartY + i * purposeLineHeight,
        purposeFieldWidth
      );
    }
  }

  // Move to after the purpose field (only the lines we actually used)
  yPos = purposeStartY + purposeLines * purposeLineHeight + 8;

  // Number of copies required
  doc
    .fontSize(10)
    .font("Helvetica")
    .text("Number of copies required:", leftMargin, yPos);
  const copies = data.copies ? String(data.copies) : "";
  // Align field with other fields (same starting position as Full Name, Student ID)
  // Use same yPos as label - drawTextField will place text above the line
  drawTextField(leftMargin + 130, yPos + 10, 80, copies);
  // Add extra spacing after copies field to prevent overlap
  yPos += lineHeight + 10;

  // Signature of Applicant
  doc
    .fontSize(10)
    .font("Helvetica")
    .text("Signature of Applicant:", leftMargin, yPos);
  // Align field with other fields (same starting position)
  drawTextField(leftMargin + 115, yPos + 10, fieldWidth);
  yPos += lineHeight + 10;

  // Signature of Counsellor/Teacher Recommending
  doc
    .fontSize(10)
    .font("Helvetica")
    .text("Signature of Counsellor/Teacher Recommending**:", leftMargin, yPos);
  // For long label, start field further right to accommodate the label
  const signatureFieldX = leftMargin + 245;
  drawTextField(signatureFieldX, yPos + 10, fieldWidth);
  yPos += lineHeight + 10;

  // Date
  doc.fontSize(10).font("Helvetica").text("Date:", leftMargin, yPos);
  const date =
    data.date ||
    new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  // Align date field with other fields (same starting position)
  drawTextField(leftMargin + 50, yPos + 10, fieldWidth, date);
  yPos += lineHeight + 12;

  // Notes/Disclaimers - ensure proper spacing and no overlap
  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor("#666666")
    .text(
      '* If the purpose of letter head is for Letter of recommendation (LOR), separate "APPLICATION TO AVAIL LETTER OF RECOMMENDATION FROM FACULTY" needs to be filled.',
      leftMargin,
      yPos,
      {
        width: 495,
        align: "left",
        lineGap: 4,
        paragraphGap: 2,
      }
    );
  yPos += 22; // Increased spacing between footnote lines
  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor("#666666")
    .text(
      "**Student Counsellor/teacher recommending letter head is hereby assuming the responsibility of proper use of Letter head issued to student or alumina.",
      leftMargin,
      yPos,
      {
        width: 495,
        align: "left",
        lineGap: 4,
        paragraphGap: 2,
      }
    );

  // Finalize PDF
  doc.end();

  // Return a promise that resolves when the PDF is written
  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve(outputPath));
    stream.on("error", reject);
  });
};

/**
 * Generate PDF for LOR request approval
 * @param {Object} lorRequest - LOR request object with relations
 * @param {string} outputDir - Directory to save PDFs
 * @returns {Promise<string>} Path to generated PDF
 */
export const generateLORApprovalPDF = async (
  lorRequest,
  outputDir = "generated-pdfs"
) => {
  const student = lorRequest.student;
  const studentProfile = student?.studentProfile || {};
  const teacher = lorRequest.teacher;

  // Extract letter head type from requestData if available
  let letterHeadType = "CSPIT"; // Default
  let otherLetterHead = "";

  if (lorRequest.requestData && typeof lorRequest.requestData === "object") {
    letterHeadType = lorRequest.requestData.letterHeadType || letterHeadType;
    otherLetterHead = lorRequest.requestData.otherLetterHead || "";
  }

  const formData = {
    letterHeadType,
    otherLetterHead,
    studentFullName: studentProfile.studentFullName || student?.name || "",
    studentName: student?.name || "",
    studentId: studentProfile.studentId || student?.id || "",
    purpose: lorRequest.purpose || "",
    copies: lorRequest.copies || 1,
    date: new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
  };

  // Generate filename
  const filename = `letter-head-form-${lorRequest.id}-${Date.now()}.pdf`;
  const outputPath = path.join(process.cwd(), outputDir, filename);

  await generateLetterHeadForm(formData, outputPath);

  return outputPath;
};

/**
 * Generate the "Application to Avail Letter of Recommendation from Faculty" form as PDF
 * @param {Object} data - Form data containing student, profile, and request information
 * @param {string} outputPath - Path where the PDF should be saved
 */
export const generateLORRecommendationForm = async (data, outputPath) => {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
  });

  // Create directory if it doesn't exist
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Create write stream
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Helper function to draw a line
  const drawLine = (x, y, width) => {
    doc
      .moveTo(x, y)
      .lineTo(x + width, y)
      .stroke();
  };

  // Helper function to draw text field (underline)
  const drawTextField = (x, y, width, text = "") => {
    // Place text first, closer to the underline
    if (text) {
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(text, x, y - 12, {
          width: width,
          align: "left",
        });
    }
    // Draw the line below the text
    drawLine(x, y, width);
  };

  let yPos = 30;
  const lineHeight = 22;
  const leftMargin = 50;
  const fieldWidth = 250;
  const pageWidth = 595; // A4 width in points
  const rightMargin = 550;

  // Load and place logos at the top
  const logoSize = 80; // Logo size in points (both logos same size - larger to match right logo)
  const logoY = 20; // Top position for logos (closer to top margin)
  const logoLeftX = leftMargin;
  const logoRightX = pageWidth - leftMargin - logoSize;

  try {
    // Left logo (CHARUSAT) - try multiple possible paths including __dirname fallbacks
    let charusatLogoPath = path.join(
      process.cwd(),
      "public",
      "form_logo",
      "charsusat.jpeg"
    );
    const fallbackPathsL = [
      path.join(
        process.cwd(),
        "backend",
        "public",
        "form_logo",
        "charsusat.jpeg"
      ),
      path.join(__dirname, "..", "..", "public", "form_logo", "charsusat.jpeg"),
      path.join(
        __dirname,
        "..",
        "..",
        "..",
        "public",
        "form_logo",
        "charsusat.jpeg"
      ),
    ];
    for (const p of fallbackPathsL) {
      if (!fs.existsSync(charusatLogoPath) && fs.existsSync(p))
        charusatLogoPath = p;
    }
    if (fs.existsSync(charusatLogoPath)) {
      doc.image(charusatLogoPath, logoLeftX, logoY, {
        fit: [logoSize, logoSize],
        align: "left",
      });
      console.log("CHARUSAT logo loaded from:", charusatLogoPath);
    } else {
      console.warn("CHARUSAT logo not found. Tried candidates.");
    }

    // Right logo (CSPIT) - try multiple possible paths including __dirname fallbacks
    let cspitLogoPath = path.join(
      process.cwd(),
      "public",
      "form_logo",
      "cspit.png"
    );
    const fallbackPathsR2 = [
      path.join(process.cwd(), "backend", "public", "form_logo", "cspit.png"),
      path.join(__dirname, "..", "..", "public", "form_logo", "cspit.png"),
      path.join(
        __dirname,
        "..",
        "..",
        "..",
        "public",
        "form_logo",
        "cspit.png"
      ),
    ];
    for (const p of fallbackPathsR2) {
      if (!fs.existsSync(cspitLogoPath) && fs.existsSync(p)) cspitLogoPath = p;
    }
    if (fs.existsSync(cspitLogoPath)) {
      doc.image(cspitLogoPath, logoRightX, logoY, {
        fit: [logoSize, logoSize],
        align: "right",
      });
      console.log("CSPIT logo loaded from:", cspitLogoPath);
    } else {
      console.warn("CSPIT logo not found. Tried candidates.");
    }
  } catch (logoError) {
    console.error("Error loading logos:", logoError);
    // Continue without logos if they can't be loaded
  }

  // University/Institute names (centered) between the two logos
  yPos = logoY + 5;
  doc
    .fontSize(10)
    .font("Helvetica")
    .fillColor("black")
    .text("Charotar University of Science and Technology", leftMargin, yPos, {
      align: "center",
      width: 495,
    });
  yPos += 14;
  doc
    .fontSize(10)
    .font("Helvetica")
    .text("Chandubhai S. Patel Institute of Technology", leftMargin, yPos, {
      align: "center",
      width: 495,
    });
  yPos += 14;
  doc
    .fontSize(10)
    .font("Helvetica")
    .text(
      "Kundanben Dinsha Patel Department of Information Technology",
      leftMargin,
      yPos,
      { align: "center", width: 495 }
    );
  yPos += 12;

  // Header Section - Title (centered below the university names)
  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .text(
      "APPLICATION TO AVAIL LETTER OF RECOMMENDATION FROM FACULTY",
      leftMargin,
      yPos,
      {
        align: "center",
        width: 495,
      }
    );
  yPos += 18;

  // Student Details Section
  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("Student Details", leftMargin, yPos);
  yPos += 20;

  // Full Name
  doc.fontSize(10).font("Helvetica").text("Full Name:", leftMargin, yPos);
  const fullName = data.studentFullName || data.studentName || "";
  drawTextField(leftMargin + 90, yPos + 18  , fieldWidth, fullName);
  yPos += lineHeight + 10;

  // Student ID
  doc.fontSize(10).font("Helvetica").text("Student ID:", leftMargin, yPos);
  const studentId = data.studentId || "";
  drawTextField(leftMargin + 90, yPos + 18, fieldWidth, studentId);
  yPos += lineHeight + 10;

  // Email
  doc.fontSize(10).font("Helvetica").text("Email:", leftMargin, yPos);
  const email = data.emailId || data.email || "";
  drawTextField(leftMargin + 90, yPos + 18, fieldWidth, email);
  yPos += lineHeight + 10;

  // Admission
  doc.fontSize(10).font("Helvetica").text("Admission:", leftMargin, yPos);
  const admissionMonth = data.admissionMonth || "";
  const admissionYear = data.admissionYear || "";
  const admission =
    admissionMonth && admissionYear
      ? `${admissionMonth} ${admissionYear}`
      : admissionMonth || admissionYear || "";
  drawTextField(leftMargin + 90, yPos + 18, fieldWidth, admission);
  yPos += lineHeight + 10;

  // Mobile
  doc.fontSize(10).font("Helvetica").text("Mobile:", leftMargin, yPos);
  const mobile = data.candidateMobile || data.mobile || "";
  drawTextField(leftMargin + 90, yPos + 18, fieldWidth, mobile);
  yPos += lineHeight + 12;

  // Academic Summary Section
  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("Academic Summary", leftMargin, yPos);
  yPos += 15;
  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#666666")
    .text(
      "CGPAs/Attendance per semester may be attached separately.",
      leftMargin,
      yPos,
      { width: 495 }
    );
  yPos += lineHeight + 15;

  // Request Details Section
  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("Request Details", leftMargin, yPos);
  yPos += 20;

  // Request ID
  doc.fontSize(10).font("Helvetica").text("Request ID:", leftMargin, yPos);
  const requestId = data.requestId ? String(data.requestId) : "";
  drawTextField(leftMargin + 90, yPos + 20, fieldWidth, requestId);
  yPos += lineHeight + 10;

  // Purpose
  doc.fontSize(10).font("Helvetica").text("Purpose:", leftMargin, yPos);
  const purpose = data.purpose || "";
  const purposeFieldX = leftMargin + 90;
  const purposeFieldWidth = fieldWidth;
  const purposeLineHeight = 14;

  // Calculate how many lines of text the purpose will take
  let numTextLines = 1;
  if (purpose) {
    const charsPerLine = Math.floor(purposeFieldWidth / 6); // Approximate
    numTextLines = Math.ceil(purpose.length / charsPerLine);
  }

  // Dynamic lines: at least 1 line, maximum 3 lines, based on actual text
  const purposeLines = Math.min(Math.max(numTextLines, 1), 3);

  // Calculate where lines should start
  const purposeStartY = yPos + 18;

  // Draw only the necessary lines (dynamic)
  for (let i = 0; i < purposeLines; i++) {
    drawLine(
      purposeFieldX,
      purposeStartY + i * purposeLineHeight,
      purposeFieldWidth
    );
  }

  // Write purpose text directly on the lines
  if (purpose) {
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(purpose, purposeFieldX, purposeStartY + 10, {
        width: purposeFieldWidth,
        align: "left",
        lineGap: purposeLineHeight - 4,
      });
  }
  yPos = purposeStartY + purposeLines * purposeLineHeight + 8;

  // Copies
  doc.fontSize(10).font("Helvetica").text("Copies:", leftMargin, yPos);
  const copies = data.copies ? String(data.copies) : "";
  drawTextField(leftMargin + 90, yPos + 18, fieldWidth, copies);
  yPos += lineHeight + 10;

  // Status
  doc.fontSize(10).font("Helvetica").text("Status:", leftMargin, yPos);
  const status = data.status || "";
  drawTextField(leftMargin + 90, yPos + 18, fieldWidth, status);
  yPos += lineHeight + 16;

  // Signature Sections
  doc
    .fontSize(10)
    .font("Helvetica")
    .text("Signature of Student:", leftMargin, yPos);
  drawTextField(leftMargin + 130, yPos + 18, fieldWidth);
  yPos += lineHeight + 10;

  doc
    .fontSize(10)
    .font("Helvetica")
    .text("Signature of Recommending Faculty:", leftMargin, yPos);
  drawTextField(leftMargin + 180, yPos + 18, fieldWidth);
  yPos += lineHeight + 10;

  doc
    .fontSize(10)
    .font("Helvetica")
    .text("Signature of HOD:", leftMargin, yPos);
  drawTextField(leftMargin + 130, yPos + 18, fieldWidth);
  yPos += lineHeight + 10;

  // Date
  doc.fontSize(10).font("Helvetica").text("Date:", leftMargin, yPos);
  const date =
    data.date ||
    new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  drawTextField(leftMargin + 90, yPos + 18, fieldWidth, date);
  yPos += lineHeight + 18;

  // Footer note
  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor("#666666")
    .text("This document is generated from the LOR system.", leftMargin, yPos, {
      width: 495,
      align: "left",
    });

  // Finalize PDF
  doc.end();

  // Return a promise that resolves when the PDF is written
  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve(outputPath));
    stream.on("error", reject);
  });
};

/**
 * Generate LOR Recommendation Form PDF for approved request
 * @param {Object} lorRequest - LOR request object with relations
 * @param {string} outputDir - Directory to save PDFs
 * @returns {Promise<string>} Path to generated PDF
 */
export const generateLORRecommendationFormPDF = async (
  lorRequest,
  outputDir = "generated-pdfs"
) => {
  const student = lorRequest.student;
  const studentProfile = student?.studentProfile || {};

  const formData = {
    studentFullName: studentProfile.studentFullName || student?.name || "",
    studentName: student?.name || "",
    studentId: studentProfile.studentId || student?.id || "",
    emailId: studentProfile.emailId || student?.email || "",
    email: student?.email || "",
    admissionMonth: studentProfile.admissionMonth || "",
    admissionYear: studentProfile.admissionYear || "",
    candidateMobile: studentProfile.candidateMobile || "",
    mobile: "",
    requestId: lorRequest.id,
    purpose: lorRequest.purpose || "",
    copies: lorRequest.copies || 1,
    status: lorRequest.status || "APPROVED",
    date: new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
  };

  // Generate filename
  const filename = `lor-recommendation-form-${lorRequest.id}-${Date.now()}.pdf`;
  const outputPath = path.join(process.cwd(), outputDir, filename);

  await generateLORRecommendationForm(formData, outputPath);

  return outputPath;
};
