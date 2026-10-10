import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

class AuthService {
  generateToken(userId) { return jwt.sign({ userId }, config.jwt.secret, { expiresIn: "1d" }); }

  async login(email, password) {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) throw new Error("Invalid Credentials");
    return { user, token: this.generateToken(user.id) };
  }
}

export const authService = new AuthService();
