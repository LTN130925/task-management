import Role from '../../../../models/roles.model';

import { Request, Response } from 'express';

// helpers
import { pagination } from '../../../../helpers/pagination';

export const controller = {
  // [GET] /admin/api/v1/roles
  index: async (req: Request, res: Response) => {
    try {
      const filter: any = {
        deleted: false,
      };

      // search
      if (req.query.keyword) {
        const regex = new RegExp(req.query.keyword as string, 'i');
        filter.name = regex;
      }

      // sort
      const sort: any = {
        name: 'asc',
      };
      if (req.query.sort_key && req.query.sort_value) {
        sort[req.query.sort_key as string] = req.query.sort_value as string;
      }

      // pagination
      const totalRoles = await Role.countDocuments(filter);
      const helperPagination = pagination(
        {
          page: 1,
          limit: 4,
        },
        totalRoles,
        req.query
      );

      const roles = await Role.find(filter)
        .lean()
        .sort(sort)
        .skip(helperPagination.skip)
        .limit(helperPagination.limit);
        
      res.status(200).json({
        success: true,
        data: roles,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  // [POST] /admin/api/v1/roles/create
  create: async (req: Request, res: Response) => {
    try {
      const role = new Role(req.body);
      await role.save();
      res.status(201).json({
        success: true,
        data: role,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },
};
