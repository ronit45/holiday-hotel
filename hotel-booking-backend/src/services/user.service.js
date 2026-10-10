import User from "../models/user.js";

class UserService {
  getUserById(userId) { return User.findById(userId).select("-password"); }

  async registerUser(userData) {
    if (await User.findOne({ email: userData.email })) throw new Error("User already exists");
    return new User(userData).save();
  }
}

export const userService = new UserService();
