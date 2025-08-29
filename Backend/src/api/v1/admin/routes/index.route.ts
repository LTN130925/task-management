import { Application } from 'express';

// routes
import dashboardRoutes from './dashboards.route';
import taskRoutes from './tasks.route';
import accountRoutes from './accounts.route';
import roleRoutes from './roles.route';
import authRoutes from './auth.route';

// Config
import systemConfig from '../../../../config/system';

// Middlewares
import { Auth } from '../middlewares/auth.middleware';

export default (app: Application) => {
  const version = `${systemConfig.prefixAdmin}/api/v1`;

  app.use(`${version}/dashboard`, Auth.requireAuth, dashboardRoutes);

  app.use(`${version}/tasks`, Auth.requireAuth, taskRoutes);

  app.use(`${version}/accounts`, Auth.requireAuth, accountRoutes);

  app.use(`${version}/roles`, Auth.requireAuth, roleRoutes);

  app.use(`${version}/auth`, authRoutes);
};
