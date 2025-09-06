import { Request, Response } from 'express';

// models
import Project from '../../../../models/projects.model';
import Account from '../../../../models/accounts.model';

// helper
import { pagination } from '../../../../helpers/pagination';

export const controller = {
  // [GET] /api/v1/tasks
  index: async (req: Request, res: Response) => {
    const filter: any = {
      deleted: false,
      members: req.user._id,
    };

    // Filter by status
    const { status, deadline } = req.query;
    if (status || deadline) {
      filter.$or = [
        { status: status },
        {
          deadline: {
            $gte: deadline,
            $lte: deadline,
          },
        },
      ];
    }

    // Sort by ...
    const sort: any = {
      title: 'desc',
    };
    if (req.query.sort_key && req.query.sort_value) {
      sort[req.query.sort_key as string] = req.query.sort_value as string;
    }

    // Pagination
    const totalProject = await Project.countDocuments(filter);
    const helperPagination = pagination(
      {
        page: 1,
        limit: 4,
      },
      totalProject,
      req.query
    );

    // search
    if (req.query.keyword) {
      const keyword = req.query.keyword as string;
      const regex = new RegExp(keyword, 'i');
      filter.$or = [{ title: regex }, { description: regex }];
    }

    const projects: any = await Project.find(filter)
      .lean()
      .select('-updatedBy -deletedBy')
      .sort(sort)
      .skip(helperPagination.skip)
      .limit(helperPagination.limit);

    for (const project of projects) {
      const account = await Account.findOne({
        _id: project.createdBy?.createdById,
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
    });
  },

  // // [GET] /api/v1/tasks/detail/:id
  // detail: async (req: Request, res: Response) => {
  //   try {
  //     const { id } = req.params;
  //     const task: any = await Task.findOne({
  //       _id: id,
  //       deleted: false,
  //     });

  //     if (!task) {
  //       return res.status(404).json({
  //         success: false,
  //         message: 'Task không tìm thấy',
  //       });
  //     }

  //     res.status(200).json({
  //       success: true,
  //       data: task,
  //     });
  //   } catch (error) {
  //     return res.status(500).json({
  //       success: false,
  //       message: 'Lỗi server',
  //     });
  //   }
  // },
};
