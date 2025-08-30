import Role from '../../../../models/roles.model';
import Account from '../../../../models/accounts.model';

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

      const roles: any = await Role.find(filter)
        .lean()
        .sort(sort)
        .skip(helperPagination.skip)
        .limit(helperPagination.limit);

      for (const role of roles) {
        // tạo tên người tạo
        const account = await Account.findOne({
          _id: role.createdBy.account_id,
          deleted: false,
        })
          .lean()
          .select('fullName');
        role.createdBy.accountFullName = account?.fullName;

        // tạo tên người cập nhật
        const lastUpdatedBy = role.updatedBy[role.updatedBy.length - 1];
        if (lastUpdatedBy) {
          const userUpdated = await Account.findOne({
            _id: lastUpdatedBy.account_id,
            deleted: false,
          })
            .lean()
            .select('fullName');
          lastUpdatedBy.accountFullName = userUpdated?.fullName;
        }
      }

      res.status(200).json({
        success: true,
        data: roles,
        pagination: helperPagination,
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
      req.body.createdBy = {
        account_id: req.account?.id,
      };
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

  // [PATCH] /admin/api/v1/roles/edit/:id
  edit: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const role = await Role.findOne({ _id: id, deleted: false });
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy role',
        });
      }

      const updatedBy = {
        account_id: req.account?.id,
        title: 'Cập nhật nhóm quyền',
        updatedAt: new Date(),
      };
      await Role.updateOne(
        { _id: id },
        {
          ...req.body,
          $push: { updatedBy: updatedBy },
        }
      );
      res.status(200).json({
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

  // [DELETE] /admin/api/v1/roles/delete/:id
  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const role = await Role.findOne({ _id: id, deleted: false });
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy role',
        });
      }
      const deletedBy = {
        account_id: req.account?.id,
        deletedAt: new Date(),
      }
      await Role.updateOne(
        { _id: id },
        {
          deleted: true,
          deletedBy: deletedBy,
        }
      );
      res.status(200).json({
        success: true,
        message: 'Xóa role thành công',
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  // [DELETE] /admin/api/v1/roles/delete-multiple
  deleteMultiple: async (req: Request, res: Response) => {
    try {
      const { ids } = req.body;
      const deletedBy = {
        account_id: req.account?.id,
        deletedAt: new Date(),
      }
      await Role.updateMany(
        { _id: { $in: ids }, deleted: false },
        {
          deleted: true,
          deletedBy: deletedBy,
        }
      );
      res.status(200).json({
        success: true,
        message: 'Xóa các role thành công',
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },
};
