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
  let targets;
  let $parse = $injector.get('$parse');

  targets = angular.element(`[ng-bind*=${name}]`).map(function () {
    return {
      scope: angular.element(this).scope(),
      target: angular.element(this)
    };
  }).toArray();

  targets.forEach(function ({scope, target}) {
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