import { Router } from "express";
import isAuthenticated from "../middlewares/Authentication.middleware.js";
import { listStudents, createStudent, updateStudent, deleteStudent, submitEntry } from "../controllers/student.controller.js";


const router = Router();

router.use(isAuthenticated);
router.get("/", listStudents);
router.post("/", createStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);
router.post("/submit", submitEntry);
export default router;


