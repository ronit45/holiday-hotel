import express from "express";
import { check, validationResult } from "express-validator";
import verifyToken from "../middleware/auth.js";
import { authCookieOptions } from "../lib/cookie-options.js";
import { userService } from "../services/user.service.js";
import { authService } from "../services/auth.service.js";

const router = express.Router();

router.get("/me", verifyToken, async (req, res) => {
  const user = await userService.getUserById(req.userId);
  user ? res.json(user) : res.status(400).json({ message: "User not found" });
});

router.post("/register", [check("firstName").isString(), check("lastName").isString(), check("email").isEmail(), check("password").isLength({ min: 6 })], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array() });

  try {
    const user = await userService.registerUser(req.body);
    res.cookie("auth_token", authService.generateToken(user.id), authCookieOptions()).status(200).send({ message: "User registered OK" });
  } catch (error) {
    if (error.message === "User already exists") return res.status(400).json({ message: error.message });
    throw error;
  }
});

export default router;
