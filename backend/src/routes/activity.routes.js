import { Router } from "express";
import isAuthenticated from "../middlewares/Authentication.middleware.js";
import { 
  getCategories, 
  getSubCategories, 
  getNature, 
  getActivity 
} from "../controllers/activity.controller.js";

const router = Router();

router.use(isAuthenticated);

router.get("/get-category", getCategories);
router.get("/get-subcategory/:category", getSubCategories);
router.get("/get-nature/:subcategory", getNature);
router.get("/get-activity/:nature", getActivity);

export default router;
