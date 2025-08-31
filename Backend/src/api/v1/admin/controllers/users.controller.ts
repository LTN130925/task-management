import { Request, Response } from 'express';
import bcrypt from 'bcrypt';

// models
import User from '../../../../models/users.model';

// helpers
import { pagination } from '../../../../helpers/pagination';
import { makeNameUserInfo } from '../../../../helpers/makeNameUserInfo';

export const controller = {
  // [GET] /admin/api/v1/users
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

      const users: any = await User.find(filter)
        .lean()
        .sort(sort)
        .skip(helperPagination.skip)
        .limit(helperPagination.limit)
        .select('-password -deletedBy');

      for (const user of users) {
        // created by
        await makeNameUserInfo.getFullNameCreated(user);

        // updated by
        await makeNameUserInfo.getLastFullNameUpdated(user);
      }

      res.status(200).json({
        success: true,
        data: users,
        pagination: helperPagination,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  // [GET] /admin/api/v1/users/detail/:id
  detail: async (req: Request, res: Response) => {
    try {
      const user: any = await User.findOne({
        _id: req.params.id,
        deleted: false,
      })
        .lean()
        .select('-password -deletedBy');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Người dùng không tồn tại',
        });
      }
      // created by
      await makeNameUserInfo.getFullNameCreated(user);

      // updated by
      await makeNameUserInfo.getAllFullNameUpdated(user);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  // [POST] /admin/api/v1/users/create
  create: async (req: Request, res: Response) => {
    try {
      const emailExits = await User.findOne({
        email: req.body.email,
        deleted: false,
      }).lean();

      if (emailExits) {
        return res.status(400).json({
          success: false,
          message: 'Email đã tồn tại, vui lòng nhập email khác!',
        });
      }
      req.body.createdBy = {
        admin_id: req.account?.id,
      };
      delete req.body.confirmPassword;
      req.body.password = await bcrypt.hash(req.body.password, 10);

      const user = new User(req.body);
      await user.save();

      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  // [PATCH] /admin/api/v1/users/edit/:id
  edit: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = await User.findOne({
        _id: id,
        deleted: false,
      }).lean();
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Người dùng không tồn tại',
        });
      }

      const updatedBy = {
        title: 'cập nhật thông tin người dùng',
        admin_id: req.account?.id,
        updatedAt: new Date(),
      };
      await User.updateOne(
        { _id: id, deleted: false },
        {
          ...req.body,
          $push: { updatedBy: updatedBy },
        }
      );
      res.status(200).json({
        success: true,
        message: 'Cập nhật người dùng thành công',
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },
};
