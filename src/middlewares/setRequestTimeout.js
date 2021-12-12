import { CustomError } from '@wbc-nodejs/core';

/**
 * @name setRequestTimeout
 * @param {number} [timeout=120000]
 * @return {null} Nothing
 */
export default (timeout = 120000) => (req, res, next) => {
  req.setTimeout(timeout, () => {
    req.timedout = true;
    next();
  });
  next();
};
