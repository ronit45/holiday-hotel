import express, { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import verifyToken from "../middleware/auth";
import requireAdmin from "../middleware/requireAdmin";
import { authCookieOptions } from "../lib/cookie-options";
import { userService } from "../services/user.service";
import { authService } from "../services/auth.service";

const router = express.Router();

router.get("/me", verifyToken, async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
});

/**
 * Admin: list users (no passwords).
 * GET /api/users
 */
router.get(
  "/",
  verifyToken,
  requireAdmin,
  async (_req: Request, res: Response) => {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to fetch users" });
    }
  }
);

/**
 * Admin: update user role.
 * PATCH /api/users/:id/role
 * Body: { role: "user" | "admin" | "hotel_owner" }
 */
router.patch(
  "/:id/role",
  verifyToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    const allowed = ["user", "admin", "hotel_owner"] as const;
    const role = req.body?.role;
    if (!allowed.includes(role)) {
      return res.status(400).json({
        message: `role must be one of: ${allowed.join(", ")}`,
      });
    }

    try {
      const user = await userService.updateUserRole(req.params.id, role, req.userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      if (error.message === "Cannot demote your own admin role") {
        return res.status(400).json({ message: error.message });
      }
      console.log(error);
      res.status(500).json({ message: "Unable to update role" });
    }
  }
);

router.post(
  "/register",
  [
    check("firstName", "First Name is required").isString(),
    check("lastName", "Last Name is required").isString(),
    check("email", "Email is required").isEmail(),
    check("password", "Password with 6 or more characters required").isLength({
      min: 6,
    }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }

    try {
      const user = await userService.registerUser(req.body);
      const token = authService.generateToken(user.id);

      res.cookie("auth_token", token, authCookieOptions());
      return res.status(200).send({ message: "User registered OK" });
    } catch (error: any) {
      if (error.message === "User already exists") {
        return res.status(400).json({ message: error.message });
      }
      console.log(error);
      res.status(500).send({ message: "Something went wrong" });
    }
  }
);

export default router;
