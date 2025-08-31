import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';

// models
import User from '../../../../models/users.model';
import ForgotPassword from '../../../../models/forgotPassword.model';

// helpers
import sendMail from '../../../../helpers/sendMail';
import { generateRandom } from '../../../../helpers/generateRandom';

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

      const user: any = new User(req.body);
      user.createdBy.user = {
        user_id: user.id,
        role: 'user',
      };
      await user.save();

      res.status(201).json({
        success: true,
        message: 'Đăng ký thành công, vui lòng đăng nhập',
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

      res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công',
        accessToken,
        refreshToken,
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
      res.status(200).json({
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
      const { refreshToken } = req.body;
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
      const payload: any = {
        userId: user.id,
        fullName: user.fullName,
        status: user.status,
      };

      const accessToken = jwt.sign(payload, process.env.SECRET_KEY as string, {
        expiresIn: '15m',
      });
      res.status(200).json({
        success: true,
        accessToken,
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
      const object: any = {
        email: user.email,
        otp: generateRandom.typeNumber(8),
      };
      const forgotPassword = new ForgotPassword(object);
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
        deleted: false,
      });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Người dùng không tồn tại',
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
      res.status(200).json({
        success: true,
        message: 'Xác thực thành công',
        accessToken,
        refreshToken,
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
      const hashPassword = await bcrypt.hash(req.body.password, 10);
      await User.updateOne({ _id: req.user.id }, { password: hashPassword });

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

  // [GET] /api/v1/user/profile
  profile: async (req: Request, res: Response) => {
    try {
      res.status(200).json({
        success: true,
        data: req.user,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  // [PATCH] /api/v1/user/profile/edit
  editProfile: async (req: Request, res: Response) => {
    try {
      await User.updateOne({ _id: req.user.id }, req.body);
      res.status(200).json({
        success: true,
        data: req.user,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  // [GET] /api/v1/user/list
  list: async (req: Request, res: Response) => {
    try {
      const users = await User.find({
        deleted: false,
        status: 'active',
      }).select('fullName email');
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },
};
