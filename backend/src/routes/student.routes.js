import { Router } from "express";
import isAuthenticated from "../middlewares/Authentication.middleware.js";
import { listStudents, createStudent, updateStudent, deleteStudent, submitEntry } from "../controllers/student.controller.js";
import { createStudentProfile, getStudentProfile, updateStudentProfile, upsertStudentProfileDraft, getStudentProfileDraft } from "../controllers/student.controller.js";

const router = Router();

router.use(isAuthenticated);
router.get("/", listStudents);
router.post("/", createStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);
router.post("/submit", submitEntry);

// Student Profile Routes
router.post('/profile', isAuthenticated, createStudentProfile);
router.get('/profile', isAuthenticated, getStudentProfile);
router.put('/profile', isAuthenticated, updateStudentProfile);

// Draft routes for autosave
router.get('/profile/draft', isAuthenticated, getStudentProfileDraft);
router.put('/profile/draft', isAuthenticated, upsertStudentProfileDraft);

export default router;


