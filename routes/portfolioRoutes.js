import express from "express";
import upload from "../middleware/resumeUpload.js";

import {generatePortfolio} from '../controllers/portfolioController.js';
import isAuthenticated from "../middleware/isAuth.js";
const router = express.Router();

router.post("/generate", isAuthenticated ,upload.single("resume"),generatePortfolio);

export default router;

