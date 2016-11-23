/**
 * @description - ng-hmr util variable, method
 * @author - bornkiller <hjj491229492@hotmail.com>
 */

'use strict';

import { chain, has, isString, isBoolean, isNumber } from 'lodash';

/**
 * @description - ng-hmr share regular capture reg
 */
export const hmrIdentityCaptureReg = /^<!--\s@ng_hmr_identity\s(.+)\s-->/;

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
 * @description - ng-hmr decorate modal options for component location
 *
 * @param {object} $hmrProvider - ng-hmr service
 * @param {object} options - modal options
 */
export function decorateModalOptions($hmrProvider, options) {
  let {template, controller} = options;
  let [, identity] = hmrIdentityCaptureReg.exec(template);
  let middleTemplate = $hmrProvider.modalStorage.get(identity) || template;

  if (!controller) {
    return {
      ...options,
      template: middleTemplate
    };
  }

  let ctrlIdentity = controller.ng_hmr_identity;
  let nextController = $hmrProvider.modalStorage.get(ctrlIdentity) || controller;
  let hmrTemplateBeacon = `<aside class="${identity} ${ctrlIdentity}" style="display: none">@ng_hmr_identity</aside>`;

  return {
    ...options,
    template: middleTemplate + hmrTemplateBeacon,
    controller: nextController
  };
}

/**
 * @description - active controller vm swap
 *
 * @param {object} prevVM
 * @param {object} nextVM
 */
export function translateNextVM(prevVM, nextVM) {
  let toString = Object.prototype.toString;

  // 假设所有关联属性在constructor内部声明,变量类型不变
  chain(nextVM).keys().value().forEach(key => {
    if (!has(prevVM, key) || toString.call(prevVM[key]) !== toString.call(nextVM[key])) {
      prevVM[key] = nextVM[key];
    }
  });

  chain(Object.getOwnPropertyNames(nextVM.__proto__)).filter(key => key !== 'constructor').value().forEach(key => {
    prevVM.__proto__[key] = nextVM.__proto__[key];
  });
}