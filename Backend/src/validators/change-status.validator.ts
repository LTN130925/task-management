import { Request, Response } from 'express';

export const changeStatusValidator = {
  changeStatus: (req: Request, res: Response, next: any) => {
    if (!req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Task ID không tồn tại',
      });
    }
    if (!req.body.status) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không tồn tại',
      });
    }
    const validStatuses = [
      'initial',
      'doing',
      'finish',
      'pending',
      'notFinish',
    ];
    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        message: `Không tìm thấy trạng thái. Trạng thái hợp lý: ${validStatuses.join(
          ', '
        )}`,
      });
    }

    next();
  },

  changeMulti: (req: Request, res: Response, next: any) => {
    const { ids, key, value } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách task ID không tồn tại',
      });
    }
    const validatorValues = [
      'initial',
      'doing',
      'finish',
      'pending',
      'notFinish',
    ];
    if (key === 'status' && !validatorValues.includes(value)) {
      return res.status(400).json({
        success: false,
        message: `Không tìm thấy trạng thái. Trạng thái hợp lý: ${validatorValues.join(
          ', '
        )}`,
      });
    }

    next();
  },

  // Additional validation can be added here if needed
};
