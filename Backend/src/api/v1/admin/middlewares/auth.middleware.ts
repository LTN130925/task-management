import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import Account from '../../../../models/accounts.model';
import Role from '../../../../models/roles.model';

export const Auth = {
  requireAuth: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Vui lòng đăng nhập',
        });
      }

      const decoded = jwt.verify(
        token,
        process.env.SECRET_KEY as string
      ) as any;

      const user = await Account.findOne({
        _id: decoded.userId,
        status: 'active',
        deleted: false,
      }).select('-password');
      if (!user) {
        return res.status(403).json({
          success: false,
          message: 'Vui lòng đăng nhập',
        });
      }

      const role = await Role.findOne({
        _id: user.role_id,
      });
      if (!role) {
        return res.status(403).json({
          success: false,
          message: 'Vui lòng đăng nhập',
        });
      }

      req.role = role;
      req.account = user;
      next();
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },
};
