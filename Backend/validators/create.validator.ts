import { Request, Response } from 'express';

// edit and create validators
export const createValidator = {
  create: (req: Request, res: Response, next: any) => {
    if (!req.body.title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }

    next();
  }
}