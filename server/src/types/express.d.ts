import { Request } from 'express';
import { IUser } from './user.js';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
