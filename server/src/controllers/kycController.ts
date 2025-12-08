import { Request, Response, NextFunction } from 'express';
import KYC from '../models/KYC.js';
import User from '../models/User.js';
import { catchAsync } from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';

/**
 * @desc Submit KYC details
 * @route POST /api/kyc/submit
 * @access Private
 */
export const submitKYC = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { panNumber, aadhaarNumber } = req.body;
  const userId = req.user?._id;

  if (!panNumber || !aadhaarNumber) {
    return next(new AppError('Please provide PAN and Aadhaar number', 400));
  }

  // Check if KYC already exists
  const existingKYC = await KYC.findOne({ user: userId });
  if (existingKYC) {
    return next(new AppError('KYC already submitted', 400));
  }

  const kyc = await KYC.create({
    user: userId,
    panNumber,
    aadhaarNumber,
    status: 'pending'
  });

  // Update user status
  await User.findByIdAndUpdate(userId, { kycStatus: 'pending' });

  // MOCK: Auto-verify after 5 seconds (simulating background process)
  setTimeout(async () => {
    try {
      await KYC.findByIdAndUpdate(kyc._id, { 
        status: 'verified', 
        verifiedAt: new Date() 
      });
      await User.findByIdAndUpdate(userId, { kycStatus: 'verified' });
      console.log(`✅ KYC Auto-verified for user ${userId}`);
    } catch (err) {
      console.error('KYC Auto-verify failed', err);
    }
  }, 5000);

  return ApiResponse.success(res, kyc, 'KYC submitted successfully. Verification in progress.');
});

/**
 * @desc Get KYC status
 * @route GET /api/kyc/status
 * @access Private
 */
export const getKYCStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const kyc = await KYC.findOne({ user: userId });

  if (!kyc) {
    return ApiResponse.success(res, { status: 'none' }, 'No KYC found');
  }

  return ApiResponse.success(res, kyc, 'KYC status fetched');
});
