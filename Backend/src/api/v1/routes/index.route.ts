import { Application } from 'express';

import taskRoutes from './tasks.route';

export default (app: Application) => {
  app.use('/api/v1/tasks', taskRoutes);
}
