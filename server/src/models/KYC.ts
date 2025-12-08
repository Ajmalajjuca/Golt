import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IKYC extends Document {
  user: Types.ObjectId;
  panNumber: string;
  aadhaarNumber: string;
  status: 'pending' | 'verified' | 'rejected';
  submittedAt: Date;
  verifiedAt?: Date;
  rejectionReason?: string;
}

const kycSchema = new Schema<IKYC>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    panNumber: { type: String, required: true, uppercase: true, trim: true },
    aadhaarNumber: { type: String, required: true, trim: true },
    status: { 
      type: String, 
      enum: ['pending', 'verified', 'rejected'], 
      default: 'pending' 
    },
    submittedAt: { type: Date, default: Date.now },
    verifiedAt: { type: Date },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

const KYC = mongoose.model<IKYC>('KYC', kycSchema);
export default KYC;
