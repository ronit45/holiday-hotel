import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../../models/user";
import { authService } from "../../services/auth.service";
import { config } from "../../config/env";

describe("AuthService", () => {
  describe("generateToken", () => {
    it("should generate a valid JWT token", () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const token = authService.generateToken(userId);

      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as any;
      expect(decoded.userId).toBe(userId);
    });
  });

  describe("login", () => {
    it("should successfully login with valid credentials", async () => {
      const password = "password123";
      const user = new User({
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        password,
      });
      await user.save();

      const result = await authService.login("test@example.com", password);
      expect(result.user.email).toBe("test@example.com");
      expect(result.token).toBeDefined();
    });

    it("should throw error for non-existent email", async () => {
      await expect(
        authService.login("nonexistent@example.com", "password")
      ).rejects.toThrow("Invalid Credentials");
    });
  });
});
