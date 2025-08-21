import { Router } from "express";
import isAuthenticated from "../middlewares/Authentication.middleware.js";
import { createRequest, listMyRequests, listAssignedRequests, updateRequestStatus, listAllRequests, reassignRequest, exportRequestsCsv, uploadSupportingDocuments, listActiveTeachers } from "../controllers/lor.controller.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

router.use(isAuthenticated);
router.post("/", createRequest);
router.get("/mine", listMyRequests);
router.get("/assigned", listAssignedRequests);
router.patch("/:id/status", updateRequestStatus);
router.get("/admin/all", listAllRequests);
router.patch("/:id/reassign", reassignRequest);
router.get("/admin/export/csv", exportRequestsCsv);
router.get("/teachers", listActiveTeachers);
// File uploads for supporting documents
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || "";
    cb(null, `doc-${unique}${ext}`);
  },
});
const upload = multer({ storage });
router.post("/:id/documents", upload.array("files", 5), uploadSupportingDocuments);

export default router;


