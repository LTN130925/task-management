import { NextFunction, Request, Response } from 'express';

// edit and create validators
export const createValidator = {
  create: (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.title) {
      return res.status(400).json({
        success: false,
        message: 'Tiêu đề không tồn tại',
      });
    }

    next();
  }
}