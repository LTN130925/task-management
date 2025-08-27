import { Response, Request } from 'express';

// models
import Task from '../../../../models/tasks.model';
import User from '../../../../models/users.model';

// helpers
import { pagination } from '../../../../helpers/pagination';
import { getSubTask } from '../../../../helpers/categoryTaskChild';

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

  // [GET] /admin/api/v1/tasks/detail/:id/subtasks
  subtasks: async (req: Request, res: Response) => {
    try {
      const task: any = await Task.findOne({
        _id: req.params.id,
        deleted: false,
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found',
        });
      }

      const subtasks = await getSubTask(task.id);
      res.status(200).json({
        success: true,
        data: subtasks,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  // [POST] /admin/api/v1/tasks/create
  create: async (req: Request, res: Response) => {
    try {
      const newTask = new Task(req.body);
      await newTask.save();
      res.status(201).json({
        success: true,
        message: 'Task tạo thành công',
        data: newTask,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  // [PATCH] /admin/api/v1/tasks/edit/:id
  edit: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await Task.updateOne({ _id: id }, req.body);
      res.status(200).json({
        success: true,
        message: 'Task cập nhật thành công',
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  // [DELETE] /admin/api/v1/tasks/delete/:id
  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await Task.updateOne({ _id: id }, { deleted: true });
      res.status(200).json({
        success: true,
        message: 'Task xóa thành công',
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  // [PATCH] /admin/api/v1/tasks/change-status/:id
  changeStatus: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await Task.updateOne({ _id: id }, { status: status });
      res.status(200).json({
        success: true,
        message: 'Task cập nhật trạng thái thông',
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  // [PATCH] /admin/api/v1/tasks/change-multi
  changeMulti: async (req: Request, res: Response) => {
    try {
      if (req.body.key === 'deleted') {
        req.body.value = true;
      }
      const { ids, key, value } = req.body;
      await Task.updateMany(
        { _id: { $in: ids }, deleted: false },
        { [key]: value }
      );
      res.status(200).json({
        success: true,
        message: 'Task cập nhật trạng thái thông',
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  //                                TRASH
  // [GET] /admin/api/v1/tasks/trash/index
  trash: async (req: Request, res: Response) => {
    try {
      const find: any = {
        deleted: true,
      };

      // search
      const objectKeyword: any = {
        keyword: '',
      };
      if (req.query.keyword) {
        objectKeyword.keyword = req.query.keyword as string;
        find.title = new RegExp(objectKeyword.keyword, 'i');
      }

      // filter by createdBy
      if (req.query.createdBy) {
        find.createdBy = req.query.createdBy;
      }

      const tasks: any = await Task.find(find).lean();
      for (const task of tasks) {
        const user: any = await User.findOne({
          _id: task.createdBy,
        }).lean();
        task.userCreatedBy = user?.fullName;
      }

      res.status(200).json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },
};
