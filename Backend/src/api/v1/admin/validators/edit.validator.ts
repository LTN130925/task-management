import { Request, Response, NextFunction } from 'express';

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
};