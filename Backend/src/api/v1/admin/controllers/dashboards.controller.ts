import { Request, Response } from 'express';

export const controller = {
  index: (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Dashboard',
      data: {
        user: req.account,
        role: req.role,
      },
    });
  },
};
