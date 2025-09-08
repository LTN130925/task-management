import { NextFunction, Request, Response } from 'express';

import isValidPassword from '../../../../helpers/isPassword';

export const userValidator = {
  register: (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.fullName) {
      return res.status(400).json({
        success: false,
        message: 'Tên người dùng không tồn tại',
      });
    }
    if (!req.body.email) {
      return res.status(400).json({
        success: false,
        message: 'Email không tồn tại',
      });
    }
    if (!isValidPassword(req.body.password)) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu không hợp lệ',
      });
    }
    if (!req.body.password) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu không tồn tại',
      });
    }
    if (!req.body.confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu xác thực không tồn tại',
      });
    }
    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mật khóa không khớp',
      });
    }

    next();
  },

  login: (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.email) {
      return res.status(400).json({
        success: false,
        message: 'Email không tồn tại',
      });
    }
    if (!req.body.password) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu không tồn tại',
      });
    }

    next();
  },

  forgotPassword: (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.email) {
      return res.status(400).json({
        success: false,
        message: 'Email không tồn tại',
      });
    }

    next();
  },

  otpPassword: (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.email) {
      return res.status(400).json({
        success: false,
        message: 'Email không tồn tại',
      });
    }
    if (!req.body.otp) {
      return res.status(400).json({
        success: false,
        message: 'Mã OTP không tồn tại',
      });
    }

    next();
  },

  resetPassword: (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.password) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới không tồn tại',
      });
    }
    if (!isValidPassword(req.body.password)) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu hợp lệ',
      });
    }
    if (!req.body.confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu xác thực không tồn tại',
      });
    }
    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu không khớp',
      });
    }

    next();
  },
};
