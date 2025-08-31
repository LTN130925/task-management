import { Request, Response } from 'express';

// models
import User from '../../../../models/users.model';

// helpers
import { pagination } from '../../../../helpers/pagination';

export const controller = {
  index: async (req: Request, res: Response) => {
    try {
      const filter: any = {
        deleted: false,
      };

      // filter
      if (req.query.status) {
        filter.status = req.query.status;
      }

      // search
      if (req.query.keyword) {
        const regex = new RegExp(req.query.keyword as string, 'i');
        filter.$or = [{ fullName: regex }, { email: regex }, { phone: regex }];
      }

      // sort
      const sort: any = {
        fullName: 'asc',
      };
      if (req.query.sort_key && req.query.sort_value) {
        sort[req.query.sort_key as string] = req.query.sort_value as string;
      }

      // pagination
      const totalUsers = await User.countDocuments(filter);
      const helperPagination = pagination(
        {
          page: 1,
          limit: 4,
        },
        totalUsers,
        req.query
      );
    } catch (err) {}
  },
};
