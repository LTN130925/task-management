import mongoose from 'mongoose';

export interface IRole extends mongoose.Document {
  title: string;
  description: string;
  permissions: string[];
  deleted: boolean;
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
