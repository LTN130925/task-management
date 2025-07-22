import { Application } from 'express';

import taskRoutes from './tasks.route';

export default (app: Application) => {
  const version = '/api/v1';

  app.use(`${version}/tasks`, taskRoutes);
}
