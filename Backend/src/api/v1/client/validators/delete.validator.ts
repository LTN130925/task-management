import { NextFunction, Request, Response } from 'express';

// edit and delete validators
export const deleteValidator = {
  delete: (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'ID không tồn tại',
      });
    }

    next();
  },
};
