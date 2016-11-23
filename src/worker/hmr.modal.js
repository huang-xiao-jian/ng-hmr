/**
 * @description - HMR implement runtime
 * @author - bornkiller <hjj491229492@hotmail.com>
 */
'use strict';

import { hmrIdentityCaptureReg, translateNextVM } from '../util/hmr.util';

/**
 * @description - update view filter
 *
 * @param {function} $injector - Angular DI $injector
 * @param {string} template - next template markup
 */
export function hmrThroughModalTemplate($injector, template) {
  let $compile = $injector.get('$compile');
  let [, identity] = hmrIdentityCaptureReg.exec(template);
  let selector = `.${identity}`;
  let markup = angular.element(selector);

  if (!markup.length) {
    // eslint-disable-next-line no-console, angular/log
    console.log(`[NG_HMR] the ${selector} not active, declare already updated...`);
    return;
  }

  // maybe change in the ui-bootstrap implement
  let target = markup.parent();
  let container = markup.parents('.modal');
  let scope = container.scope();
  let middleware = $compile(template)(scope);

  target.empty().append(middleware).append(markup);
}

/**
 * @description - update view filter
 *
 * @param {function} $injector - Angular DI $injector
 * @param {string} controller - next controller implement
 * @param {object} $uibModalInstance
 */
export function hmrThroughModalController($injector, controller, $uibModalInstance) {
  let identity = controller.ng_hmr_identity;
  let selector = `.${identity}`;
  let markup = angular.element(selector);

  if (!markup.length) {
    // eslint-disable-next-line no-console, angular/log
    console.log(`[NG_HMR] the ${selector} not active, declare already updated...`);
    return;
  }

  // maybe change in the ui-bootstrap implement
  let container = markup.parents('.modal');
  let scope = container.scope();
  let prevVM = scope.vm;
  let nextVM = $injector.instantiate(controller, {$scope: scope, $uibModalInstance: $uibModalInstance});

  translateNextVM(prevVM, nextVM);
  scope.$apply();
}