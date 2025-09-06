import { NextFunction, Request, Response } from 'express';

// edit and edit validators
export const editValidator = {
  edit: (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'ID không tồn tại',
      });
    }
    if (!req.body.title) {
      return res.status(400).json({
        success: false,
        message: 'Tiêu đề không tồn tại',
      });
    }

    next();
  },
};
