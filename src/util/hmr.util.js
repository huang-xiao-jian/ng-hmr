/**
 * @description - ng-hmr util variable, method
 * @author - bornkiller <hjj491229492@hotmail.com>
 */

'use strict';

import { keys, has, uniq, isString, isBoolean, isNumber } from 'lodash';

/**
 * @description - ng-hmr share regular capture reg
 */
export const hmrIdentityCaptureReg = /^<!--\s@ng_hmr_identity\s(.+)\s-->/;

/**
 * @description
 * - trigger pipe re-calculation
 * - object or array input will check output each $digest, while primitive not
 *
 * @param {string} primitive
 *
 * @return {string}
 */
export function iterateViewValue(primitive) {
  let result;
  let uuid = Math.random().toString(36).substr(2, 9);

  switch (true) {
    case isString(primitive):
      result = `${primitive}_${uuid}`;
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
  let { template, controller } = options;
  let [, identity] = hmrIdentityCaptureReg.exec(template);
  let middleTemplate = $hmrProvider.modalStorage.get(identity) || template;


  if (!controller) {
    return {
      ...options,
      template: `${middleTemplate} \n <aside class="${identity}" style="display: none">@ng_hmr_identity</aside>`
    };
  }

  let ctrlIdentity = controller.ng_hmr_identity;
  let nextController = $hmrProvider.modalStorage.get(ctrlIdentity) || controller;

  return {
    ...options,
    template: `${middleTemplate} \n <aside class="${identity} ${ctrlIdentity}" style="display: none">@ng_hmr_identity</aside>`,
    controller: nextController
  };
}

/**
 * @description - ng-hmr decorate route options, mark page template / controller identity
 *
 * @param {object} identity - route view template identity
 * @param {function} controller - route view controller
 */
export function decorateRouteTemplate(identity, controller) {
  if (!controller) {
    return `<aside class="ng-hmr-markup ${identity}" data-template-identity="${identity}" style="display: none">@ng_hmr_identity</aside>`;
  } else {
    return `<aside class="ng-hmr-markup ${identity} ${controller.ng_hmr_identity}" data-template-identity="${identity}" data-controller-identity="${controller.ng_hmr_identity}" style="display: none">@ng_hmr_identity</aside>`;
  }
}

/**
 * @description - determine whether ng-hmr should override the field, true for yes ,false for no
 *
 * @param {string} field
 * @param {object} prev
 * @param {object} next
 */
export function shouldFieldUpdate(field, prev, next) {
  let toString = Object.prototype.toString;

  return toString.call(prev) !== toString.call(next);
}

/**
 * @description - active controller vm swap
 *
 * @param {object} prevVM
 * @param {object} nextVM
 * @param {object} $injector
 */
export function translateNextVM(prevVM, nextVM, $injector) {
  // 假设所有关联属性在constructor内部声明,变量类型不变
  let prevVMKeys = keys(prevVM);
  let nextVMKeys = keys(nextVM);
  let VMKeys = uniq([...prevVMKeys, ...nextVMKeys]);

  VMKeys.forEach(field => {
    let prev = prevVM[field];
    let next = nextVM[field];

    switch (true) {
      case has(prevVM, field) && !has(nextVM, field):
        Reflect.deleteProperty(prevVM, field);
        break;
      case $injector.has(field):
        prevVM[field] = nextVM[field];
        break;
      case Reflect.has(nextVM, 'shouldFieldUpdate') && nextVM.shouldFieldUpdate(field, prev, next):
        prevVM[field] = nextVM[field];
        break;
      case shouldFieldUpdate(field, prev, next):
        prevVM[field] = nextVM[field];
        break;
      default:
        // eslint-disable-next-line no-console, angular/log
        console.log(`[NG_HMR] Unable determine should ${nextVM.constructor.name} ==> ${field} update, manual update please define shouldFieldUpdate method`);
    }
  });

  let prevVMMethod = Object.getOwnPropertyNames(prevVM.__proto__).filter(key => key !== 'constructor');
  let nextVMMethod = Object.getOwnPropertyNames(nextVM.__proto__).filter(key => key !== 'constructor');
  let VMMethod = uniq([...prevVMMethod, ...nextVMMethod]);

  VMMethod.forEach((field) => {
    if (Reflect.has(nextVM.__proto__, field)) {
      Reflect.set(prevVM.__proto__, field, Reflect.get(nextVM.__proto__, field));
    } else {
      Reflect.deleteProperty(prevVM.__proto__, field);
    }
  });
}