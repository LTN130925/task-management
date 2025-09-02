import { Request, Response } from 'express';

import Task from '../../../../models/tasks.model';
import User from '../../../../models/users.model';

export const controller = {
  index: async (req: Request, res: Response) => {
    try {
      const tasks = await Task.find({ deleted: false }).lean();

    } catch (error) {}
  },
};
