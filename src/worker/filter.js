/**
 * @description - HMR implement runtime
 * @author - bornkiller <hjj491229492@hotmail.com>
 */
'use strict';

import { first } from 'lodash';
import { iterateViewValue } from '../util/hmr.util';

/**
 * @description - update view filter
 *
 * @param {function} $injector - Angular DI $injector
 * @param {string} name - register filter name
 */
export function adoptNextFilter($injector, name) {
  let $parse = $injector.get('$parse');

  angular.element(`[ng-bind*=${name}]`).map(function () {
    let target = angular.element(this);
    let scope = target.scope();
    let binding = first(target.attr('ng-bind').split('|'));
    let getter = $parse(binding);
    let setter = getter.assign;
    
    let previous = getter(scope);
    let next = iterateViewValue(previous);
  
    setter(scope, next);
    scope.$apply();
    setter(scope, previous);
    scope.$apply();
  });
}