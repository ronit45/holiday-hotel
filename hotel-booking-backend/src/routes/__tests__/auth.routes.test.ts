import request from "supertest";
import mongoose from "mongoose";
import app from "../../app";
import User from "../../models/user";

describe("Auth & User Routes", () => {
  const testUser = {
    email: "integration@example.com",
    password: "password123",
    firstName: "Integration",
    lastName: "User",
  };

  describe("POST /api/users/register", () => {
    it("should register a new user and set auth cookie", async () => {
      const res = await request(app)
        .post("/api/users/register")
        .send(testUser);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("User registered OK");
    });

    it("should return 400 for duplicate email", async () => {
      await request(app).post("/api/users/register").send(testUser);
      const res = await request(app).post("/api/users/register").send(testUser);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("User already exists");
    });

    it("should return 400 for missing required fields", async () => {
      const res = await request(app)
        .post("/api/users/register")
        .send({
          email: "another@example.com",
          // missing password, etc
        });

      expect(res.status).toBe(400);
      expect(Array.isArray(res.body.message)).toBe(true); // Validations fail
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login user and set auth cookie", async () => {
      await request(app).post("/api/users/register").send(testUser);
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.userId).toBeDefined();
      expect(res.body.token).toBeDefined();
    });

    it("should return 400 for wrong password", async () => {
      await request(app).post("/api/users/register").send(testUser);
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: "wrongpassword",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid Credentials");
    });
  });

  describe("GET /api/auth/validate-token", () => {
    it("should return 200 and userId if token is valid", async () => {
      // First login
      await request(app).post("/api/users/register").send(testUser);
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: testUser.email, password: testUser.password });
      
      const token = loginRes.body.token;

      // Then validate
      const validateRes = await request(app)
        .get("/api/auth/validate-token")
        .set("Authorization", `Bearer ${token}`);

      expect(validateRes.status).toBe(200);
      expect(validateRes.body.userId).toBeDefined();
    });

    it("should return 401 if token is missing", async () => {
      const validateRes = await request(app).get("/api/auth/validate-token");
      
      expect(validateRes.status).toBe(401);
      expect(validateRes.body.message).toBe("unauthorized");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should clear the auth cookie", async () => {
      const res = await request(app).post("/api/auth/logout");
      
      expect(res.status).toBe(200);
      const cookies = res.header["set-cookie"];
      expect(cookies[0]).toMatch(/session_id=;/); // empty string or expires in past
    });
  });
});
