import { Request, Response } from 'express';

// services
import { getProgress } from '../services/getProgress';
import { makeNameUserInfo } from '../services/setNameProgress';

export const controller = {
  index: async (req: Request, res: Response) => {
    try {
      const progress = await getProgress();
      await makeNameUserInfo(progress);

      return res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },
};
