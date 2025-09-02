import User from '../../../../models/users.model';
import Account from '../../../../models/accounts.model';

export const makeNameUserInfo = async (progress: any) => {
  for (const item of progress) {
    const account: any = await Account.findOne({
      _id: item.userId,
      deleted: false,
    })
      .lean()
      .select('fullName email phone');
    if (account) {
      account.role = 'admin';
      item.createdBy = account;
    } else {
      const user: any = await User.findOne({
        _id: item.userId,
        deleted: false,
      })
        .lean()
        .select('fullName email phone');
      if (user) {
        user.role = 'user';
        item.createdBy = user;
      }
    }
  }
};
