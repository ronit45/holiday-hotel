import express, { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import crypto from "crypto";
import verifyToken from "../middleware/auth";
import { clearAuthCookieOptions } from "../lib/cookie-options";
import { authService } from "../services/auth.service";
import { config } from "../config/env";

const router = express.Router();

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Initiate Google OAuth
 *     description: Redirects user to Google sign-in
 *     tags: [Authentication]
 */
router.get("/google", (req: Request, res: Response) => {
  if (!config.google.clientId) {
    return res.status(500).json({ message: "Google OAuth not configured" });
  }
  const state = crypto.randomBytes(32).toString("hex");
  const redirectUri = `${config.backendUrl}/api/auth/callback/google`;
  const scope = "openid email profile";
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.google.clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}&access_type=offline&prompt=consent`;
  res.redirect(url);
});

/**
 * @swagger
 * /api/auth/callback/google:
 *   get:
 *     summary: Google OAuth callback
 *     description: Handles redirect from Google, creates/logs in user
 *     tags: [Authentication]
 */
router.get("/callback/google", async (req: Request, res: Response) => {
  const { code, error } = req.query;

  if (error) {
    return res.redirect(
      `${config.frontendUrl}/sign-in?error=${encodeURIComponent(String(error))}`
    );
  }

  try {
    const redirectUri = `${config.backendUrl}/api/auth/callback/google`;
    const { user, token } = await authService.processGoogleCallback(String(code), redirectUri);

    const redirectUrl = new URL(`${config.frontendUrl}/auth/callback`);
    redirectUrl.searchParams.set("token", token);
    redirectUrl.searchParams.set("userId", String(user._id));
    redirectUrl.searchParams.set("email", user.email);
    redirectUrl.searchParams.set("firstName", user.firstName);
    redirectUrl.searchParams.set("lastName", user.lastName);
    if (user.image) redirectUrl.searchParams.set("image", user.image);

    res.redirect(redirectUrl.toString());
  } catch (err: any) {
    console.error("Google OAuth error:", err);
    let errorCode = "server_error";
    if (err.message === "oauth_config") errorCode = "oauth_config";
    if (err.message === "token_exchange") errorCode = "token_exchange";
    
    res.redirect(`${config.frontendUrl}/sign-in?error=${errorCode}`);
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   description: User ID
 *       400:
 *         description: Invalid credentials or validation error
 *       500:
 *         description: Server error
 */
router.post(
  "/login",
  [
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

    const { email, password } = req.body;

    try {
      const { user, token } = await authService.login(email, password);

      res.status(200).json({
        userId: user._id,
        message: "Login successful",
        token: token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error: any) {
      if (error.message === "Invalid Credentials") {
        return res.status(400).json({ message: "Invalid Credentials" });
      }
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

/**
 * @swagger
 * /api/auth/validate-token:
 *   get:
 *     summary: Validate authentication token
 *     description: Validate the current user's authentication token
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   description: User ID
 *       401:
 *         description: Token is invalid or expired
 */
router.get("/validate-token", verifyToken, (req: Request, res: Response) => {
  res.status(200).send({ userId: req.userId });
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: User logout
 *     description: Logout user by clearing authentication cookie
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", (req: Request, res: Response) => {
  res.cookie("session_id", "", {
    ...clearAuthCookieOptions(),
    maxAge: 0,
  });
  res.cookie("auth_token", "", {
    ...clearAuthCookieOptions(),
    maxAge: 0,
  });
  res.send();
});

export default router;
