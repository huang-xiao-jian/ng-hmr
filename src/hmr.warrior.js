/**
 * @description - HMR bridge manager util method
 * @author - bornkiller <hjj491229492@hotmail.com>
 */
'use strict';

import { isString, isFunction } from 'lodash';

const captureModalIdentity = /^<!--\s@hmr_modal_identity\s(.+)\s-->/;

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