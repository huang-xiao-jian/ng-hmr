/**
 * @description - HMR decorate $injector
 * @author - bornkiller <hjj491229492@hotmail.com>
 */
'use strict';

import { hmrIdentityCaptureReg } from './util/hmr.util';

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
        let {template, controller, windowClass} = options;
        let [, identity] = hmrIdentityCaptureReg.exec(template);

        options = {
          ...options,
          template: $hmrProvider.modalStorage.get(identity) || template,
          controller: controller ? ($hmrProvider.modalStorage.get(controller.ng_hmr_identity) || controller) : undefined,
          windowClass: windowClass ? `${windowClass} ${identity} ng-hmr-modal` : `${identity} ng-hmr-modal`
        };

        return Reflect.apply(target, context, [options]);
      }
    };

    $delegate.open = new Proxy(open, handler);

    return $delegate;
  }]);
}