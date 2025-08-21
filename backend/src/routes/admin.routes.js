import { Router } from "express";
import isAuthenticated from "../middlewares/Authentication.middleware.js";
import { 
  getDashboardStats, 
  getBatches, 
  createBatch,
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  bulkUploadStudents,
  bulkUploadTeachers,
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher
} from "../controllers/admin.controller.js";

const router = Router();

router.use(isAuthenticated);

// Dashboard
router.get("/dashboard-stats", getDashboardStats);

// Class Management removed

// Batch Management
router.get("/batches", getBatches);
router.post("/batches", createBatch);

// Enhanced Student Management
router.get("/students", getStudents);
router.post("/students", createStudent);
router.post("/students/bulk", bulkUploadStudents);
router.put("/students/:id", updateStudent);
router.delete("/students/:id", deleteStudent);

// Teachers bulk upload
router.post("/teachers/bulk", bulkUploadTeachers);

// Teachers CRUD
router.get("/teachers", getTeachers);
router.post("/teachers", createTeacher);
router.put("/teachers/:id", updateTeacher);
router.delete("/teachers/:id", deleteTeacher);

export default router;
