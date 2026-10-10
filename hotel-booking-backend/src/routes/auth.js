import express from "express";
import { check, validationResult } from "express-validator";
import verifyToken from "../middleware/auth.js";
import { clearAuthCookieOptions } from "../lib/cookie-options.js";
import { authService } from "../services/auth.service.js";

const router = express.Router();

router.post("/login", [check("email", "Email is required").isEmail(), check("password", "Password with 6 or more characters required").isLength({ min: 6 })], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array() });

  try {
    const { user, token } = await authService.login(req.body.email, req.body.password);
    res.status(200).json({ userId: user._id, message: "Login successful", token, user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
  } catch (error) {
    if (error.message === "Invalid Credentials") return res.status(400).json({ message: "Invalid Credentials" });
    throw error;
  }
});

router.get("/validate-token", verifyToken, (req, res) => res.status(200).send({ userId: req.userId }));

router.post("/logout", (req, res) => {
  res.cookie("session_id", "", { ...clearAuthCookieOptions(), maxAge: 0 }).cookie("auth_token", "", { ...clearAuthCookieOptions(), maxAge: 0 }).send();
});

export default router;
