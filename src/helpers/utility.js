import { BadRequestError, ConflictError } from '@wbc-nodejs/core';

/**
 * @name getOrderBy
 * @param {string} [order]
 * @param {Object} [options]
 * @param {string} [options.defaultOrder]
 * @param {string} [options.keyValueSeparator]
 * @param {string} [options.entitySeparator]
 * @return {{}|*} Filter result
 */
export const getOrderBy = (order, options = {}) => {
  const {
    defaultOrder = 'created_at:asc',
    keyValueSeparator = ':',
    entitySeparator = ',',
  } = options;
  const acceptableOrder = { DESC: 1, ASC: 1 };
  return (order || defaultOrder)
    .split(entitySeparator)
    .filter(o => !!o.trim())
    .map(o => {
      o = o.trim().split(keyValueSeparator);
      o[1] = o[1] ? o[1].toUpperCase() : 'DESC';
      return o;
    })
    .filter(o => acceptableOrder[o[1]]);
};

/**
 * @name convertToBoolean
 * @param {string|boolean} value
 * @return {boolean} Boolean value
 */
export const convertToBoolean = value => {
  if (!value) {
    return false;
  }
  value = String(value).toLowerCase();
  return !['false', '0', 'no'].includes(value);
};

/**
 * @name camelToSnake
 * @param {string} str
 * @return {*} snake representation
 */
export const camelToSnake = str =>
  str[0].toLowerCase() +
  str.slice(1, str.length).replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

/**
 * @name getValueFromReq
 * @param {*} req
 * @param {string} key
 * @param {string} [defaultVal]
 * @return {*} Where condition
 */
export const getValueFromReq = (req, key, defaultVal) => {
  if (!req || !key) return null;
  return req.params[key] || req.query[key] || defaultVal;
};

/**
 * @name reformatDBError
 * @param {*} e
 * @param {*} [transaction]
 * @return {*} Where condition
 */
export const reformatDBError = async (e, transaction) => {
  if (transaction && typeof transaction.rollback === 'function') {
    await transaction.rollback();
  }
  const err = e.errors && e.errors.length ? e.errors[0] : String(e);
  if (err.validatorKey === 'not_unique') {
    throw new ConflictError(err.message);
  }
  throw new BadRequestError(err.message);
};

/**
 * @name generateRandomString
 * @param {number} length
 * @param {boolean} numberOnly
 * @param {boolean} alphabetOnly
 * @return {string} generated string
 */
export const generateRandomString = (length = 15, numberOnly = false, alphabetOnly = false) => {
  let characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  characters = numberOnly ? '0123456789' : characters;
  characters = alphabetOnly ? 'abcdefghijklmnopqrstuvwxyz' : characters;
  const charactersLength = characters.length;
  let result = characters.charAt(
    Math.floor(
      Math.random() * (numberOnly || alphabetOnly ? charactersLength : charactersLength - 10),
    ),
  );
  for (let i = 1; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
