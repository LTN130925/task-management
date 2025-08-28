import Account from '../../../../models/accounts.model';
import Role from '../../../../models/roles.model';

import { Response, Request } from 'express';

// helpers
import { pagination } from '../../../../helpers/pagination';

export const controller = {
  index: async (req: Request, res: Response) => {
    try {
      const filter: any = {
        deleted: false,
        status: 'active',
      };

      const { status, keyword } = req.query;

      // filter
      if (status) {
        filter.status = req.query.status;
      }

      // search
      if (keyword) {
        const regex = new RegExp(keyword as string, 'i');
        filter.$or = [{ fullName: regex }, { email: regex }, { phone: regex }];
      }

      // pagination
      const totalAccounts = await Account.countDocuments(filter);
      const helperPagination = pagination(
        {
          page: 1,
          limit: 20,
        },
        totalAccounts,
        req.query
      );

      // sort
      const sort: any = {
        title: 'desc',
      };
      if (req.query.sort_key && req.query.sort_value) {
        sort[req.query.sort_key as string] = req.query.sort_value;
      }

      const accounts: any = await Account.find(filter)
        .lean()
        .sort(sort)
        .skip(helperPagination.skip)
        .limit(helperPagination.limit);

      for (const account of accounts) {
        const role = await Role.findOne({
          _id: account.role_id,
          deleted: false,
        }).lean();
        account.role = role?.name;
      }

      res.status(200).json({
        success: true,
        data: accounts,
        pagination: helperPagination,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },
};
