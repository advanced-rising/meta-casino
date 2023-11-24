import { loggerFactory } from '@lib/loggerFactory';
import initModules from '@root/initModules';
import { Router } from 'express';

const logger = loggerFactory.createLogger('Router');

export const createExpressRouters = async (modules: Awaited<ReturnType<typeof initModules>>) => {
  const {} = modules;
  const expressRouter = Router();
  expressRouter.use((req, res, next) => {
    console.log(`Http Request URL: ${req.method}:${req.url} from ${req.ip}`);
    console.log('요청 내용: ', {
      method: req.method,
      url: req.url,
      body: req.body,
      query: req.query,
    });
    next();
  });
  expressRouter.get('', (req, res, next) => {
    return res.send('This is API server');
  });
  expressRouter.use((req, res, next) => {
    logger.info(`Http Request URL: ${req.url} from ${req.ip}`);
    next();
  });

  return expressRouter;
};
