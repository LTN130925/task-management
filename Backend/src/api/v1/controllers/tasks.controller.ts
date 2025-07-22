import { Request, Response } from 'express';

import Task from '../models/tasks.model';

export const controller = {
  // [GET] /api/v1/tasks
  index: async (req: Request, res: Response) => {
    const tasks = await Task.find({
      deleted: false,
    });

    res.status(200).json({
      success: true,
      data: tasks,
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
