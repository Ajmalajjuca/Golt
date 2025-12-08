// services/userService.ts
import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/userRepository.js";
import { AppError } from "../utils/AppError.js";
import { IUser } from "../types/user.js";

const userRepository = new UserRepository();

export class UserService {
  async getAllUsers() {
    const users = await userRepository.findAll();
    if (!users.length) throw new AppError("No users found", 404);
    return users
  }

  async getUserById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new AppError("User not found", 404);
    return user;
  }

  async createUser(data: Partial<IUser>): Promise<IUser> {
    console.log('data:',data);

    const existingUser = await userRepository.findByEmail(data.email!);
    if (existingUser) throw new AppError("User already exists", 400);

    const user = await userRepository.create(data);
    return user;
  }

  async updateUser(id: string, data: Partial<IUser>) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const updatedUser = await userRepository.update(id, data);
    if (!updatedUser) throw new AppError("User not found", 404);
    return updatedUser;
  }

  async deleteUser(id: string) {
    const deletedUser = await userRepository.delete(id);
    if (!deletedUser) throw new AppError("User not found", 404);
    return deletedUser;
  }
}
