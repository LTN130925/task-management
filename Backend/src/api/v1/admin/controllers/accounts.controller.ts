import Account from '../../../../models/accounts.model';
import Role from '../../../../models/roles.model';

import { Response, Request } from 'express';
import bcrypt from 'bcrypt';

// helpers
import { pagination } from '../../../../helpers/pagination';

export const controller = {
  // [GET] /admin/api/v1/accounts
  index: async (req: Request, res: Response) => {
    try {
      const filter: any = {
        deleted: false,
        status: 'active',
      };

      // filter
      if (req.query.status) {
        filter.status = req.query.status;
      }

      // search
      if (req.query.keyword) {
        const keyword = req.query.keyword;
        const regex = new RegExp(keyword as string, 'i');
        filter.$or = [{ fullName: regex }, { email: regex }, { phone: regex }];
      }

      // pagination
      const totalAccounts = await Account.countDocuments(filter);
      const helperPagination = pagination(
        {
          page: 1,
          limit: 4,
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
        .select('-password')
        .lean()
        .sort(sort)
        .skip(helperPagination.skip)
        .limit(helperPagination.limit);

      for (const account of accounts) {
        const role = await Role.findOne({
          _id: account.role_id,
          deleted: false,
        })
          .lean()
          .select('title');

        const user = await Account.findOne({
          _id: account.createdBy.account_id,
          deleted: false,
        })
          .lean()
          .select('fullName');

        account.createdBy.accountFullName = user?.fullName;
        account.roleTitle = role?.title;
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

  // [POST] /admin/api/v1/accounts/create
  create: async (req: Request, res: Response) => {
    try {
      const user: any = await Account.findOne({
        email: req.body.email,
        deleted: false,
      });

      if (user) {
        return res.status(400).json({
          success: false,
          message: 'Email đã tồn tại, vui lòng nhập email khác!',
        });
      }
      req.body.password = await bcrypt.hash(req.body.password, 10);
      delete req.body.confirmPassword;

      req.body.createdBy = {
        account_id: req.account?.id,
      };

      const account = new Account(req.body);
      await account.save();

      res.status(201).json({
        success: true,
        message: 'Tài khoản đã được tạo',
        data: account,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  // [PATCH] /admin/api/v1/accounts/edit/:id
  edit: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const account = await Account.findOne({ _id: id, deleted: false });
      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Tài khoản không tìm thấy',
        });
      }
      const updatedBy = {
        account_id: req.account?.id,
        updatedAt: new Date(),
      };

      await Account.updateOne(
        { _id: id },
        {
          ...req.body,
          $push: { updatedBy: updatedBy },
        }
      );
      res.status(200).json({
        success: true,
        message: 'Tài khoản đã được cập nhật',
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },
};
