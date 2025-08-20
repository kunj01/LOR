import prisma from "../utils/prismClient.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import bcrypt from "bcrypt";

function assertAdmin(req) {
  if (req.user?.role !== "ADMIN") {
    const error = new ApiError(403, "Access denied. Admin only.");
    error.statusCode = 403;
    throw error;
  }
}

export const listStudents = async (req, res) => {
  try {
    assertAdmin(req);
    const users = await prisma.user.findMany({
      where: { role: { equals: "STUDENT" } },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    });
    return res.status(200).json(new ApiResponse(200, users, "OK"));
  } catch (err) {
    const code = err.statusCode || 500;
    return res.status(code).json(new ApiError(code, err.message || "Server Error", err));
  }
};

export const createStudent = async (req, res) => {
  try {
    assertAdmin(req);
    const { id, name, email, password } = req.body;
    if (!id || !name || !email || !password) {
      return res.status(400).json(new ApiError(400, "All fields are required"));
    }
    const hashed = bcrypt.hashSync(password, 10);
    const user = await prisma.user.create({
      data: { id, name, email, password: hashed, role: "STUDENT" },
      select: { id: true, name: true, email: true, role: true },
    });
    return res.status(200).json(new ApiResponse(200, user, "Student created"));
  } catch (err) {
    const code = err.code === "P2002" ? 409 : err.statusCode || 500;
    const message = err.code === "P2002" ? "ID or Email already exists" : err.message || "Server Error";
    return res.status(code).json(new ApiError(code, message, err));
  }
};

export const updateStudent = async (req, res) => {
  try {
    assertAdmin(req);
    const { id } = req.params;
    const { name, email, password } = req.body;
    const data = { name, email };
    if (password) data.password = bcrypt.hashSync(password, 10);
    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true },
    });
    return res.status(200).json(new ApiResponse(200, user, "Student updated"));
  } catch (err) {
    const code = err.statusCode || 500;
    return res.status(code).json(new ApiError(code, err.message || "Server Error", err));
  }
};

export const deleteStudent = async (req, res) => {
  try {
    assertAdmin(req);
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    return res.status(200).json(new ApiResponse(200, {}, "Student deleted"));
  } catch (err) {
    const code = err.statusCode || 500;
    return res.status(code).json(new ApiError(code, err.message || "Server Error", err));
  }
};

export const submitEntry = async (req, res) => {
  try {
    const { userId } = req.user;
    const {
      activityId,
      documentLink,
      event_name,
      event_location,
      event_organizer,
      event_date,
      event_mode,
      isWinner,
      position,
      awardId,
      counsellorId,
      headId,
      comment
    } = req.body;

    // Validate required fields
    if (!activityId || !documentLink || !event_name || !event_location || 
        !event_organizer || !event_date || !counsellorId || !headId) {
      return res.status(400).json(new ApiError(400, "Missing required fields"));
    }

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        userId,
        activityId: parseInt(activityId),
        documentLink,
        event_name,
        event_location,
        event_organizer,
        event_date: new Date(event_date),
        event_mode: event_mode || "OFFLINE",
        isWinner: isWinner || false,
        position: position || 0,
        awardId: awardId ? parseInt(awardId) : null,
        counsellorId,
        headId,
        status: "PENDING",
        comment: comment || ""
      },
      include: {
        activity: {
          include: {
            nature: {
              include: {
                subCatagory: {
                  include: {
                    category: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return res.status(200).json(new ApiResponse(200, submission, "Entry submitted successfully"));
  } catch (err) {
    console.error("Error submitting entry:", err);
    const code = err.statusCode || 500;
    return res.status(code).json(new ApiError(code, err.message || "Server Error", err));
  }
};


