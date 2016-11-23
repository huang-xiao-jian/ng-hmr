/* eslint-disable angular/angularelement */

/**
 * @description - HMR implement runtime
 * @author - bornkiller <hjj491229492@hotmail.com>
 */
'use strict';

import { translateNextVM } from '../util/hmr.util';

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

  translateNextVM(prevVM, nextVM);
  scope.$apply();
}