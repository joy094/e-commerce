import express from "express";
import { isAdmin, requireSignIn } from "../middleware/authMiddleware.js";
import {
  createLandingPageController,
  getAllLandingPagesController,
  getSingleLandingPageController,
  deleteLandingPageController,
} from "../controller/landingPageController.js";

const router = express.Router();

// Admin Routes (Create & Manage)
router.post("/create", requireSignIn, isAdmin, createLandingPageController);
router.get("/all", requireSignIn, isAdmin, getAllLandingPagesController);
router.delete("/delete/:id", requireSignIn, isAdmin, deleteLandingPageController);

// Public Route (View Landing Page by Customer)
router.get("/:slug", getSingleLandingPageController);

export default router;
