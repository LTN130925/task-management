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
        process.env.SECRET_KEY as string,
        (error, decoded) => {
          if (error) {
            return res.status(403).json({
              success: false,
              message: 'Vui lòng đăng nhập',
            });
          }
          return decoded;
        }
      ) as any;

      const account = await Account.findOne({
        _id: decoded.userId,
        status: 'active',
        deleted: false,
      }).select('-password');
      if (!account) {
        return res.status(403).json({
          success: false,
          message: 'Vui lòng đăng nhập',
        });
      }

      const role = await Role.findOne({
        _id: account.role_id,
      });
      if (!role) {
        return res.status(403).json({
          success: false,
          message: 'Vui lòng đăng nhập',
        });
      }

      req.role = role;
      req.account = account;
      next();
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },
};
