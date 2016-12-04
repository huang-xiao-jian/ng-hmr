/**
 * @description - HMR route directive implement runtime, below method consider
 * - 1. use $compile entire route template way
 * - 2. use $compile original directive related template
 * - the second way maybe better, but more complicated
 * @author - bornkiller <hjj491229492@hotmail.com>
 */
'use strict';

import { kebabCase } from 'lodash';

/**
 * @description - update directive
 *
 * @param {function} $injector - Angular DI $injector
 * @param {string} token - next directive name, which need transform
 */
export function adoptNextDirective($injector, token) {
  let $compile = $injector.get('$compile');
  let $hmr = $injector.get('$hmr');
  let selector = `[${kebabCase(token)}]`;
  let target = angular.element(selector);

  if (!target.length) {
    // eslint-disable-next-line no-console, angular/log
    console.log(`[NG_HMR] the ${selector} not active, declare already updated...`);
    return;
  }

  let page = target.closest('[ui-view]');
  let markup = page.find('.ng-hmr-markup');
  let scope = page.scope();
  let identity = markup.data('templateIdentity');
  let template = $hmr.templateStorage.get(identity);
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

  page.empty().append(middleware).append(markup);
}