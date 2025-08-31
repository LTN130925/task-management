import { Request, Response } from 'express';

// models
import User from '../models/users.model';
import Account from '../models/accounts.model';

export const makeNameUserInfo = {
  getFullNameCreated: async (user: any) => {
    // created by
    if (user.createdBy) {
      const userCreated: any = await Account.findOne({
        _id: user.createdBy.admin_id,
        deleted: false,
      })
        .lean()
        .select('-fullName');
      user.createdBy.fullName = userCreated.fullName;
    }
  },

  getLastFullNameUpdated: async (user: any) => {
    if (user.updatedBy.length > 0) {
      const lastUpdated = user.updatedBy[user.updatedBy.length - 1];
      if (lastUpdated) {
        const userUpdated: any = await Account.findOne({
          _id: lastUpdated.admin_id,
          deleted: false,
        })
          .lean()
          .select('-fullName');
        lastUpdated.fullName = userUpdated.fullName;
      }
    }
  },

  getAllFullNameUpdated: async (user: any) => {
    if (user.updatedBy.length > 0) {
      for (const updatedBy of user.updatedBy) {
        const userUpdated: any = await Account.findOne({
          _id: updatedBy.admin_id,
          deleted: false,
        })
          .lean()
          .select('-fullName');
        updatedBy.fullName = userUpdated.fullName;
      }
    }
  },
};
