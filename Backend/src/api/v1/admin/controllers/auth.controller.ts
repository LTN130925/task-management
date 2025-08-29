import { Request, Response } from 'express';

export const controller = {
  // [POST] /admin/api/v1/auth/login
  login: async (req: Request, res: Response) => {
    res.send('login');
  },
};
