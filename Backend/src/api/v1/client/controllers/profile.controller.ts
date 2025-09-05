import { Request, Response } from 'express';

import User from '../../../../models/users.model';

export const controller = {
  // [GET] /api/v1/profile
  profile: async (req: Request, res: Response) => {
    try {
      res.status(200).json({
        success: true,
        data: req.user,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  // [PATCH] /api/v1/profile/edit
  editProfile: async (req: Request, res: Response) => {
    try {
      await User.updateOne({ _id: req.user._id }, req.body);
      res.status(200).json({
        success: true,
        data: req.user,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },
};
