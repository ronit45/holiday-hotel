import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import verifyToken from "../../middleware/auth";
import { config } from "../../config/env";

describe("Auth Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      cookies: {},
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it("should extract token from authorization header (Bearer format) and call next", () => {
    const userId = "testuserid123";
    const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY as string);
    
    mockRequest.headers = {
      authorization: `Bearer ${token}`
    };

    verifyToken(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockRequest.userId).toBe(userId);
    expect(nextFunction).toHaveBeenCalled();
  });

  it("should extract token from auth_token cookie and call next", () => {
    const userId = "testuserid123";
    const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY as string);
    
    mockRequest.cookies = {
      session_id: token
    };

    verifyToken(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockRequest.userId).toBe(userId);
    expect(nextFunction).toHaveBeenCalled();
  });

  it("should return 401 if no token provided", () => {
    verifyToken(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: "unauthorized" });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should return 401 if token is invalid or tampered", () => {
    mockRequest.cookies = {
      session_id: "invalid-or-fake-token"
    };

    verifyToken(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: "unauthorized" });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
