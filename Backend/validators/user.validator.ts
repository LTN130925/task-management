import { Request, Response } from 'express';

export const userValidator = {
  register: (req: Request, res: Response, next: any) => {
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

  login: (req: Request, res: Response, next: any) => {
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
};
