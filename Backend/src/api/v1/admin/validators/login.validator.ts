import { NextFunction, Request, Response } from 'express';

export const loginValidator = {
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
};
