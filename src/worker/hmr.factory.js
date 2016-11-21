/**
 * @description - HMR implement runtime, target factory
 * @author - bornkiller <hjj491229492@hotmail.com>
 */
'use strict';

/**
 * @description - update view filter
 *
 * @param {function} $injector - Angular DI $injector
 * @param {string} token - register factory token
 * @param {function} implement - angular component next implement
 */
export function hmrThroughFactory($injector, token, implement) {
  let previous = $injector.get(token);
  let next = $injector.invoke(implement);
  let $rootScope = $injector.get('$rootScope');

  angular.extend(previous, next);
  $rootScope.$apply();
}