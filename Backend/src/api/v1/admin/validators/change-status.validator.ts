import { NextFunction, Request, Response } from 'express';

const VALID_KEYS = [
  'deleted',
  'restore',
  'status',
  'deleted-permanently',
] as const;

const VALID_KEYS_ACCOUNTS = ['deleted', 'status'] as const;

const VALID_VALUES_TASKS: Record<string, any[]> = {
  status: ['initial', 'doing', 'finish', 'pending', 'notFinish'],
  deleted: [true],
  restore: [false],
  'deleted-permanently': [true],
};

const VALID_VALUES_PROJECTS: Record<string, any[]> = {
  status: ['active', 'inactive', 'completed', 'archived'],
  deleted: [true],
  restore: [false],
  'deleted-permanently': [true],
};

const VALID_VALUES: Record<string, any[]> = {
  status: ['active', 'inactive'],
  deleted: [true],
  restore: [false],
  'deleted-permanently': [true],
};

export const changeStatusValidator = {
  changeStatus: (req: Request, res: Response, next: NextFunction) => {
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
    if (!VALID_VALUES_TASKS['status'].includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy trạng thái hợp lí!',
      });
    }

    next();
  },

  changeStatusProject: (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Project ID không tồn tại',
      });
    }
    if (!req.body.status) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không tồn tại',
      });
    }
    if (!VALID_VALUES_PROJECTS['status'].includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy trạng thái hợp lí!',
      });
    }

    next();
  },

  changeMulti: (req: Request, res: Response, next: NextFunction) => {
    const { ids, key, value } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách task ID không tồn tại',
      });
    }

    if (!VALID_KEYS.includes(key)) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy trạng thái hợp lí!',
      });
    }

    if (!VALID_VALUES_TASKS[key].includes(value)) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy trạng thái hợp lí!',
      });
    }

    next();
  },

  changeStatusAccount: (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Account ID không tồn tại',
      });
    }
    if (!req.body.status) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy trạng thái hợp lí!',
      });
    }
    if (!VALID_VALUES['status'].includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy trạng thái hợp lí!',
      });
    }

    next();
  },

  changeMultiAccount: (route: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const { ids, key, value } = req.body;

      if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({
          success: false,
          message: 'Danh sách account ID không tồn tại',
        });
      }

      if (route === 'accounts') {
        if (!VALID_KEYS_ACCOUNTS.includes(key)) {
          return res.status(400).json({
            success: false,
            message: 'Không tìm thấy trạng thái hợp lí!',
          });
        }
      } else {
        if (!VALID_KEYS.includes(key)) {
          return res.status(400).json({
            success: false,
            message: 'Không tìm thấy trạng thái hợp lí!',
          });
        }
      }

      if (!VALID_VALUES[key].includes(value)) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy trạng thái hợp lí!',
        });
      }

      next();
    };
  },
};
