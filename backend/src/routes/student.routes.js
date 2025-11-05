import { Router } from "express";
import isAuthenticated from "../middlewares/Authentication.middleware.js";
import { listStudents, createStudent, updateStudent, deleteStudent, submitEntry } from "../controllers/student.controller.js";
import { createStudentProfile, getStudentProfile, updateStudentProfile, upsertStudentProfileDraft, getStudentProfileDraft } from "../controllers/student.controller.js";

const router = Router();

router.use(isAuthenticated);

// Student Profile Routes (must come before /:id routes to avoid route matching conflicts)
router.post('/profile', createStudentProfile);
router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);

// Draft routes for autosave
router.get('/profile/draft', getStudentProfileDraft);
router.put('/profile/draft', upsertStudentProfileDraft);

// Admin routes (these require admin access via assertAdmin in controller)
router.get("/", listStudents);
router.post("/", createStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);
router.post("/submit", submitEntry);

export default router;


