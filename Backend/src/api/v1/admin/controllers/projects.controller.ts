import { Response, Request } from 'express';

// models
import Project from '../../../../models/projects.model';
import Account from '../../../../models/accounts.model';

// helpers
import { pagination } from '../../../../helpers/pagination';

export const controller = {
  // [GET] /admin/api/v1/projects/dropdowns/admins
  dropdowns: async (req: Request, res: Response) => {
    // dùng làm bảng chọn người dùng lọc thông tin người dùng req.query bên dưới project index
    try {
      if (!req.role.permissions.includes('projects_view')) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập',
        });
      }
      const admins = await Account.find({ deleted: false, status: 'active' })
        .lean()
        .select('_id fullName');
      return res.status(200).json({
        success: true,
        data: admins,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },

  // [GET] /admin/api/v1/projects
  index: (route: string) => {
    return async (req: Request, res: Response) => {
      try {
        // if (!req.role.permissions.includes('projects_view')) {
        //   return res.status(403).json({
        //     success: false,
        //     message: 'Bạn không có quyền truy cập',
        //   });
        // }
        const filter: any = {
          deleted: route === 'trash' ? true : false,
        };

        // filter by status, userCreatedBy, deadline
        const { status, createdById, from, to } = req.query;
        if (status || createdById || (from && to)) {
          filter.$or = [
            { status: status },
            { 'createdBy.createdById': createdById },
            {
              deadline: {
                $gte: from,
                $lte: to,
              },
            },
          ];
        }

        // search
        if (req.query.keyword) {
          const regex = new RegExp(req.query.keyword as string, 'i');
          filter.$or = [{ title: regex }, { description: regex }];
        }

        // sort
        const sort: any = {
          title: 'desc',
        };
        if (req.query.sort_key && req.query.sort_value) {
          sort[req.query.sort_key as string] = req.query.sort_value;
        }

        // pagination
        const totalProjects = await Project.countDocuments(filter);
        const helperPagination = pagination(
          {
            page: 1,
            limit: 4,
          },
          totalProjects,
          req.query
        );

        console.log(filter);

        const projects: any = await Project.find(filter)
          .lean()
          .sort(sort)
          .skip(helperPagination.skip)
          .limit(helperPagination.limit);

        for (const project of projects) {
          const account = await Account.findOne({
            _id: project.createdBy.createdById,
            deleted: false,
          })
            .lean()
            .select('fullName');
          project.createdBy.fullName = account
            ? account.fullName
            : 'không tìm thấy';
        }

        res.status(200).json({
          success: true,
          data: projects,
          pagination: helperPagination,
          totalProjects,
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Lỗi server',
        });
      }
    };
  },

  // // [GET] /admin/api/v1/projects/detail/:id
  // detail: (route: string) => {
  //   return async (req: Request, res: Response) => {
  //     try {
  //       if (!req.role.permissions.includes('projects_view')) {
  //         return res.status(403).json({
  //           success: false,
  //           message: 'Bạn không có quyền truy cập',
  //         });
  //       }
  //       const project = await Project.findOne({
  //         _id: req.params.id,
  //         deleted: route === 'trash' ? true : false,
  //       }).lean();

  //       if (!project) {
  //         return res.status(404).json({
  //           success: false,
  //           message: 'Không tìm thấy project',
  //         });
  //       }
  //       res.status(200).json({
  //         success: true,
  //         data: project,
  //       });
  //     } catch (error) {
  //       return res.status(500).json({
  //         success: false,
  //         message: 'Lỗi server',
  //       });
  //     }
  //   };
  // },

  // [POST] /admin/api/v1/projects/create
  // create: async (req: Request, res: Response) => {
  //   try {
  //     // if (!req.role.permissions.includes('projects_create')) {
  //     //   return res.status(403).json({
  //     //     success: false,
  //     //     message: 'Bạn không có quyền truy cập',
  //     //   });
  //     // }
  //     req.body.createdBy = {
  //       createdById: req.account._id,
  //     };
  //     const newProject = new Project(req.body);
  //     await newProject.save();

  //     res.status(201).json({
  //       success: true,
  //       message: 'Project tạo thành công',
  //       data: newProject,
  //     });
  //   } catch (err) {
  //     return res.status(500).json({
  //       success: false,
  //       message: 'Lỗi server',
  //     });
  //   }
  // },

  // // [PATCH] /admin/api/v1/projects/edit/:id
  // edit: async (req: Request, res: Response) => {
  //   try {
  //     if (!req.role.permissions.includes('projects_edit')) {
  //       return res.status(403).json({
  //         success: false,
  //         message: 'Bạn không có quyền truy cập',
  //       });
  //     }
  //     const { id } = req.params;
  //     const project = await Project.findOne({ _id: id, deleted: false });
  //     if (!project) {
  //       return res.status(404).json({
  //         success: false,
  //         message: 'project không tìm thấy',
  //       });
  //     }
  //     const updatedBy = {
  //       updatedById: req.account._id,
  //       updatedAt: Date.now(),
  //     };
  //     await Project.updateOne(
  //       { _id: id },
  //       { ...req.body, $push: { updatedBy: updatedBy } }
  //     );
  //     res.status(200).json({
  //       success: true,
  //       message: 'Task cập nhật thành công',
  //     });
  //   } catch (err) {
  //     return res.status(500).json({
  //       success: false,
  //       message: 'Lỗi server',
  //     });
  //   }
  // },

  //   // [DELETE] /admin/api/v1/projects/delete/:id
  //   delete: async (req: Request, res: Response) => {
  //     try {
  //       if (!req.role.permissions.includes('projects_delete')) {
  //         return res.status(403).json({
  //           success: false,
  //           message: 'Bạn không có quyền truy cập',
  //         });
  //       }
  //       const { id } = req.params;
  //       const task = await Project.findOne({ _id: id, deleted: false });
  //       if (!task) {
  //         return res.status(404).json({
  //           success: false,
  //           message: 'Task không tìm thấy',
  //         });
  //       }
  //       await Task.updateOne({ _id: id }, { deleted: true });
  //       res.status(200).json({
  //         success: true,
  //         message: 'Task xóa thành công',
  //       });
  //     } catch (err) {
  //       return res.status(500).json({
  //         success: false,
  //         message: 'Lỗi server',
  //       });
  //     }
  //   },

  //   // [PATCH] /admin/api/v1/projects/change-status/:id
  //   changeStatus: async (req: Request, res: Response) => {
  //     try {
  //       if (!req.role.permissions.includes('projects_edit')) {
  //         return res.status(403).json({
  //           success: false,
  //           message: 'Bạn không có quyền truy cập',
  //         });
  //       }
  //       const { id } = req.params;
  //       const { status } = req.body;
  //       const task = await Task.findOne({ _id: id, deleted: false });
  //       if (!task) {
  //         return res.status(404).json({
  //           success: false,
  //           message: 'Task không tìm thấy',
  //         });
  //       }
  //       await Task.updateOne({ _id: id }, { status: status });
  //       res.status(200).json({
  //         success: true,
  //         message: 'Task cập nhật trạng thái thông',
  //       });
  //     } catch (err) {
  //       return res.status(500).json({
  //         success: false,
  //         message: 'Lỗi server',
  //       });
  //     }
  //   },

  //   // [PATCH] /admin/api/v1/projects/change-multi
  //   // [PATCH] /admin/api/v1/projects/trash/change-multi
  //   changeMulti: async (req: Request, res: Response) => {
  //     try {
  //       if (!req.role.permissions.includes('projects_edit')) {
  //         return res.status(403).json({
  //           success: false,
  //           message: 'Bạn không có quyền truy cập',
  //         });
  //       }
  //       const { ids, key, value } = req.body;
  //       switch (key) {
  //         // => TRASH
  //         case 'restore':
  //           req.body.key = 'deleted';
  //           break;
  //         case 'deleted-permanently':
  //           await Task.deleteMany({
  //             _id: { $in: req.body.ids },
  //             deleted: true,
  //           });
  //           return res.status(200).json({
  //             success: true,
  //             message: `Task xóa vĩnh viễn ${ids.length} thành công`,
  //           });
  //         // END TRASH
  //         default:
  //           break;
  //       }
  //       await Task.updateMany(
  //         {
  //           _id: { $in: ids },
  //           deleted: key === 'restore' ? true : false,
  //         },
  //         { [key]: value }
  //       );
  //       return res.status(200).json({
  //         success: true,
  //         message: `Task cập nhật trạng thái ${ids.length} thành công`,
  //       });
  //     } catch (err) {
  //       return res.status(500).json({
  //         success: false,
  //         message: 'Lỗi server',
  //       });
  //     }
  //   },

  //   //                                TRASH

  //   // [DELETE] /admin/api/v1/projects/trash/delete-permanently/:id
  //   deletePermanently: async (req: Request, res: Response) => {
  //     try {
  //       if (!req.role.permissions.includes('projects_delete')) {
  //         return res.status(403).json({
  //           success: false,
  //           message: 'Bạn không có quyền truy cập',
  //         });
  //       }
  //       const { id } = req.params;
  //       const task = await Task.findOne({ _id: id, deleted: true });
  //       if (!task) {
  //         return res.status(404).json({
  //           success: false,
  //           message: 'Task không tìm thấy',
  //         });
  //       }
  //       await Task.deleteOne({ _id: id, deleted: true });
  //       res.status(200).json({
  //         success: true,
  //         message: 'Task xóa thành công',
  //       });
  //     } catch (err) {
  //       return res.status(500).json({
  //         success: false,
  //         message: 'Lỗi server',
  //       });
  //     }
  //   },

  //   // [PATCH] /admin/api/v1/projects/trash/restore/:id
  //   restore: async (req: Request, res: Response) => {
  //     try {
  //       if (!req.role.permissions.includes('projects_edit')) {
  //         return res.status(403).json({
  //           success: false,
  //           message: 'Bạn không có quyền truy cập',
  //         });
  //       }
  //       const { id } = req.params;
  //       const task = await Task.findOne({ _id: id, deleted: true });
  //       if (!task) {
  //         return res.status(404).json({
  //           success: false,
  //           message: 'Task không tìm thấy',
  //         });
  //       }
  //       await Task.updateOne({ _id: id, deleted: true }, { deleted: false });
  //       res.status(200).json({
  //         success: true,
  //         message: 'Task cập nhật thành công',
  //       });
  //     } catch (err) {
  //       return res.status(500).json({
  //         success: false,
  //         message: 'Lỗi server',
  //       });
  //     }
  //   },
};
