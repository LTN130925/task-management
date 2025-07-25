import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import User from '../models/users.model';

export const Auth = {
  requireAuth: async (req: Request, res: Response, next: any) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Vui lòng đăng nhập',
        });
      }

      const decoded = jwt.verify(
        token,
        process.env.SECRET_KEY as string
      ) as any;
      const user = await User.findOne({
        _id: decoded.userId,
        status: 'active',
        deleted: false,
      }).select('-password');
      if (!user) {
        return res.status(403).json({
          success: false,
          message: 'Vui lòng đăng nhập',
        });
      }

      (req as any).user = user;
      next();
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },
};
