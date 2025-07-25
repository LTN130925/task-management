import { Application } from 'express';

import taskRoutes from './tasks.route';
import userRoutes from './users.route';

export default (app: Application) => {
  const version = '/api/v1';

  app.use(`${version}/tasks`, taskRoutes);

  app.use(`${version}/user`, userRoutes);
}
