import prisma from "../utils/prismClient.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import path from "path";
import fs from "fs";
import { generateLORApprovalPDF, generateLORRecommendationFormPDF } from "../utils/pdfGenerator.js";

export const createRequest = async (req, res) => {
  try {
    const { teacherId, purpose, copies, requestData } = req.body;
    const studentId = req.user.id;

    if (!teacherId) {
      return res.status(400).json(new ApiError(400, "teacherId is required"));
    }

    const teacher = await prisma.user.findUnique({ where: { id: teacherId } });
    if (!teacher || teacher.role !== "TEACHER") {
      return res.status(404).json(new ApiError(404, "Teacher not found"));
    }

    const requestItem = await prisma.lORRequest.create({
      data: {
        studentId,
        teacherId,
        purpose: purpose || null,
        copies: copies ? Number(copies) : null,
        requestData: requestData ? requestData : null,
      },
    });

    return res.status(201).json(new ApiResponse(201, requestItem, "Request created"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, "Server Error", err));
  }
};

export const listMyRequests = async (req, res) => {
  try {
    const studentId = req.user.id;
    const items = await prisma.lORRequest.findMany({
      where: { studentId },
      orderBy: { createdAt: "asc" },
      include: { documents: true },
    });
    return res.status(200).json(new ApiResponse(200, items, "OK"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, "Server Error", err));
  }
};

export const listAssignedRequests = async (req, res) => {
  try {
    if (req.user.role !== "TEACHER" && req.user.role !== "ADMIN") {
      return res.status(403).json(new ApiError(403, "Forbidden"));
    }
    const teacherId = req.user.role === "TEACHER" ? req.user.id : undefined;
    const items = await prisma.lORRequest.findMany({
      where: teacherId ? { teacherId } : {},
      orderBy: { createdAt: "asc" },
      include: {
        documents: true,
        student: { select: { id: true, name: true, email: true } },
        teacher: { select: { id: true, name: true, email: true } },
      },
    });
    return res.status(200).json(new ApiResponse(200, items, "OK"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, "Server Error", err));
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body || {};

    const allowed = ["PENDING", "APPROVED", "REJECTED", "CHANGES_REQUESTED"];
    if (!allowed.includes(status)) {
      return res.status(400).json(new ApiError(400, "Invalid status"));
    }

    const item = await prisma.lORRequest.findUnique({ 
      where: { id: Number(id) },
      include: {
        student: {
          include: {
            studentProfile: true
          }
        },
        teacher: true
      }
    });
    if (!item) {
      return res.status(404).json(new ApiError(404, "Request not found"));
    }

    // Authorization and workflow
    const isTeacherOrAdmin =
      (req.user.role === "TEACHER" && item.teacherId === req.user.id) ||
      req.user.role === "ADMIN";

    const isStudentOwner = req.user.role === "STUDENT" && req.user.id === item.studentId;

    // Allow student owner to resubmit: any CHANGES_REQUESTED -> PENDING
    if (isStudentOwner) {
      if (!(status === "PENDING" && item.status === "CHANGES_REQUESTED")) {
        return res.status(400).json(new ApiError(400, "Students can only resubmit to PENDING after changes requested"));
      }
    } else if (isTeacherOrAdmin) {
      // Teacher/Admin allowed transitions when item is actionable
      if (!(item.status === "PENDING" || item.status === "CHANGES_REQUESTED")) {
        return res.status(400).json(new ApiError(400, "Only pending/changes requested can be updated"));
      }
    } else {
      return res.status(403).json(new ApiError(403, "Forbidden"));
    }

    // Generate PDFs if status is being changed to APPROVED
    if (status === "APPROVED" && item.status !== "APPROVED") {
      try {
        // Generate both PDF forms
        const letterHeadPdfPath = await generateLORApprovalPDF(item);
        const lorRecommendationPdfPath = await generateLORRecommendationFormPDF(item);
        
        const letterHeadPdfFilename = path.basename(letterHeadPdfPath);
        const lorRecommendationPdfFilename = path.basename(lorRecommendationPdfPath);
        
        // Store PDF filenames in requestData
        const updatedRequestData = {
          ...(item.requestData && typeof item.requestData === 'object' ? item.requestData : {}),
          letterHeadFormPdf: letterHeadPdfFilename,
          lorRecommendationFormPdf: lorRecommendationPdfFilename
        };
        
        const updated = await prisma.lORRequest.update({
          where: { id: item.id },
          data: { 
            status, 
            comment: comment ?? item.comment,
            requestData: updatedRequestData
          },
        });

        return res.status(200).json(new ApiResponse(200, updated, "Status updated and PDFs generated"));
      } catch (pdfError) {
        console.error("Error generating PDFs:", pdfError);
        // Still update status even if PDF generation fails
      }
    }

    const updated = await prisma.lORRequest.update({
      where: { id: item.id },
      data: { status, comment: comment ?? item.comment },
    });

    return res.status(200).json(new ApiResponse(200, updated, "Status updated"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, "Server Error", err));
  }
};

export const listAllRequests = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json(new ApiError(403, "Forbidden"));
    }

    const items = await prisma.lORRequest.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        student: {
          select: { id: true, name: true, email: true }
        },
        teacher: {
          select: { id: true, name: true, email: true }
        },
        documents: true
      }
    });

    return res.status(200).json(new ApiResponse(200, items, "OK"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, "Server Error", err));
  }
};


export const reassignRequest = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json(new ApiError(403, "Forbidden"));
    }

    const { id } = req.params;
    const { newTeacherId } = req.body || {};

    if (!newTeacherId) {
      return res.status(400).json(new ApiError(400, "newTeacherId is required"));
    }

    const lor = await prisma.lORRequest.findUnique({ where: { id: Number(id) } });
    if (!lor) {
      return res.status(404).json(new ApiError(404, "Request not found"));
    }

    if (lor.status !== "PENDING") {
      return res.status(400).json(new ApiError(400, "Only pending requests can be reassigned"));
    }

    const teacher = await prisma.user.findUnique({ where: { id: newTeacherId } });
    if (!teacher || teacher.role !== "TEACHER") {
      return res.status(404).json(new ApiError(404, "Target teacher not found"));
    }

    const updated = await prisma.lORRequest.update({
      where: { id: lor.id },
      data: { teacherId: newTeacherId, comment: lor.comment },
    });

    return res.status(200).json(new ApiResponse(200, updated, "Request reassigned"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, "Server Error", err));
  }
};

export const exportRequestsCsv = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json(new ApiError(403, "Forbidden"));
    }

    const items = await prisma.lORRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        student: { select: { id: true, name: true, email: true } },
        teacher: { select: { id: true, name: true, email: true } },
      },
    });

    const headers = [
      "id",
      "studentId",
      "studentName",
      "studentEmail",
      "teacherId",
      "teacherName",
      "teacherEmail",
      "purpose",
      "status",
      "comment",
      "createdAt",
      "updatedAt",
    ];

    const escapeCsv = (value) => {
      if (value === null || value === undefined) return "";
      const str = String(value);
      if (/[",\n]/.test(str)) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const rows = items.map((r) => [
      r.id,
      r.student?.id ?? "",
      r.student?.name ?? "",
      r.student?.email ?? "",
      r.teacher?.id ?? "",
      r.teacher?.name ?? "",
      r.teacher?.email ?? "",
      r.purpose ?? "",
      r.status,
      r.comment ?? "",
      r.createdAt.toISOString(),
      r.updatedAt.toISOString(),
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.map(escapeCsv).join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=lor_requests.csv");
    return res.status(200).send(csv);
  } catch (err) {
    return res.status(500).json(new ApiError(500, "Server Error", err));
  }
};

export const uploadSupportingDocuments = async (req, res) => {
  try {
    const { id } = req.params; // LOR request id
    const requestItem = await prisma.lORRequest.findUnique({ where: { id: Number(id) } });
    if (!requestItem) {
      return res.status(404).json(new ApiError(404, "Request not found"));
    }

    // Only the student who owns the request or admin can upload
    if (!(req.user.role === "ADMIN" || req.user.id === requestItem.studentId)) {
      return res.status(403).json(new ApiError(403, "Forbidden"));
    }

    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json(new ApiError(400, "No files uploaded"));
    }

    const created = await prisma.supportingDocument.createMany({
      data: files.map(f => ({
        requestId: requestItem.id,
        originalName: f.originalname,
        filename: f.filename,
        mimeType: f.mimetype,
        size: f.size,
      }))
    });

    return res.status(201).json(new ApiResponse(201, { count: created.count }, "Documents uploaded"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, "Server Error", err));
  }
};


export const listActiveTeachers = async (req, res) => {
  try {
    // Final fallback: fetch and filter in JS to bypass any enum query mismatches
    const rawUsers = await prisma.user.findMany();
    const rawTeachers = rawUsers.filter(u => u.role === "TEACHER");
    const teachers = rawTeachers.map(t => ({ id: t.id, name: t.name, email: t.email }));
    return res.status(200).json(new ApiResponse(200, teachers, "OK"));
  } catch (err) {
    console.error("/lor/teachers error:", err);
    return res.status(500).json(new ApiError(500, "Server Error", err));
  }
};
// New: Get a single request with full details including comments and student profile
export const getRequestDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(String(id))) {
      return res.status(400).json(new ApiError(400, "Invalid request id"));
    }
    const item = await prisma.lORRequest.findUnique({
      where: { id: Number(id) },
      include: {
        documents: true,
        student: { select: { id: true, name: true, email: true, studentProfile: true } },
        teacher: { select: { id: true, name: true, email: true } },
        comments: {
          include: { author: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    if (!item) return res.status(404).json(new ApiError(404, "Request not found"));

    // Authorization: student, assigned teacher or admin can view
    if (!(
      req.user.role === "ADMIN" ||
      req.user.id === item.studentId ||
      req.user.id === item.teacherId
    )) {
      return res.status(403).json(new ApiError(403, "Forbidden"));
    }

    return res.status(200).json(new ApiResponse(200, item, "OK"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, "Server Error", err));
  }
};

// New: Add a comment to a request (teacher or student)
export const addRequestComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req.body || {};
    if (!body || !body.trim()) {
      return res.status(400).json(new ApiError(400, "Comment body is required"));
    }
    const item = await prisma.lORRequest.findUnique({ where: { id: Number(id) } });
    if (!item) return res.status(404).json(new ApiError(404, "Request not found"));

    if (!(
      req.user.role === "ADMIN" ||
      req.user.id === item.studentId ||
      req.user.id === item.teacherId
    )) {
      return res.status(403).json(new ApiError(403, "Forbidden"));
    }

    const comment = await prisma.lORRequestComment.create({
      data: {
        requestId: item.id,
        authorId: req.user.id,
        body: body.trim(),
      },
      include: { author: { select: { id: true, name: true, role: true } } }
    });
    return res.status(201).json(new ApiResponse(201, comment, "Comment added"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, "Server Error", err));
  }
};

// New: Student updates mutable fields while status is PENDING or CHANGES_REQUESTED
export const updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { purpose, copies, requestData } = req.body || {};
    const item = await prisma.lORRequest.findUnique({ where: { id: Number(id) } });
    if (!item) return res.status(404).json(new ApiError(404, "Request not found"));
    if (!(req.user.role === "ADMIN" || req.user.id === item.studentId)) {
      return res.status(403).json(new ApiError(403, "Forbidden"));
    }
    if (!(item.status === "PENDING" || item.status === "CHANGES_REQUESTED")) {
      return res.status(400).json(new ApiError(400, "Request cannot be edited in current status"));
    }
    const updated = await prisma.lORRequest.update({
      where: { id: item.id },
      data: {
        purpose: purpose ?? item.purpose,
        copies: copies !== undefined ? Number(copies) : item.copies,
        requestData: requestData !== undefined ? requestData : item.requestData,
      }
    });
    return res.status(200).json(new ApiResponse(200, updated, "Request updated"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, "Server Error", err));
  }
};

// Download generated PDF for approved LOR request
export const downloadLetterHeadFormPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.lORRequest.findUnique({ where: { id: Number(id) } });
    
    if (!item) {
      return res.status(404).json(new ApiError(404, "Request not found"));
    }

    // Only student owner, teacher, or admin can download
    if (!(
      req.user.role === "ADMIN" ||
      req.user.id === item.studentId ||
      req.user.id === item.teacherId
    )) {
      return res.status(403).json(new ApiError(403, "Forbidden"));
    }

    // Check if request is approved
    if (item.status !== "APPROVED") {
      return res.status(400).json(new ApiError(400, "PDF is only available for approved requests"));
    }

    // Get PDF filename from requestData
    let pdfFilename = null;
    if (item.requestData && typeof item.requestData === 'object') {
      pdfFilename = item.requestData.letterHeadFormPdf;
    }

    if (!pdfFilename) {
      return res.status(404).json(new ApiError(404, "PDF not found. Please contact administrator."));
    }

    const pdfPath = path.join(process.cwd(), 'generated-pdfs', pdfFilename);

    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json(new ApiError(404, "PDF file not found on server"));
    }

    // Send PDF file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdfFilename}"`);
    
    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);

    fileStream.on('error', (err) => {
      console.error('Error reading PDF file:', err);
      if (!res.headersSent) {
        return res.status(500).json(new ApiError(500, "Error reading PDF file"));
      }
    });
  } catch (err) {
    console.error('Error in downloadLetterHeadFormPDF:', err);
    return res.status(500).json(new ApiError(500, "Server Error", err));
  }
};

// Download LOR Recommendation Form PDF for approved request
export const downloadLORRecommendationFormPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.lORRequest.findUnique({ where: { id: Number(id) } });
    
    if (!item) {
      return res.status(404).json(new ApiError(404, "Request not found"));
    }

    // Only student owner, teacher, or admin can download
    if (!(
      req.user.role === "ADMIN" ||
      req.user.id === item.studentId ||
      req.user.id === item.teacherId
    )) {
      return res.status(403).json(new ApiError(403, "Forbidden"));
    }

    // Check if request is approved
    if (item.status !== "APPROVED") {
      return res.status(400).json(new ApiError(400, "PDF is only available for approved requests"));
    }

    // Get PDF filename from requestData
    let pdfFilename = null;
    if (item.requestData && typeof item.requestData === 'object') {
      pdfFilename = item.requestData.lorRecommendationFormPdf;
    }

    if (!pdfFilename) {
      return res.status(404).json(new ApiError(404, "PDF not found. Please contact administrator."));
    }

    const pdfPath = path.join(process.cwd(), 'generated-pdfs', pdfFilename);

    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json(new ApiError(404, "PDF file not found on server"));
    }

    // Send PDF file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdfFilename}"`);
    
    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);

    fileStream.on('error', (err) => {
      console.error('Error reading PDF file:', err);
      if (!res.headersSent) {
        return res.status(500).json(new ApiError(500, "Error reading PDF file"));
      }
    });
  } catch (err) {
    console.error('Error in downloadLORRecommendationFormPDF:', err);
    return res.status(500).json(new ApiError(500, "Server Error", err));
  }
};


