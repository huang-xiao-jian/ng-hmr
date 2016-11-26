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
    let instantiate = $delegate.instantiate;
    
    /**
     * @description - wrap original locate / get method
     *
     * @param {string} name - instance token
     *
     * @return {*}
     */
    function delegateInjectorLocate(name) {
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
    }
    
    /**
     * @description
     * - wrap original instantiate method
     * - maybe the better way for controller HMR, modal controller not working, I don't know why
     * - maybe the worse way while controller duplex bind
     * - leave it here, change in the future
     *
     * @see = https://docs.angularjs.org/api/auto/service/$injector
     */
    function delegateInjectorInstantiate(...args) {
      return Reflect.apply(instantiate, $delegate, args);
    }
    
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
          let hmrFilter = $hmrProvider.instanceStorage.get(name);
          
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
      // skip explicit angular, ui-router, ui-bootstrap internal directive
      if (/^(?:ng|uib?)/.test(name)) {
        return previous(name);
      }
      
      // forbidden the same name for directive
      let [$delegate] = previous(name);
      let whiteList = ['script', 'style', 'form', 'input', 'select', 'textarea', 'required', 'a'];
      
      // skip explicit angular internal directive
      if (whiteList.includes($delegate.name) && $delegate.restrict === 'E') {
        return previous(name);
      }
      
      let handler = {
        get(target, key) {
          let hmrInstance = $hmrProvider.instanceStorage.get(name);
          
          return hmrInstance ? Reflect.get(hmrInstance, key) : Reflect.get(target, key);
        }
      };
      
      return [new Proxy($delegate, handler)];
    }
    
    return {
      ...$delegate,
      get: delegateInjectorLocate,
      instantiate: delegateInjectorInstantiate
    };
  }]);
}