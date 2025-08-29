import Account from '../../../../models/accounts.model';

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const controller = {
  // [POST] /admin/api/v1/auth/login
  login: async (req: Request, res: Response) => {
    try {
      const account: any = await Account.findOne({
        email: req.body.email,
        deleted: false,
      });

      if (!account) {
        return res.status(400).json({
          success: false,
          message: 'Sai tài khoản hoặc mật khẩu',
        });
      }

      const isMatch = await bcrypt.compare(req.body.password, account.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Sai tài khoản hoặc mật khẩu',
        });
      }

      if (account.status === 'inactive') {
        return res.status(400).json({
          success: false,
          message: 'Tài khoản đã bị khóa, vui lòng liên hệ admin',
        });
      }

      const payload: any = {
        userId: account.id,
        fullName: account.fullName,
        status: account.status,
      };

      const accessToken = jwt.sign(payload, process.env.SECRET_KEY as string, {
        expiresIn: '15m',
      });
      const refreshToken = jwt.sign(
        payload,
        process.env.REFRESH_SECRET as string,
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công',
        accessToken,
        refreshToken,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },
};
