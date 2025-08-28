import Role from '../../../../models/roles.model';

import { Request, Response } from 'express';

export const controller = {
  index: async (req: Request, res: Response) => {
    res.send('index');
  },
};
