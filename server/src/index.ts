// 모듈 패스를 읽기 위해 module alias 를 사용한다.
require('module-alias/register');
require('source-map-support').install();
require('dotenv').config();

// set default timezone
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import App from '@root/App';
import { loggerFactory } from '@lib/loggerFactory';

dayjs.extend(utc);
dayjs.extend(timezone);

const logger = loggerFactory.createLogger('AppRoot');

const PORT = process.env.PORT || '3001';

const APP = new App();
APP.setup()
  .then((server) => {
    server.listen(PORT, () => {
      logger.info('Express server listening on port ' + PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });
