import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types/user.js';

export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  _id: Types.ObjectId;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    googleId: { type: String, unique: true, sparse: true },
    phone: { 
      type: String, 
      required: false, // Changed to false for Google Auth users
      unique: true,
      sparse: true, // Allow multiple nulls/undefined
      match: [/^\d{10}$/, 'Phone number must be exactly 10 digits']
    },
    password: { type: String, required: false, minlength: 6, select: false }, // Changed to false
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar: { type: String, default: '' },
    isBlocked: { type: Boolean, default: false },
    walletBalance: { type: Number, default: 0 },
    goldBalance: { type: Number, default: 0 },
    kycStatus: { 
      type: String, 
      enum: ['none', 'pending', 'verified', 'rejected'], 
      default: 'none' 
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
  },
  { timestamps: true }
);

userSchema.pre<IUserDocument>('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  if (!this.password) return next();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUserDocument>('User', userSchema);
export default User;
