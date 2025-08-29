import { Application } from 'express';

// routes
import taskRoutes from './tasks.route';
import accountRoutes from './accounts.route';
import roleRoutes from './roles.route';
import authRoutes from './auth.route';

// Config
import systemConfig from '../../../../config/system';

export default (app: Application) => {
  const version = `${systemConfig.prefixAdmin}/api/v1`;

  app.use(`${version}/tasks`, taskRoutes);

  app.use(`${version}/accounts`, accountRoutes);

  app.use(`${version}/roles`, roleRoutes);

  app.use(`${version}/auth`, authRoutes);
};
