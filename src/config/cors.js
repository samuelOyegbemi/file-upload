import { URL } from 'url';
import { BadRequestError, getEnv } from '@wbc-nodejs/core';

/**
 * @method corsOptions
 * @returns {null} Null
 * @param {Object} req
 * @param {Function} cb
 */
const corsOptions = (req, cb) => {
  const host = new URL(`${req.protocol}://${req.get('host')}`).hostname;
  const baseDomain = host
    .split('.')
    .filter(hA => hA !== 'api')
    .join('.');
  let whitelistRegEx = [new RegExp(`${baseDomain}(:[0-9]{2,5})?$`, 'i')];
  const options = {
    credentials: true,
    origin: (origin, callback) => {
      let valid;
      if (origin === undefined) {
        origin = host;
      }
      if (getEnv().NODE_ENV !== 'production') {
        // allow any localhost connection if not in production
        whitelistRegEx = [...whitelistRegEx, new RegExp('localhost(:[0-9]{2,5})?$')];
      }
      if (whitelistRegEx && Array.isArray(whitelistRegEx)) {
        valid = whitelistRegEx.some(
          wRE => ({}.toString.call(wRE) === '[object RegExp]' && wRE.test(origin)),
        );
      }
      if (valid) {
        return callback(null, true);
      }
      return callback(new BadRequestError('Not allowed by CORS'));
    },
    exposedHeaders: [
      'Content-Length',
      'Authorization',
      'X-REFRESH-TOKEN',
      'Origin',
      'Content-Type',
    ],
  };
  cb(null, options);
};

export default corsOptions;
