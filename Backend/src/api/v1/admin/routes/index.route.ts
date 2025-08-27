import { Application } from 'express';

// routes
import taskRoutes from './tasks.route';

// Config
import systemConfig from '../../../../config/system';

export default (app: Application) => {
  const version = `${systemConfig.prefixAdmin}/api/v1`;

  // app.use(`${version}/dashboard`, require('./dashboard.route'));

  app.use(`${version}/tasks`, taskRoutes);

  // app.use(`${version}/accounts`, require('./accounts.route'));

  // app.use(`${version}/users`, require('./users.route'));
}