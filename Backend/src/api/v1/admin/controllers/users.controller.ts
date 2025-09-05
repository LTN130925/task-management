import { Request, Response } from 'express';
import bcrypt from 'bcrypt';

// models
import User from '../../../../models/users.model';

// helpers
import { pagination } from '../../../../helpers/pagination';
import { makeNameUserInfo } from '../services/setNameUser';

export const controller = {
  // [GET] /admin/api/v1/users
  // [GET] /admin/api/v1/users/trash
  index: (route: string) => {
    return async (req: Request, res: Response) => {
      try {
        if (!req.role.permissions.includes('users_view')) {
          return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền truy cập',
          });
        }
        const filter: any = {
          deleted: route === 'trash' ? true : false,
        };

        // filter
        if (req.query.status) {
          filter.status = req.query.status;
        }

        // search
        if (req.query.keyword) {
          const regex = new RegExp(req.query.keyword as string, 'i');
          filter.$or = [
            { fullName: regex },
            { email: regex },
            { phone: regex },
          ];
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
          .select('-password');

        if (route === 'trash') {
          for (const user of users) {
            const userDeleted = await User.findOne({
              _id: user.deletedBy.admin_id,
              deleted: false,
            })
              .lean()
              .select('fullName');

            user.deletedBy.fullName = userDeleted
              ? userDeleted.fullName
              : 'không';
          }
        } else {
          for (const user of users) {
            // created by
            await makeNameUserInfo.getFullNameCreated(user);

            // updated by
            await makeNameUserInfo.getLastFullNameUpdated(user);
          }
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
    };
  },

  // [GET] /admin/api/v1/users/detail/:id
  // [GET] /admin/api/v1/users/trash/detail/:id
  detail: (route: string) => {
    return async (req: Request, res: Response) => {
      try {
        if (!req.role.permissions.includes('users_view')) {
          return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền truy cập',
          });
        }
        const filter: any = {
          _id: req.params.id,
          deleted: route === 'trash' ? true : false,
        };
        const user: any = await User.findOne(filter)
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
    };
  },

  // [POST] /admin/api/v1/users/create
  create: async (req: Request, res: Response) => {
    try {
      if (!req.role.permissions.includes('users_create')) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập',
        });
      }
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
        admin_id: req.account._id,
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
      if (!req.role.permissions.includes('users_edit')) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập',
        });
      }
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
        admin_id: req.account._id,
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

  // [DELETE] /admin/api/v1/users/delete/:id
  delete: async (req: Request, res: Response) => {
    try {
      if (!req.role.permissions.includes('users_delete')) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập',
        });
      }
      const { id } = req.params;
      const user = await User.findOne({
        _id: id,
        deleted: false,
      });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Tài khoản không tìm thấy',
        });
      }
      const deletedBy = {
        admin_id: req.account._id,
        deletedAt: new Date(),
      };
      await User.updateOne(
        { _id: id },
        {
          deleted: true,
          deletedBy: deletedBy,
        }
      );
      res.status(200).json({
        success: true,
        message: 'Tài khoản đã được xóa',
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  // [PATCH] /admin/api/v1/users/change-status/:id
  changeStatus: async (req: Request, res: Response) => {
    try {
      if (!req.role.permissions.includes('users_edit')) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập',
        });
      }
      const { id } = req.params;
      const { status } = req.body;
      const user = await User.findOne({
        _id: id,
        deleted: true,
      });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Tài khoản không tìm thấy',
        });
      }
      const updatedBy = {
        title: 'cập nhật trạng thái người dùng',
        admin_id: req.account._id,
        updatedAt: new Date(),
      };
      await User.updateOne(
        { _id: id },
        {
          status: status,
          $push: { updatedBy: updatedBy },
        }
      );
      res.status(200).json({
        success: true,
        message: 'Cập nhật trạng thái người dùng thành công',
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  // [PATCH] /admin/api/v1/users/change-multi
  // [PATCH] /admin/api/v1/users/trash/change-multi
  changeMulti: async (req: Request, res: Response) => {
    try {
      if (!req.role.permissions.includes('users_edit')) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập',
        });
      }
      const { ids, key, value } = req.body;
      let updatedBy: any;
      let updateValue: any;
      switch (key) {
        case 'deleted':
          updateValue = {
            [key]: value,
            deletedBy: {
              admin_id: req.account._id,
              deletedAt: new Date(),
            },
          };
          break;
        case 'status':
          updatedBy = {
            title: 'cập nhật trạng thái người dùng',
            admin_id: req.account._id,
            updatedAt: new Date(),
          };
          updateValue = {
            [key]: value,
            $push: { updatedBy: updatedBy },
          };
          break;
        case 'restore':
          updatedBy = {
            title: 'khôi phục tài khoản người dùng',
            admin_id: req.account._id,
            updatedAt: new Date(),
          };
          updateValue = {
            deleted: value,
            $push: { updatedBy: updatedBy },
          };
          break;
        case 'delete-permanently':
          await User.deleteMany({ _id: { $in: ids }, deleted: true });
          return res.status(200).json({
            success: true,
            message: `Xóa vĩnh viễn ${ids.length} người dùng thành công`,
          });
        default:
          break;
      }
      await User.updateMany(
        {
          _id: { $in: ids },
          deleted: req.body.key === 'restore' ? true : false,
        },
        updateValue
      );
      res.status(200).json({
        success: true,
        message: `Cập nhật ${ids.length} người dùng thành công`,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  //                        TRASH
  // [DELETE] /admin/api/v1/users/trash/delete-permanently/:id
  deletePermanently: async (req: Request, res: Response) => {
    try {
      if (!req.role.permissions.includes('users_delete')) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập',
        });
      }
      const { id } = req.params;
      const user = await User.findOne({ _id: id, deleted: true });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Tài khoản không tìm thấy',
        });
      }

      await User.deleteOne({ _id: id });
      res.status(200).json({
        success: true,
        message: 'Xóa vĩnh viễn người dùng thành công',
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  // [PATCH] /admin/api/v1/users/trash/restore/:id
  restore: async (req: Request, res: Response) => {
    try {
      if (!req.role.permissions.includes('users_edit')) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập',
        });
      }
      const { id } = req.params;
      const user = await User.findOne({ _id: id, deleted: true });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Tài khoản không tìm thấy',
        });
      }
      const updatedBy = {
        title: 'khôi phục tài khoản người dùng',
        admin_id: req.account._id,
        updatedAt: new Date(),
      };

      await User.updateOne(
        { _id: id },
        {
          deleted: false,
          $push: { updatedBy: updatedBy },
        }
      );
      res.status(200).json({
        success: true,
        message: 'Khôi phục tài khoản người dùng thành công',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },
};
