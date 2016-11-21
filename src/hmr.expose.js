/* eslint-disable angular/window-service*/
'use strict';

/**
 * @description - expose $hmr instance into window scope
 *
 * @param {object} $injector
 * @param {object} $hmr
 */
export /* @ngInject */ function HMRExpose($injector, $hmr) {
  window.$injector = $injector;
  window.$hmr = $hmr;
}