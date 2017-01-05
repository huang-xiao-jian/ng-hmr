/**
 * @description - HMR template implement
 * @author - bornkiller <hjj491229492@hotmail.com>
 */

'use strict';

import { hmrIdentityCaptureReg } from '../util/hmr.util';

/**
 * @description - update view template
 *
 * @param {function} $injector - Angular DI $injector
 * @param {string} template - next route template markup
 */
export function adoptNextTemplate($injector, template) {
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
  let page = markup.closest('[ui-view]');
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

  // trigger model binding
  middleware.scope().$apply();
  target.empty().append(middleware).append(markup);
}

/**
 * @description - update modal template
 *
 * @param {function} $injector - Angular DI $injector
 * @param {string} template - next modal template markup
 */
export function adoptNextModalTemplate($injector, template) {
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
  let container = markup.closest('.modal');
  let scope = container.scope();
  let middleware = $compile(template)(scope);
  
  target.empty().append(middleware).append(markup);
}