import { Request, Response } from 'express';

// models
import User from '../../../../models/users.model';
import Account from '../../../../models/accounts.model';
import Task from '../../../../models/tasks.model';

// services
import { getProgress } from '../services/getProgress';
import { makeNameUserInfo } from '../services/setNameProgress';
import { getDeadline } from '../services/getDeadline';
import { systemProgress } from '../services/systemProgress';

// helpers
import { pagination } from '../../../../helpers/pagination';

export const controller = {
  // [GET] /api/v1/admin/dashboard/dropdowns
  dropdown: async (req: Request, res: Response) => {
    // dùng làm bảng chọn người dùng lọc thông tin người dùng req.query bên dưới progress dashboard
    try {
      const users = await User.find({
        status: 'active',
        deleted: false,
      })
        .lean()
        .select('_id fullName');
      const accounts = await Account.find({
        status: 'active',
        deleted: false,
      })
        .lean()
        .select('_id fullName');

      return res.status(200).json({
        success: true,
        data: {
          users,
          accounts,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  // [GET] /api/v1/admin/dashboard/progress
  progress: async (req: Request, res: Response) => {
    try {
      const { status, userId, from, to, keyword }: any = req.query;

      const condition: any = {
        deleted: false,
      };

      // Filter by status, user, deadline
      if (status || userId || (from && to)) {
        condition.$or = [
          { status: status },
          { createdBy: userId },
          { timeFinish: { $gte: from, $lte: to } },
        ];
      }

      // Filter by keyword
      if (keyword) {
        condition.$or = [
          { title: new RegExp(keyword, 'i') },
          { content: new RegExp(keyword, 'i') },
        ];
      }

      // Sort by ...
      const sort: any = {
        title: 'desc',
      };
      if (req.query.sort_key && req.query.sort_value) {
        sort[req.query.sort_key as string] = req.query.sort_value as string;
      }

      const totalTasks = await Task.countDocuments(condition);
      const helperPagination = pagination(
        {
          page: 1,
          limit: 4,
        },
        totalTasks,
        req.query
      );

      const progress = await getProgress(condition, sort, helperPagination);
      // => Make name user
      await makeNameUserInfo(progress);

      // Deadline
      const deadline = await getDeadline();

      return res.status(200).json({
        success: true,
        data: progress,
        pagination: helperPagination,
        deadline,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  // [GET] /api/v1/admin/dashboard/system
  system: async (req: Request, res: Response) => {
    try {
      const system = await systemProgress();
      return res.status(200).json({
        success: true,
        data: system,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },
};
