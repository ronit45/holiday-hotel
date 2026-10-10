
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

const verifyToken = (req, res, next) => {
  // Check for token in Authorization header first (for axios interceptor)
  const authHeader = req.headers.authorization;
  let token;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else {
    // Fallback to session cookie
    token = req.cookies["session_id"];
  }

  if (!token) {
    return res.status(401).json({ message: "unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "unauthorized" });
  }
};

export default verifyToken;
