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
        case name.endsWith('Directive'):
          next = proxyHmrDirective(name);
          break;
        default:
          next = proxyHmrInstance(name);
      }

      return next;
    };

    /**
     * @description - use proxy mode for factory / service implement
     *
     * @param {string} name - angular component access token
     *
     * @return {object}
     */
    function proxyHmrInstance(name) {
      // pass through angular private, third-lib instance
      if (name.startsWith('$')) {
        return previous(name);
      }

      let instance = previous(name);
      let handler = {
        get(target, key) {
          let hmrInstance = $hmrProvider.instanceStorage.get(name);

          return hmrInstance ? Reflect.get(hmrInstance, key) : Reflect.get(target, key);
        }
      };

      return new Proxy(instance, handler);
    }

    /**
     * @description - use proxy mode for filter implement
     *
     * @param {string} name - angular component access token
     *
     * @return {function(...[*])}
     */
    function proxyHmrFilter(name) {
      let instance = previous(name);
      let handler = {
        apply(target, context, args) {
          let hmrFilter = $hmrProvider.pipeStorage.get(name);

          return angular.isFunction(hmrFilter) ? Reflect.apply(hmrFilter, context, args) : Reflect.apply(target, context, args);
        }
      };

      return new Proxy(instance, handler);
    }

    /**
     * @description - use proxy mode for directive implement, not sure
     *
     * @param {string} name - angular component access token
     *
     * @return {object}
     */
    function proxyHmrDirective(name) {
      return previous(name);
    }

    return $delegate;
  }]);
}