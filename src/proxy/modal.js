/**
 * @description - HMR decorate $injector
 * @author - bornkiller <hjj491229492@hotmail.com>
 */
'use strict';

import { decorateModalOptions } from '../util/hmr.util';

/**
 * @description - decorate $injector instance for HMR
 *
 * @param {object} $provide
 * @param {object} $hmrProvider
 */

export /* @ngInject */ function HMRModalDecorator($provide, $hmrProvider) {
  $provide.decorator('$uibModal', ['$delegate', function ($delegate) {
    let open = $delegate.open;
    let handler = {
      apply(target, context, args) {
        let [options] = args;
        let nextOptions = decorateModalOptions($hmrProvider, options);

        options = {
          ...options,
          ...nextOptions
        };

        let modalInstance = Reflect.apply(target, context, [options]);

        if (options.controller) {
          let identity = options.controller.ng_hmr_identity;

          $hmrProvider.modalStorage.set(`${identity}_instance`, modalInstance);

          options.resolve && $hmrProvider.modalStorage.set(`${identity}_resolve`, options.resolve);
        }

        return modalInstance;
      }
    };

    $delegate.open = new Proxy(open, handler);

    return $delegate;
  }]);
}