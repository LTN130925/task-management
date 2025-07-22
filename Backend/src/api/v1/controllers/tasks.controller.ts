import { Request, Response } from 'express';

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

    const tasks = await Task.find(filter)
      .sort(sort)
      .skip(helperPagination.skip)
      .limit(helperPagination.limit);

    res.status(200).json({
      success: true,
      data: tasks,
      pagination: helperPagination,
      /*
      pagination: {
        totalPage: 5,
        skip: 0,
        limit: 5,
        page: 1,
      }
      */
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
          message: 'Task not found',
        });
      }
      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  },
};
