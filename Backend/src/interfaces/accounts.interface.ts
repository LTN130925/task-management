import mongoose from 'mongoose';

export interface IAccount extends mongoose.Document {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  avatar: string;
  status: string;
  deleted: boolean;
  deletedAt: Date;
  role_id: string;
  createdBy: {
    account_id: string;
    createdAt: Date;
  };
  updatedBy: {
    account_id: string;
    title: string;
    updatedAt: Date;
  }[];
  deletedBy: {
    account_id: string;
    deletedAt: Date;
  };
}
