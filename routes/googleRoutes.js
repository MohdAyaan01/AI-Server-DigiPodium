import express from "express";
import {googleAuth} from "../controllers/authController.js"

const router = express.Router();
router.post("/google-login",googleAuth);

export default router