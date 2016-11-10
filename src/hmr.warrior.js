/**
 * @description - HMR bridge manager util method
 * @author - bornkiller <hjj491229492@hotmail.com>
 */
'use strict';

const captureModalIdentity = /^<!--\s@hmr_modal_identity\s(.+)\s-->/;

import { isString, isFunction, isBoolean, isNumber } from 'lodash';

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

/**
 * @description - analyze modal template / controller identity
 *
 * @param {string} modal
 * @return {string}
 */
export function analyzeModalIdentity(modal) {
  if (isString(modal)) {
    let match = captureModalIdentity.exec(modal);
    return match[1];
  } else if (isFunction(modal)) {
    return modal.hmr_modal_identity;
  } else {
    return 'ng_hmr_no_operation';
  }
}

/**
 * @description - modal root selector
 *
 * @param {string} additionalClassName
 * @return {string}
 */
export function huntRootModalSelector(additionalClassName) {
  return `.${additionalClassName}`;
}

/**
 * @description - modal template selector
 *
 * @param {string} additionalClassName
 * @return {string}
 */
export function huntChildModalSelector(additionalClassName) {
  return `.${additionalClassName} .modal-content`;
}

/**
 * @description - resolve modal identity into modal window class
 *
 * @param {string} windowClass
 * @param {Array.<string>} modalIdentity
 *
 * @return {string}
 */
export function resolveModalClass(windowClass, modalIdentity) {
  let nextIdentityList;
  let modalIdentityList = modalIdentity.filter(item => isString(item)).join(' ');

  if (isString(windowClass)) {
    nextIdentityList = `${windowClass} ${modalIdentityList}`;
  } else {
    nextIdentityList = `${modalIdentityList}`;
  }

  return {windowClass: nextIdentityList};
}