import mongoose from "mongoose";
import { Request, Response } from "express";
import User from "../../models/user";
import requireAdmin from "../../middleware/requireAdmin";

describe("RequireAdmin Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {
      userId: new mongoose.Types.ObjectId().toString()
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it("should return 403 Access denied if user does not exist", async () => {
    await requireAdmin(mockRequest as Request, mockResponse as Response, nextFunction);
    
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: "Access denied" });
  });

  it("should return 403 Access denied if user is not an admin", async () => {
    const user = new User({
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      password: "password123",
      role: "user"
    });
    await user.save();
    
    mockRequest.userId = user._id.toString();

    await requireAdmin(mockRequest as Request, mockResponse as Response, nextFunction);
    
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: "Access denied" });
  });

  it("should call next() if user is an admin", async () => {
    const admin = new User({
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      password: "password123",
      role: "admin"
    });
    await admin.save();

    mockRequest.userId = admin._id.toString();

    await requireAdmin(mockRequest as Request, mockResponse as Response, nextFunction);
    
    expect(nextFunction).toHaveBeenCalled();
  });
});
