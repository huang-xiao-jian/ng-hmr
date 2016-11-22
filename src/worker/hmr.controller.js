/* eslint-disable angular/angularelement */

/**
 * @description - HMR implement runtime
 * @author - bornkiller <hjj491229492@hotmail.com>
 */
'use strict';

import { chain, has } from 'lodash';

/**
 * @description - update view filter
 *
 * @param {function} $injector - Angular DI $injector
 * @param {string} controller - next controller implement
 * @param {string} identity - related template identity
 */
export function hmrThroughController($injector, controller, identity) {
  let selector = `.${identity}`;
  let markup = angular.element(selector);

  if (!markup.length) {
    // eslint-disable-next-line no-console, angular/log
    console.log(`[NG_HMR] the ${controller.ng_hmr_identity} not active, declare already updated...`);
    return;
  }

  let target = markup.parent();
  let scope = target.scope();
  let prevVM = scope.vm;
  let nextVM = $injector.instantiate(controller, {$scope: scope});
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

  scope.$apply();
}