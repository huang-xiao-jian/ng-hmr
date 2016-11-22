/**
 * @description - HMR decorate $injector
 * @author - bornkiller <hjj491229492@hotmail.com>
 */
'use strict';

/**
 * @description - decorate $injector instance for HMR
 *
 * @param {object} $provide
 * @param {object} $hmrProvider
 */

export /* @ngInject */ function HMRInjectorDecorator($provide, $hmrProvider) {
  $provide.decorator('$injector', ['$delegate', function ($delegate) {
    let previous = $delegate.get;

    $delegate.get = function (name) {
      let next;

      switch (true) {
        case name.endsWith('Filter'):
          next = proxyHmrFilter(name);
          break;
      }

      return next;
    };

    function proxyHmrFilter(name) {
      let instance = previous(name);

      return (...args) => {
        let proxy = $hmrProvider.pipeStorage.get(name);

        return angular.isFunction(proxy) ? proxy(...args) : instance(...args);
      };
    }

    return $delegate;
  }]);
}