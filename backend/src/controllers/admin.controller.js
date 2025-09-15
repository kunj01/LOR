import prisma from "../utils/prismClient.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import bcrypt from "bcrypt";

// Helpers for batch management (classless)
const getOrCreateBatch = async (batchName) => {
  let batch = await prisma.batch.findFirst({
    where: {
      name: { equals: batchName }
    }
  });
  if (!batch) {
    batch = await prisma.batch.create({
      data: { name: batchName }
    });
  }
  return batch;
};

export const getDashboardStats = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json(new ApiError(403, "Forbidden"));
    }

    // Get user counts by role
    const [students, teachers, admins] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "TEACHER" } }),
      prisma.user.count({ where: { role: "ADMIN" } })
    ]);

    // Get LOR request counts by status
    const [pendingRequests, approvedRequests, rejectedRequests] = await Promise.all([
      prisma.lORRequest.count({ where: { status: "PENDING" } }),
      prisma.lORRequest.count({ where: { status: "APPROVED" } }),
      prisma.lORRequest.count({ where: { status: "REJECTED" } })
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentRequests = await prisma.lORRequest.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });

    const stats = {
      users: {
        students,
        teachers,
        admins,
        total: students + teachers + admins
      },
      lorRequests: {
        pending: pendingRequests,
        approved: approvedRequests,
        rejected: rejectedRequests,
        total: pendingRequests + approvedRequests + rejectedRequests
      },
      recentActivity: {
        newRequests: recentRequests
      }
    };

    return res.status(200).json(new ApiResponse(200, stats, "Dashboard stats retrieved"));
  } catch (err) {
    console.error("Dashboard stats error:", err);
    return res.status(500).json(new ApiError(500, "Server Error", err));
  }
};

// Class Management removed (classless model)

// Batch Management
export const getBatches = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json(new ApiError(403, "Forbidden"));
    }

    const batches = await prisma.batch.findMany({
      include: { _count: { select: { students: true } } },
      orderBy: { name: 'asc' }
    });

    return res.status(200).json(new ApiResponse(200, batches, "Batches retrieved"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, "Server Error", err));
  }
};

export const createBatch = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json(new ApiError(403, "Forbidden"));
    }

    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json(new ApiError(400, "Batch name is required"));
    }

    const newBatch = await prisma.batch.create({ data: { name, description } });

    return res.status(201).json(new ApiResponse(201, newBatch, "Batch created"));
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json(new ApiError(409, "Batch name already exists"));
    }
    return res.status(500).json(new ApiError(500, "Server Error", err));
  }
};

// Enhanced Student Management
export const getStudents = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json(new ApiError(403, "Forbidden"));
    }

    const { 
      page = 1, 
      limit = 10, 
      search = "", 
      batchId, 
      status,
      sortBy = "name",
      sortOrder = "asc"
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where clause
    const where = {
      role: "STUDENT",
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { id: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(batchId && { batchId: parseInt(batchId) }),
      ...(status && { status })
    };

    // Build orderBy clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { batch: { select: { name: true } } },
        orderBy,
        skip,
        take: parseInt(limit)
      }),
      prisma.user.count({ where })
    ]);

    return res.status(200).json(new ApiResponse(200, {
      students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, "Students retrieved"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, "Server Error", err));
  }
};

export const createStudent = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json(new ApiError(403, "Forbidden"));
    }

    const { id, name, email, password, batchId } = req.body;
    
    if (!id || !name || !email || !password) {
      return res.status(400).json(new ApiError(400, "ID, name, email, and password are required"));
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const student = await prisma.user.create({
      data: {
        id,
        name,
        email,
        password: hashedPassword,
        role: "STUDENT",
        batchId: batchId ? parseInt(batchId) : null
      },
      include: { batch: { select: { name: true } } }
    });

    delete student.password;
    return res.status(201).json(new ApiResponse(201, student, "Student created"));
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json(new ApiError(409, "Student ID or email already exists"));
    }
    return res.status(500).json(new ApiError(500, "Server Error", err));
  }
};

export const updateStudent = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json(new ApiError(403, "Forbidden"));
    }

    const { id } = req.params;
    const { name, email, batchId, status } = req.body;

    const updateData = { name, email, batchId: batchId ? parseInt(batchId) : null, status };

    const student = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { batch: { select: { name: true } } }
    });

    delete student.password;
    return res.status(200).json(new ApiResponse(200, student, "Student updated"));
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json(new ApiError(404, "Student not found"));
    }
    return res.status(500).json(new ApiError(500, "Server Error", err));
  }
};

export const deleteStudent = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json(new ApiError(403, "Forbidden"));
    }

    const { id } = req.params;
    await prisma.user.delete({ where: { id } });

    return res.status(200).json(new ApiResponse(200, {}, "Student deleted"));
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json(new ApiError(404, "Student not found"));
    }
    return res.status(500).json(new ApiError(500, "Server Error", err));
  }
};

export const bulkUploadStudents = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json(new ApiError(403, "Forbidden"));
    }

    const { students } = req.body;
    
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json(new ApiError(400, "Students array is required and cannot be empty"));
    }

    const results = {
      success: [],
      errors: []
    };

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const { id, name, email, password, batchname } = student;

      try {
        // Validate required fields
        if (!id || !name || !email || !password) {
          results.errors.push({
            row: i + 1,
            error: "Missing required fields: id, name, email, password"
          });
          continue;
        }

        let batchId = null;
        if (batchname && batchname.trim()) {
          const batch = await getOrCreateBatch(batchname.trim());
          batchId = batch.id;
        }

        // Hash password
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Create student
        const newStudent = await prisma.user.create({
          data: {
            id,
            name,
            email,
            password: hashedPassword,
            role: "STUDENT",
            status: "ACTIVE",
            batchId
          },
          include: { batch: { select: { name: true } } }
        });

        delete newStudent.password;
        results.success.push({
          row: i + 1,
          student: newStudent
        });

      } catch (err) {
        if (err.code === 'P2002') {
          results.errors.push({
            row: i + 1,
            error: "Student ID or email already exists"
          });
        } else {
          results.errors.push({
            row: i + 1,
            error: err.message || "Unknown error"
          });
        }
      }
    }

    return res.status(200).json(new ApiResponse(200, results, "Bulk upload completed"));
  } catch (err) {
    console.error("Bulk upload error:", err);
    return res.status(500).json(new ApiError(500, "Server Error", err));
  }
};

export const bulkUploadTeachers = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json(new ApiError(403, "Forbidden"));
    }

    const { teachers } = req.body;
    if (!Array.isArray(teachers) || teachers.length === 0) {
      return res.status(400).json(new ApiError(400, "Teachers array is required and cannot be empty"));
    }

    const results = { success: [], errors: [] };

    for (let i = 0; i < teachers.length; i++) {
      const teacher = teachers[i];
      const { id, name, email, password } = teacher;
      try {
        if (!id || !name || !email || !password) {
          results.errors.push({ row: i + 1, error: "Missing required fields: id, name, email, password" });
          continue;
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const newTeacher = await prisma.user.create({
          data: {
            id,
            name,
            email,
            password: hashedPassword,
            role: "TEACHER",
            status: "ACTIVE"
          }
        });

        delete newTeacher.password;
        results.success.push({ row: i + 1, teacher: newTeacher });
      } catch (err) {
        if (err.code === 'P2002') {
          results.errors.push({ row: i + 1, error: "Teacher ID or email already exists" });
        } else {
          results.errors.push({ row: i + 1, error: err.message || "Unknown error" });
        }
      }
    }

    return res.status(200).json(new ApiResponse(200, results, "Bulk upload completed"));
  } catch (err) {
    console.error("Bulk upload teachers error:", err);
    return res.status(500).json(new ApiError(500, "Server Error", err));
  }
};

// Teachers CRUD
export const getTeachers = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json(new ApiError(403, "Forbidden"));
    }

    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      sortBy = "name",
      sortOrder = "asc"
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      role: "TEACHER",
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { id: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(status && { status })
    };

    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [teachers, total] = await Promise.all([
      prisma.user.findMany({ where, orderBy, skip, take: parseInt(limit) }),
      prisma.user.count({ where })
    ]);

    return res.status(200).json(new ApiResponse(200, {
      teachers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, "Teachers retrieved"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, "Server Error", err));
  }
};

export const createTeacher = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json(new ApiError(403, "Forbidden"));
    }

    const { id, name, email, password } = req.body;
    if (!id || !name || !email || !password) {
      return res.status(400).json(new ApiError(400, "ID, name, email, and password are required"));
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const teacher = await prisma.user.create({
      data: { id, name, email, password: hashedPassword, role: "TEACHER", status: "ACTIVE" }
    });

    delete teacher.password;
    return res.status(201).json(new ApiResponse(201, teacher, "Teacher created"));
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json(new ApiError(409, "Teacher ID or email already exists"));
    }
    return res.status(500).json(new ApiError(500, "Server Error", err));
  }
};

export const updateTeacher = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json(new ApiError(403, "Forbidden"));
    }

    const { id } = req.params;
    const { name, email, status } = req.body;

    const teacher = await prisma.user.update({
      where: { id },
      data: { name, email, status }
    });

    delete teacher.password;
    return res.status(200).json(new ApiResponse(200, teacher, "Teacher updated"));
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json(new ApiError(404, "Teacher not found"));
    }
    return res.status(500).json(new ApiError(500, "Server Error", err));
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json(new ApiError(403, "Forbidden"));
    }

    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    return res.status(200).json(new ApiResponse(200, {}, "Teacher deleted"));
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json(new ApiError(404, "Teacher not found"));
    }
    return res.status(500).json(new ApiError(500, "Server Error", err));
  }
};
