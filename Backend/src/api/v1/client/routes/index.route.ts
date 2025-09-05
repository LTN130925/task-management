import { Application } from 'express';

import taskRoutes from './tasks.route';
import userRoutes from './users.route';
import profileRoutes from './profile.route';
import projectRoutes from './projects.route';

import { Auth } from '../middlewares/auth.middleware';

export default (app: Application) => {
  const version = '/api/v1';

  app.use(`${version}/tasks`, Auth.requireAuth, taskRoutes);

  app.use(`${version}/profile`, Auth.requireAuth, profileRoutes);

  app.use(`${version}/projects`, Auth.requireAuth, projectRoutes);

  app.use(`${version}/user`, userRoutes);
}
