import { Router } from "express";
import {
  loginUser,
  registerUser,
  logout,
  ping,
  restPassword,
  getAllUsers,
} from "../controllers/auth.controller.js";
import isAuthenticated from "../middlewares/Authentication.middleware.js";

const router = Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/reset", isAuthenticated, restPassword);
router.get("/", isAuthenticated, ping);
router.get("/logout", isAuthenticated, logout);
router.get("/users", isAuthenticated, getAllUsers);

export default router;
