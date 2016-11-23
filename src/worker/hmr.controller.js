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
 */
export function hmrThroughController($injector, controller) {
  let identity = controller.ng_hmr_identity;
  let selector = `.${identity}`;
  let markup = angular.element(selector);

  if (!markup.length) {
    // eslint-disable-next-line no-console, angular/log
    console.log(`[NG_HMR] the ${identity} not active, declare already updated...`);
    return;
  }

  // maybe change in the ui-bootstrap implement
  let page = markup.parents('[ui-view]');
  let scope = page.scope();
  let prevVM = scope.vm;
  let nextVM = $injector.instantiate(controller, {$scope: scope});

  translateNextVM(prevVM, nextVM);

  scope.$apply();
}