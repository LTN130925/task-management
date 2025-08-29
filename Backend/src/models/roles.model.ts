import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  title: String,
  description: String,
  permissions: {
    type: Array,
    default: [],
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
      updatedAt: Date,
    },
  ],
  deletedBy: {
    account_id: String,
    deletedAt: Date,
  },
});

const Role = mongoose.model('Role', roleSchema, 'roles');

export default Role;
