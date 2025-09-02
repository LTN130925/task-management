import { Request, Response } from 'express';

// services
import { getProgress } from '../services/getProgress';
import { makeNameUserInfo } from '../services/setNameProgress';
import { getDeadline } from '../services/getDeadline';

export const controller = {
  // [GET] /api/v1/admin/dashboards/progress
  progress: async (req: Request, res: Response) => {
    try {
      const progress = await getProgress();
      await makeNameUserInfo(progress);
      const deadline = await getDeadline();

      return res.status(200).json({
        success: true,
        data: progress,
        deadline,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  // [GET] /api/v1/admin/dashboards/system
  system: async (req: Request, res: Response) => {
    
  },
};
