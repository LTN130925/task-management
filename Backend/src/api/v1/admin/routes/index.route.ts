import { Application } from 'express';

// routes
import taskRoutes from './tasks.route';
import accountRoutes from './account.route';

// Config
import systemConfig from '../../../../config/system';

export default (app: Application) => {
  const version = `${systemConfig.prefixAdmin}/api/v1`;

  // app.use(`${version}/dashboard`, require('./dashboard.route'));

  app.use(`${version}/tasks`, taskRoutes);

  app.use(`${version}/accounts`, accountRoutes);

  // app.use(`${version}/users`, require('./users.route'));
}