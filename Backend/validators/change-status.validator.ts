import { Request, Response } from 'express';

export const changeStatusValidator = {
  changeStatus: (req: Request, res: Response, next: any) => {
    if (!req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Task ID is required',
      });
    }
    if (!req.body.status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
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
        message: `Invalid status. Valid statuses are: ${validStatuses.join(
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
        message: 'IDs are required',
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
        message: `Invalid value. Valid values are: ${validatorValues.join(
          ', '
        )}`,
      });
    }

    next();
  },

  // Additional validation can be added here if needed
};
