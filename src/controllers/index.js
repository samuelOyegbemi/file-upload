import { response } from '@wbc-nodejs/core';
/**
 * @name home
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @return {JSON} Welcome message
 */
const home = (req, res) => {
  const message = 'Hi there, everything is fine over here!';
  return response.ok(res, { message }, message);
};

export default { home };
