import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';

// models
import User from '../models/users.model';
import ForgotPassword from '../models/forgotPassword.model';

// helper
import sendMail from '../../../helpers/sendMail';

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

      if (user.status === 'inactive') {
        return res.status(403).json({
          success: false,
          message: 'Tài khoản của bạn đã bị khóa',
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

  // [POST] /api/v1/user/logout
  logout: async (req: Request, res: Response) => {
    try {
      res.clearCookie('token').clearCookie('refreshToken').status(200).json({
        success: true,
        message: 'Đăng xuất thành công',
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  // [POST] /api/v1/user/refresh-token
  refreshToken: async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Vui lòng đăng nhập',
        });
      }
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_SECRET as string
      ) as any;

      const user = await User.findOne({
        _id: decoded.userId,
        deleted: false,
        status: 'active',
      });
      if (!user) {
        return res.status(403).json({
          success: false,
          message: 'Vui lòng đăng nhập',
        });
      }

      const payload = {
        userId: user.id,
        fullName: user.fullName,
        status: user.status,
      };
      const newAccessToken = jwt.sign(
        payload,
        process.env.SECRET_KEY as string,
        { expiresIn: '15m' }
      );

      res.cookie('token', newAccessToken, { httpOnly: true }).status(200).json({
        success: true,
        message: 'Token mới được cập',
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server hoặc token không hợp lệ',
      });
    }
  },

  // [POST] /api/v1/user/password/forgot
  forgotPassword: async (req: Request, res: Response) => {
    try {
      const user: any = await User.findOne({
        email: req.body.email,
        deleted: false,
      });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Người dùng không tồn tại',
        });
      }
      const forgotPassword = new ForgotPassword({ email: user.email });
      await forgotPassword.save();
      // gửi otp đến email người dùng

      const objectSendMail: any = {
        from: `từ cửa hàng thực phẩm <${process.env.EMAIL_USER}>`,
        to: forgotPassword.email,
        subject: 'chuyển mã OTP',
        text: 'chuyển mã OTP để đổi mật khẩu',
        html: `<h1>chuyển mã OTP để đổi mật khẩu</h1>
        <p>mã OTP: <b>${forgotPassword.otp}</b></p>
        <p>vui lòng không chia sẻ mã OTP cho người khác</p>
        <p>mã OTP sẽ hết hạn sau 2 phút</p>`,
      };

      sendMail(objectSendMail);

      res.status(200).json({
        success: true,
        message: 'Đã gửi ma OTP vào email người dùng',
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  // [POST] /api/v1/user/password/otp
  otpPassword: async (req: Request, res: Response) => {
    try {
      const result = await ForgotPassword.findOne({
        email: req.body.email,
        otp: req.body.otp,
      });
      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Mã OTP không tồn tại',
        });
      }
      const user = await User.findOne({
        email: result.email,
        status: 'active',
        deleted: false,
      });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Tài khoản người dùng đã bị khóa',
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
          message: 'Xác thực thành công',
        });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  // [POST] /api/v1/user/password/reset
  resetPassword: async (req: Request, res: Response) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res
          .status(401)
          .json({ success: false, message: 'Vui lòng đăng nhập' });
      }
      const decoded = jwt.verify(
        token,
        process.env.SECRET_KEY as string
      ) as any;
      const user = await User.findOne({
        _id: decoded.userId,
        status: 'active',
        deleted: false,
      });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: 'Tài khoản người dùng bị khóa' });
      }
      const hashPassword = await bcrypt.hash(req.body.password, 10);
      await User.updateOne({ _id: user.id }, { password: hashPassword });

      res
        .status(200)
        .json({ success: true, message: 'Đổi mật khẩu thành công' });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },
};
