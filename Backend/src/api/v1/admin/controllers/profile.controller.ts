import { Request, Response } from 'express';

import Account from '../../../../models/accounts.model';

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

  // [PATCH] /admin/api/v1/profile/edit
  edit: async (req: Request, res: Response) => {
    try {
      const updatedBy = {
        account_id: req.account._id,
        title: 'Cập nhật thông tin cá nhân',
        updatedAt: new Date(),
      };
      await Account.updateOne(
        { _id: req.account._id },
        {
          ...req.body,
          $push: { updatedBy: updatedBy },
        }
      );
      
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
