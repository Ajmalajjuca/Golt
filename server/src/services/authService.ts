import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/userRepository.js";
import { AppError } from "../utils/AppError.js";
import { generateToken } from "../utils/jwt.js";

import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const userRepo = new UserRepository();

export class AuthService {
  /**
   * @desc Register a new user
   */
  async register(name: string, email: string, password: string, phone: string) {
    const existingUser = await userRepo.findByEmail(email);
    if (existingUser) throw new AppError("User already exists", 400);

    const user = await userRepo.create({ name, email, password, phone });

    const token = generateToken(user);

    return { user, token };
  }

  /**
   * @desc Authenticate user and return JWT
   */
  async login(email: string, password: string) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new AppError("Invalid email or password", 401);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new AppError("Invalid email or password", 401);

    const token = generateToken(user);

    return { user, token };
  }

  async adminLogin(email: string, password: string) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new AppError("Invalid email", 401);

    const isMatch = await user.comparePassword(password);

    if (!isMatch) throw new AppError("Invalid email or password", 401);

    if (user.role !== "admin") throw new AppError("Unauthorized", 401);

    const token = generateToken(user);

    return { user, token };
  }

  /**
   * @desc Login with Google
   */
  async googleLogin(idToken: string) {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: [
        '6131617190-7797mobvlvi97nq8dusnhl59eeb30jat.apps.googleusercontent.com', // Web Client ID
        '6131617190-olimslmumk2f3jm801fdun6ejp1q5glt.apps.googleusercontent.com', // iOS Client ID
        process.env.GOOGLE_CLIENT_ID || ''
      ].filter(Boolean),
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new AppError('Invalid Google Token', 400);
    }

    const { email, sub: googleId, name, picture } = payload;
    let user = await userRepo.findByEmail(email);

    if (!user) {
      user = await userRepo.create({
        name: name || 'Google User',
        email,
        password: '', 
        googleId,
        avatar: picture,
        role: 'user',
        kycStatus: 'none',
      } as any);
    } else if (!user.googleId) {
        // Optional: Link account if email matches but no googleId
        // For now, we just log them in
    }

    const token = generateToken(user);
    return { user, token };
  }
}
