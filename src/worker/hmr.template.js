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
export function hmrThroughTemplate($injector, template) {
  let $compile = $injector.get('$compile');
  let [, identity] = hmrIdentityCaptureReg.exec(template);
  let selector = `.${identity}`;
  let markup = angular.element(selector);

  if (!markup.length) {
    // eslint-disable-next-line no-console, angular/log
    console.log(`[NG_HMR] the ${selector} not active, declare already updated...`);
    return;
  }

  let target = markup.parent();
  let page = markup.parents('[ui-view]');
  let scope = page.scope();
  let middleware = $compile(template)(scope);
  let subViews = middleware.find('[ui-view]');
  let subViewSelectors;

  if (subViews.length) {
    subViewSelectors = subViews.map(function () {
      return '[ui-view=' + angular.element(this).attr('ui-view') + ']';
    }).toArray();

    middleware = subViewSelectors.reduce(function (prev, selector) {
      prev.find(selector).replaceWith(angular.element(selector));

      return prev;
    }, middleware);
  }

  target.empty().append(middleware).append(markup);
}