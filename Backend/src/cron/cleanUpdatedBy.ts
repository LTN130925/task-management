import Account from '../models/accounts.model';
import Role from '../models/roles.model';

import cron from 'node-cron';

export const cleanUpdatedByJobAccount = () => {
  cron.schedule('0 2 * * *', async () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    await Account.updateMany(
      {},
      {
        $pull: {
          updatedBy: { updatedAt: { $lt: oneMonthAgo } },
        },
      }
    );

    console.log('Đã xoá updatedBy quá hạn');
  });
};

export const cleanUpdatedByJobRole = () => {
  cron.schedule('0 2 * * *', async () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    await Role.updateMany(
      {},
      {
        $pull: {
          updatedBy: { updatedAt: { $lt: oneMonthAgo } },
        },
      }
    );

    console.log('Đã xoá updatedBy quá hạn');
  });
};
