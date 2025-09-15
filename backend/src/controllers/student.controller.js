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

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidMobile(mobile) {
  return /^\d{10}$/.test(mobile);
}

const createStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if profile already exists
    const existingProfile = await prisma.studentProfile.findUnique({
      where: { userId }
    });
    
    if (existingProfile) {
      return res.status(400).json(new ApiError(400, "Profile already exists"));
    }
    
    const {
      studentId,
      studentFullName,
      emailId,
      admissionMonth,
      admissionYear,
      candidateMobile,
      parentMobile,
      bondPeriodCompleted,
      placementThroughCDPC,
      letterHeadCount,
      semesterResults,
      universityPreferences,
      competitiveExams,
      facultySelection
    } = req.body;

    // Basic validation
    if (!studentId || !studentFullName || !emailId) {
      return res.status(400).json(new ApiError(400, "Missing required personal information fields"));
    }
    if (!isValidEmail(emailId)) {
      return res.status(400).json(new ApiError(400, "Invalid email format"));
    }
    if (!isValidMobile(candidateMobile) || !isValidMobile(parentMobile)) {
      return res.status(400).json(new ApiError(400, "Mobile numbers must be exactly 10 digits"));
    }
    
    // Create profile with all related data
    const profile = await prisma.studentProfile.create({
      data: {
        userId,
        studentId,
        studentFullName,
        emailId,
        admissionMonth,
        admissionYear,
        candidateMobile,
        parentMobile,
        bondPeriodCompleted,
        placementThroughCDPC,
        letterHeadCount,
        facultySelection,
        semesterResults: {
          create: semesterResults.map(result => ({
            semester: result.semester,
            attendance: result.attendance,
            cgpa: result.cgpa
          }))
        },
        universityPreferences: {
          create: universityPreferences.map(pref => ({
            universityName: pref.universityName,
            courseName: pref.courseName,
            countryName: pref.countryName,
            intakeMonth: pref.intakeMonth,
            intakeYear: pref.intakeYear
          }))
        },
        competitiveExams: {
          create: competitiveExams.map(exam => ({
            examName: exam.examName,
            score: exam.score,
            scorecardFile: exam.scorecardFile
          }))
        }
      },
      include: {
        semesterResults: true,
        universityPreferences: true,
        competitiveExams: true
      }
    });
    
    // Mark user profile as completed
    await prisma.user.update({
      where: { id: userId },
      data: { profileCompleted: true }
    });
    
    return res.status(201).json(new ApiResponse(201, profile, "Student profile created successfully"));
  } catch (err) {
    console.error("Profile creation error:", err);
    return res.status(500).json(new ApiError(500, "Internal Server Error", err));
  }
};

const getStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        semesterResults: {
          orderBy: { semester: 'asc' }
        },
        universityPreferences: true,
        competitiveExams: true
      }
    });
    
    if (!profile) {
      return res.status(404).json(new ApiError(404, "Profile not found"));
    }
    
    return res.status(200).json(new ApiResponse(200, profile, "Profile retrieved successfully"));
  } catch (err) {
    console.error("Profile retrieval error:", err);
    return res.status(500).json(new ApiError(500, "Internal Server Error", err));
  }
};

const updateStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const profile = await prisma.studentProfile.findUnique({
      where: { userId }
    });
    
    if (!profile) {
      return res.status(404).json(new ApiError(404, "Profile not found"));
    }
    
    const {
      studentId,
      studentFullName,
      emailId,
      admissionMonth,
      admissionYear,
      candidateMobile,
      parentMobile,
      bondPeriodCompleted,
      placementThroughCDPC,
      letterHeadCount,
      semesterResults,
      universityPreferences,
      competitiveExams,
      facultySelection
    } = req.body;

    // Validation
    if (!studentId || !studentFullName || !emailId) {
      return res.status(400).json(new ApiError(400, "Missing required personal information fields"));
    }
    if (!isValidEmail(emailId)) {
      return res.status(400).json(new ApiError(400, "Invalid email format"));
    }
    if (!isValidMobile(candidateMobile) || !isValidMobile(parentMobile)) {
      return res.status(400).json(new ApiError(400, "Mobile numbers must be exactly 10 digits"));
    }
    
    // Update profile with all related data
    const updatedProfile = await prisma.studentProfile.update({
      where: { userId },
      data: {
        studentId,
        studentFullName,
        emailId,
        admissionMonth,
        admissionYear,
        candidateMobile,
        parentMobile,
        bondPeriodCompleted,
        placementThroughCDPC,
        letterHeadCount,
        facultySelection,
        // Delete existing related data and recreate
        semesterResults: {
          deleteMany: {},
          create: semesterResults.map(result => ({
            semester: result.semester,
            attendance: result.attendance,
            cgpa: result.cgpa
          }))
        },
        universityPreferences: {
          deleteMany: {},
          create: universityPreferences.map(pref => ({
            universityName: pref.universityName,
            courseName: pref.courseName,
            countryName: pref.countryName,
            intakeMonth: pref.intakeMonth,
            intakeYear: pref.intakeYear
          }))
        },
        competitiveExams: {
          deleteMany: {},
          create: competitiveExams.map(exam => ({
            examName: exam.examName,
            score: exam.score,
            scorecardFile: exam.scorecardFile
          }))
        }
      },
      include: {
        semesterResults: true,
        universityPreferences: true,
        competitiveExams: true
      }
    });
    
    return res.status(200).json(new ApiResponse(200, updatedProfile, "Profile updated successfully"));
  } catch (err) {
    console.error("Profile update error:", err);
    return res.status(500).json(new ApiError(500, "Internal Server Error", err));
  }
};

export { 
  // listStudents,
  // createStudent,
  // updateStudent,
  // deleteStudent,
  createStudentProfile,
  getStudentProfile,
  updateStudentProfile
};

// Draft endpoints for autosave
export const upsertStudentProfileDraft = async (req, res) => {
  try {
    const userId = req.user.id;
    const body = req.body || {};

    // Validate partials where applicable
    if (body.emailId && !isValidEmail(body.emailId)) {
      return res.status(400).json(new ApiError(400, "Invalid email format"));
    }
    if (body.candidateMobile && !isValidMobile(body.candidateMobile)) {
      return res.status(400).json(new ApiError(400, "Candidate mobile must be exactly 10 digits"));
    }
    if (body.parentMobile && !isValidMobile(body.parentMobile)) {
      return res.status(400).json(new ApiError(400, "Parent mobile must be exactly 10 digits"));
    }

    const data = {
      userId,
      studentId: body.studentId ?? undefined,
      studentFullName: body.studentFullName ?? undefined,
      emailId: body.emailId ?? undefined,
      admissionMonth: body.admissionMonth ?? undefined,
      admissionYear: body.admissionYear ?? undefined,
      candidateMobile: body.candidateMobile ?? undefined,
      parentMobile: body.parentMobile ?? undefined,
      bondPeriodCompleted: body.bondPeriodCompleted ?? undefined,
      placementThroughCDPC: body.placementThroughCDPC ?? undefined,
      letterHeadCount: body.letterHeadCount ?? undefined,
      facultySelection: body.facultySelection ?? undefined,
      semesterResults: body.semesterResults ? JSON.stringify(body.semesterResults) : undefined,
      universityPreferences: body.universityPreferences ? JSON.stringify(body.universityPreferences) : undefined,
      competitiveExams: body.competitiveExams ? JSON.stringify(body.competitiveExams) : undefined,
    };

    const draft = await prisma.studentProfileDraft.upsert({
      where: { userId },
      update: data,
      create: data,
    });

    // Parse JSON fields for response consistency
    const parsed = {
      ...draft,
      semesterResults: draft.semesterResults ? JSON.parse(draft.semesterResults) : null,
      universityPreferences: draft.universityPreferences ? JSON.parse(draft.universityPreferences) : null,
      competitiveExams: draft.competitiveExams ? JSON.parse(draft.competitiveExams) : null,
    };

    return res.status(200).json(new ApiResponse(200, parsed, "Draft saved"));
  } catch (err) {
    console.error("Draft upsert error:", err);
    return res.status(500).json(new ApiError(500, "Internal Server Error", err));
  }
};

export const getStudentProfileDraft = async (req, res) => {
  try {
    const userId = req.user.id;
    const draft = await prisma.studentProfileDraft.findUnique({ where: { userId } });
    if (!draft) {
      return res.status(404).json(new ApiError(404, "Draft not found"));
    }
    const parsed = {
      ...draft,
      semesterResults: draft.semesterResults ? JSON.parse(draft.semesterResults) : null,
      universityPreferences: draft.universityPreferences ? JSON.parse(draft.universityPreferences) : null,
      competitiveExams: draft.competitiveExams ? JSON.parse(draft.competitiveExams) : null,
    };
    return res.status(200).json(new ApiResponse(200, parsed, "Draft retrieved"));
  } catch (err) {
    console.error("Draft get error:", err);
    return res.status(500).json(new ApiError(500, "Internal Server Error", err));
  }
};


