/**
 * @description - HMR implement runtime
 * @author - bornkiller <hjj491229492@hotmail.com>
 */
'use strict';

import { hmrIdentityCaptureReg } from '../util/hmr.util';

/**
 * @description - update view filter
 *
 * @param {function} $injector - Angular DI $injector
 * @param {string} template - next template markup
 */
export function hmrThroughModalTemplate($injector, template) {
  let $compile = $injector.get('$compile');
  let [, identity] = hmrIdentityCaptureReg.exec(template);
  let selector = `.ng-hmr-modal.${identity}`;
  let markup = angular.element(selector);

  if (!markup.length) {
    // eslint-disable-next-line no-console, angular/log
    console.log(`[NG_HMR] the ${selector} not active, declare already updated...`);
    return;
  }

  let scope = markup.scope();
  let target = markup.find('.modal-content');
  let middleware = $compile(template)(scope);

  target.empty().append(middleware);
}