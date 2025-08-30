import mongoose from 'mongoose';

import { IAccount } from '../interfaces/accounts.interface';

const accountSchema = new mongoose.Schema<IAccount>({
  fullName: String,
  email: String,
  password: String,
  phone: String,
  avatar: String,
  role_id: String,
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    account_id: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  updatedBy: [
    {
      account_id: String,
      title: String,
      updatedAt: Date,
    },
  ],
  deletedBy: {
    account_id: String,
    deletedAt: Date,
  },
});

const Account = mongoose.model<IAccount>('Account', accountSchema, 'accounts');

export default Account;
