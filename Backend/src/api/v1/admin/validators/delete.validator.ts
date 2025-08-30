import { Request, Response, NextFunction } from 'express';

export const deleteValidator = {
  delete: (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Task ID không tồn tại',
      });
    }

    next();
  },
};
