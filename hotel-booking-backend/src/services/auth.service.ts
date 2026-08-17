import User from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { config } from "../config/env";

export class AuthService {
  generateToken(userId: string): string {
    return jwt.sign({ userId }, config.jwt.secret, {
      expiresIn: "1d",
    });
  }

  async login(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid Credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid Credentials");
    }

    const token = this.generateToken(user.id);
    return { user, token };
  }

  async processGoogleCallback(code: string, redirectUri: string) {
    if (!config.google.clientId || !config.google.clientSecret) {
      throw new Error("oauth_config");
    }

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: String(code),
        client_id: config.google.clientId,
        client_secret: config.google.clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      console.error("Google token error:", tokenData);
      throw new Error("token_exchange");
    }

    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = await userRes.json();

    const email = googleUser.email;
    const name = googleUser.name || "";
    const [firstName, ...lastParts] = name.split(" ");
    const lastName = lastParts.join(" ") || firstName;
    const image = googleUser.picture || undefined;

    let user = await User.findOne({ email });
    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString("hex");
      user = new User({
        email,
        firstName: firstName || "User",
        lastName: lastName || "Google",
        password: randomPassword,
        image,
        emailVerified: true,
      });
      await user.save();
    } else {
      await User.findByIdAndUpdate(user._id, {
        image,
        emailVerified: true,
      });
    }

    const token = this.generateToken(user.id);
    return { user, token };
  }
}

export const authService = new AuthService();
