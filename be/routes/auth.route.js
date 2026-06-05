import express from "express";
import { login } from "../controllers/login.controller.js";
import { register } from "../controllers/register.controller.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);

export default router;
