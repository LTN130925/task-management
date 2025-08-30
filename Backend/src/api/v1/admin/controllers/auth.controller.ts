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
      });

      if (account.deleted) {
        return res.status(400).json({
          success: false,
          message: 'Tài khoản không tồn tại',
        });
      }

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

  // [POST] /admin/api/v1/auth/refresh-token
  refreshToken: async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Vui lòng đăng nhập',
        });
      }
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_SECRET as string
      ) as any;

      const account = await Account.findOne({
        _id: decoded.userId,
        deleted: false,
        status: 'active',
      });
      if (!account) {
        return res.status(403).json({
          success: false,
          message: 'Vui lòng đăng nhập',
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
      return res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công',
        accessToken,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  // [POST] /admin/api/v1/auth/logout
  logout: async (req: Request, res: Response) => {
    try {
      return res.status(200).json({
        success: true,
        message: 'Đăng xuất thành công',
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Loi server',
      });
    }
  },
};
