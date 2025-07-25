import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';

// models
import User from '../models/users.model';

export const controller = {
  // [POST] /api/v1/user/register
  register: async (req: Request, res: Response) => {
    try {
      const exitsUser: any = await User.findOne({ email: req.body.email });
      if (exitsUser) {
        return res.status(409).json({
          success: false,
          message: 'Người dùng này đã tồn tại',
        });
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      req.body.password = hashedPassword;
      delete req.body.confirmPassword;

      const user = new User(req.body);
      await user.save();

      const payload: any = {
        userId: user.id,
        fullName: user.fullName,
        status: user.status,
      };

      const accessToken = jwt.sign(payload, process.env.SECRET_KEY as string, {
        expiresIn: '15m',
      });
      const refreshToken = jwt.sign(
        payload,
        process.env.REFRESH_SECRET as string,
        {
          expiresIn: '7d',
        }
      );

      res
        .cookie('token', accessToken, { httpOnly: true })
        .cookie('refreshToken', refreshToken, { httpOnly: true })
        .status(201)
        .json({
          success: true,
          message: 'Đăng ký thành công',
        });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  // [POST] /api/v1/user/login
  login: async (req: Request, res: Response) => {
    try {
      const user: any = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Tài khoản hoặc mật khẩu không đúng',
        });
      }

      const isMatch = await bcrypt.compare(req.body.password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Tài khoản hoặc mật khẩu không đúng',
        });
      }

      const payload: any = {
        userId: user.id,
        fullName: user.fullName,
        status: user.status,
      };

      const accessToken = jwt.sign(payload, process.env.SECRET_KEY as string, {
        expiresIn: '15m',
      });
      const refreshToken = jwt.sign(
        payload,
        process.env.REFRESH_SECRET as string,
        {
          expiresIn: '7d',
        }
      );

      res
        .cookie('token', accessToken, { httpOnly: true })
        .cookie('refreshToken', refreshToken, { httpOnly: true })
        .status(200)
        .json({
          success: true,
          message: 'Đăng nhập thành công',
        });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },
};
