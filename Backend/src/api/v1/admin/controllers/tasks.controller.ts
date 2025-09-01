import { Response, Request } from 'express';

// models
import Task from '../../../../models/tasks.model';
import User from '../../../../models/users.model';
import Account from '../../../../models/accounts.model';

// helpers
import { pagination } from '../../../../helpers/pagination';
import { getSubTask } from '../../../../helpers/subTasks';

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
  index: (route: string) => {
    return async (req: Request, res: Response) => {
      try {
        if (!req.role.permissions.includes('tasks_view')) {
          return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền truy cập',
          });
        }
        const filter: any = {
          deleted: route === 'trash' ? true : false,
        };

        // filter by status, userCreatedBy
        const { status, createdBy } = req.query;
        if (status || createdBy) {
          filter.$or = [
            { status: req.query.status },
            { createdBy: req.query.createdBy },
          ];
        }

        // search
        const objectKeyword: any = {
          keyword: '',
        };
        if (req.query.keyword) {
          objectKeyword.keyword = req.query.keyword as string;
          filter.title = new RegExp(objectKeyword.keyword, 'i');
        }

        // sort
        const sort: any = {
          title: 'desc',
        };
        if (req.query.sort_key && req.query.sort_value) {
          sort[req.query.sort_key as string] = req.query.sort_value;
        }

        // pagination
        const totalTasks = await Task.countDocuments(filter);
        const helperPagination = pagination(
          {
            page: 1,
            limit: 4,
          },
          totalTasks,
          req.query
        );

        const tasks: any = await Task.find(filter)
          .lean()
          .sort(sort)
          .skip(helperPagination.skip)
          .limit(helperPagination.limit);

        for (const task of tasks) {
          const account = await Account.findOne({
            _id: task.createdBy,
            deleted: false,
          })
            .lean()
            .select('fullName');
          if (account) {
            task.createdBy = account.fullName;
          } else {
            task.createdBy = 'người dùng tạo';
          }
        }

        res.status(200).json({
          success: true,
          data: tasks,
          totalTasks: totalTasks,
          pagination: helperPagination,
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Lỗi server',
        });
      }
    };
  },

  // [GET] /admin/api/v1/tasks/detail/:id
  detail: (route: string) => {
    return async (req: Request, res: Response) => {
      try {
        if (!req.role.permissions.includes('tasks_view')) {
          return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền truy cập',
          });
        }
        const task = await Task.findOne({
          _id: req.params.id,
          deleted: route === 'trash' ? true : false,
        }).lean();

        if (!task) {
          return res.status(404).json({
            success: false,
            message: 'Không tìm thấy task',
          });
        }
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
    };
  },

  // [GET] /admin/api/v1/tasks/detail/:id/subtasks
  subtasks: async (req: Request, res: Response) => {
    try {
      if (!req.role.permissions.includes('tasks_view')) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập',
        });
      }
      const task: any = await Task.findOne({
        _id: req.params.id,
        deleted: false,
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy task',
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
      if (!req.role.permissions.includes('tasks_create')) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập',
        });
      }
      req.body.createdBy = req.account?.id;
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
      if (!req.role.permissions.includes('tasks_edit')) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập',
        });
      }
      const { id } = req.params;
      const task = await Task.findOne({ _id: id, deleted: false });
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task không tìm thấy',
        });
      }
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
      if (!req.role.permissions.includes('tasks_delete')) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập',
        });
      }
      const { id } = req.params;
      const task = await Task.findOne({ _id: id, deleted: false });
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task không tìm thấy',
        });
      }
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
      if (!req.role.permissions.includes('tasks_edit')) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập',
        });
      }
      const { id } = req.params;
      const { status } = req.body;
      const task = await Task.findOne({ _id: id, deleted: false });
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task không tìm thấy',
        });
      }
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
  // [PATCH] /admin/api/v1/tasks/trash/change-multi
  changeMulti: async (req: Request, res: Response) => {
    try {
      if (!req.role.permissions.includes('tasks_edit')) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập',
        });
      }
      const { ids, key, value } = req.body;
      switch (key) {
        // => TRASH
        case 'restore':
          req.body.key = 'deleted';
          break;
        case 'deleted-permanently':
          await Task.deleteMany({
            _id: { $in: req.body.ids },
            deleted: true,
          });
          return res.status(200).json({
            success: true,
            message: `Task xóa vĩnh viễn ${ids.length} thành công`,
          });
        // END TRASH
        default:
          break;
      }
      await Task.updateMany(
        {
          _id: { $in: ids },
          deleted: key === 'restore' ? true : false,
        },
        { [key]: value }
      );
      return res.status(200).json({
        success: true,
        message: `Task cập nhật trạng thái ${ids.length} thành công`,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  //                                TRASH

  // [DELETE] /admin/api/v1/tasks/trash/delete-permanently/:id
  deletePermanently: async (req: Request, res: Response) => {
    try {
      if (!req.role.permissions.includes('tasks_delete')) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập',
        });
      }
      const { id } = req.params;
      const task = await Task.findOne({ _id: id, deleted: true });
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task không tìm thấy',
        });
      }
      await Task.deleteOne({ _id: id, deleted: true });
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

  // [PATCH] /admin/api/v1/tasks/trash/restore/:id
  restore: async (req: Request, res: Response) => {
    try {
      if (!req.role.permissions.includes('tasks_edit')) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập',
        });
      }
      const { id } = req.params;
      const task = await Task.findOne({ _id: id, deleted: true });
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task không tìm thấy',
        });
      }
      await Task.updateOne({ _id: id, deleted: true }, { deleted: false });
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
};
