import { Response, Request } from 'express';

// models
import Task from '../../../../models/tasks.model';
import User from '../../../../models/users.model';

// helpers
import { pagination } from '../../../../helpers/pagination';

export const controller = {
  // [GET] /admin/api/v1/dropdowns/users
  dropdowns: async (req: Request, res: Response) => {
    try {
      const users = await User.find({ deleted: false }).select('_id fullName');
      res.json(users);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  // [GET] /admin/api/v1/tasks
  index: async (req: Request, res: Response) => {
    try {
      const find: any = {
        deleted: false,
      };

      // filter by status, userCreatedBy
      if (req.query.status) {
        find.status = req.query.status;
      }
      if (req.query.createdBy) {
        find.createdBy = req.query.createdBy;
      }

      // search
      const objectKeyword: any = {
        keyword: '',
      };
      if (req.query.keyword) {
        objectKeyword.keyword = req.query.keyword as string;
        find.title = new RegExp(objectKeyword.keyword, 'i');
      }

      // sort
      const sort: any = {
        title: 'desc',
      };
      if (req.query.sort_key && req.query.sort_value) {
        sort[req.query.sort_key as string] = req.query.sort_value;
      }

      // pagination
      const totalTasks = await Task.countDocuments(find);
      const helperPagination = pagination(
        {
          page: 1,
          limit: 20,
        },
        totalTasks,
        req.query
      );

      const tasks: any = await Task.find(find)
        .lean()
        .sort(sort)
        .skip(helperPagination.skip)
        .limit(helperPagination.limit);

      for (const task of tasks) {
        const user = await User.findOne({
          _id: task.createdBy,
          status: 'active',
          deleted: false,
        }).lean();
        task.userCreatedBy = user?.fullName;
      }

      res.status(200).json({
        success: true,
        data: tasks,
        pagination: helperPagination,
        suggestions: tasks.map((task: any) => task.title),
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  // [GET] /admin/api/v1/tasks/detail/:id
  detail: async (req: Request, res: Response) => {
    try {
      const task = await Task.findOne({
        _id: req.params.id,
        deleted: false,
      }).lean();
      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },
};
