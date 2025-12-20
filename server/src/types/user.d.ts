import { Types } from 'mongoose';

export type UserRole = 'user' | 'admin';
export type KYCStatus = 'none' | 'pending' | 'verified' | 'rejected';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  googleId?: string;
  phone?: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  isBlocked?: boolean;
  walletBalance: number;
  goldBalance: number;
  silverBalance: number;
  kycStatus: KYCStatus;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
