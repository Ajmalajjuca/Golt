import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { IUser } from "../types/user.js";
import { config } from "../config/config.js";

/**
 * Generate a JWT token
 * @param id - user ID or unique identifier
 * @returns signed JWT string
 */
export const generateToken = (user:IUser): string => {

  const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };



  // Use type assertion to string or number since .env always returns string
  const options: SignOptions = {
    expiresIn: (config.jwt.expire as `${number}${"ms" | "s" | "m" | "h" | "d" | "w" | "y"}` | number ) || "7d",
  };

  return jwt.sign(payload, config.jwt.secret, options);
};



/**
 * Verify a JWT token
 * @param token - JWT string to verify
 * @returns decoded payload or throws error if invalid
 */
export const verifyToken = (token: string): string | JwtPayload => {
  const secret = config.jwt.expire;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.verify(token, secret);
};
