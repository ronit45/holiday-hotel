import User from "../models/user";

export class UserService {
  async getUserById(userId: string) {
    return await User.findById(userId).select("-password");
  }

  async getAllUsers(limit: number = 200) {
    return await User.find()
      .select("email firstName lastName role isActive totalBookings totalSpent createdAt")
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async updateUserRole(targetUserId: string, newRole: string, requesterUserId: string) {
    if (targetUserId === requesterUserId && newRole !== "admin") {
      throw new Error("Cannot demote your own admin role");
    }

    return await User.findByIdAndUpdate(
      targetUserId,
      { role: newRole, updatedAt: new Date() },
      { new: true }
    ).select("-password");
  }

  async registerUser(userData: any) {
    let user = await User.findOne({ email: userData.email });
    if (user) {
      throw new Error("User already exists");
    }

    user = new User(userData);
    await user.save();
    return user;
  }
}

export const userService = new UserService();
