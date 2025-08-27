import { Response, Request } from 'express';

export const controller = {
  // [GET] /admin/api/v1/tasks
  index: async (req: Request, res: Response) => {
    res.send('ola');
  },
};
