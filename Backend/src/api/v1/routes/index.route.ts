import { Application } from 'express';

import taskRoutes from './tasks.route';
import userRoutes from './users.route';

import { Auth } from '../middlewares/auth.middleware';

export default (app: Application) => {
  const version = '/api/v1';

  app.use(`${version}/tasks`, Auth.requireAuth, taskRoutes);

  app.use(`${version}/user`, userRoutes);
}
