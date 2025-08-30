import { Request, Response, NextFunction } from 'express';

import isValidPassword from '../../../../helpers/securePassword';

export const editValidator = {
  edit: (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.title) {
      return res.status(400).json({
        success: false,
        message: 'Tiêu đề không tồn tại',
      });
    }

    next();
  },

  editAccount: (req: Request, res: Response, next: NextFunction) => {
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

    next();
  },
};
