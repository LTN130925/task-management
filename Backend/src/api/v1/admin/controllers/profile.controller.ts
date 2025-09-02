import { Request, Response } from 'express';

export const controller = {
  // [GET] /admin/api/v1/profile
  index: (req: Request, res: Response) => {
    try {
      res.status(200).json({
        success: true,
        data: req.account,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },
};
