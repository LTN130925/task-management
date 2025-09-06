import { NextFunction, Request, Response } from 'express';

// edit and detail validators
export const detailValidator = {
  detail: (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'ID không tồn tại',
      });
    }

    next();
  },
};
