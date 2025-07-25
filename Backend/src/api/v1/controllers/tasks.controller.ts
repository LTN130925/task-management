import { Request, Response } from 'express';

// models
import Task from '../models/tasks.model';

// helper
import { pagination } from '../../../../helpers/pagination';

export const controller = {
  // [GET] /api/v1/tasks
  index: async (req: Request, res: Response) => {
    const filter: any = {
      deleted: false,
    };
    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Sort by ...
    const sort: any = {
      title: 'desc',
    };
    if (req.query.sort_key && req.query.sort_value) {
      sort[req.query.sort_key as string] = req.query.sort_value as string;
    }

    // Pagination
    const totalTasks = await Task.countDocuments(filter);
    const helperPagination = pagination(
      {
        page: 1,
        limit: 2,
      },
      totalTasks,
      req.query
    );

    // search
    const objectKeyword: any = {
      keyword: '',
    };
    if (req.query.keyword) {
      objectKeyword.keyword = req.query.keyword as string;
      filter.title = new RegExp(objectKeyword.keyword, 'i');
    }

    const tasks = await Task.find(filter)
      .sort(sort)
      .skip(helperPagination.skip)
      .limit(helperPagination.limit);

    res.status(200).json({
      success: true,
      data: tasks,
      pagination: helperPagination,
      suggestions: tasks.map((task) => task.title),
    });
  },

  // [GET] /api/v1/tasks/detail/:id
  detail: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const task = await Task.findOne({
        _id: id,
        deleted: false,
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task không tìm thấy',
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
  },

  // [PATCH] /api/v1/tasks/change-status/:id
  changeStatus: async (req: Request, res: Response) => {
    try {
      // i have been check validation in change-status.validator.ts
      // so i don't need to check again here
      const { id } = req.params;
      const { status } = req.body;

      const task = await Task.findOne({ _id: id, deleted: false });
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task không tìm thấy',
        });
      }

      await Task.updateOne({ _id: id }, { status: status });
      res.status(200).json({
        success: true,
        message: 'Task cập nhật trạng thái thành công',
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  // [PATCH] /api/v1/tasks/
  changeMultiStatus: async (req: Request, res: Response) => {
    try {
      // if key is deleted then object will be no key value so i will set value to true to mark as deleted
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
        message: 'Task cập nhật trạng thái thành công',
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  // [POST] /api/v1/tasks/create
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

  // [PATCH] /api/v1/tasks/edit/:id
  edit: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const task = await Task.findOne({ _id: id, deleted: false });
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task không tìm thấy',
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

  // [DELETE] /api/v1/tasks/delete/:id
  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const task = await Task.findOne({ _id: id, deleted: false });
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task không tìm thấy',
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
};
