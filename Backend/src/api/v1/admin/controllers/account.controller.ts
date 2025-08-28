import { Response, Request } from 'express';

export const controller = {
  index: (req: Request, res: Response) => {
    res.status(200).json({ message: 'Hello Admin' });
  },
};
