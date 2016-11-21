/**
 * @description - HMR iterate value which trigger filter digest
 * @author - bornkiller <hjj491229492@hotmail.com>
 */

'use strict';

import { isString, isBoolean, isNumber } from 'lodash';

/**
 * @description - modify primitive value, trigger pipe re-calculation
 *
 * @param {string} primitive
 *
 * @todo - just trigger string update, how to resolve object or array
 *
 * @return {string}
 */
export function iterateViewValue(primitive) {
  let result;
  let uuid = Math.random().toString(36).substr(2, 9);

  switch (true) {
    case isString(primitive):
      result = `${primitive}_hmr_pipe_identity_${uuid}`;
      break;
    case isNumber(primitive):
      result = primitive + 1;
      break;
    case isBoolean(primitive):
      result = !primitive;
      break;
    default:
      result = primitive;
  }

  return result;
}