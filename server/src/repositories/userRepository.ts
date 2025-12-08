import User from "../models/User.js";
import { IUser } from "../types/user.js";

export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email }).select("+password");
  }

  async findById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  async findAll(): Promise<IUser[]> {
    return await User.find();
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    return await User.create(userData);
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id: string): Promise<IUser | null> {
    return await User.findByIdAndDelete(id);
  }
}


