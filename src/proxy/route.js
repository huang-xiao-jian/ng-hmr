/**
 * @description - provide route $hmr service, includes declare and active
 * @author - bornkiller <hjj491229492@hotmail.com>
 */

'use strict';

import { hmrIdentityCaptureReg, decorateRouteTemplate } from '../util/hmr.util';

export /* @ngInject */ function HMRRouteConfig($stateProvider, $hmrProvider) {
  $stateProvider.decorator('views', function (state, $delegate) {
    let target = {};
    let views = $delegate(state);

    angular.forEach(views, (config, viewName) => {
      let handler = {
        get(target, key) {
          let value = Reflect.get(target, key);

          if (key === 'template') {
            let [, identity] = hmrIdentityCaptureReg.exec(value);

            // init route template, just for directive HMR template identify convenience
            !$hmrProvider.routeStorage.has(identity) && $hmrProvider.routeStorage.set(identity, value);

            let template = $hmrProvider.routeStorage.get(identity);
            let controller = Reflect.get(target, 'controller');

            value = `${template} \n ${decorateRouteTemplate(identity, controller)}`;
          }

          if (value && key === 'controller') {
            value = $hmrProvider.routeStorage.get(value.ng_hmr_identity) || value;
          }

          return value;
        }
      };

      target[viewName] = new Proxy(config, handler);
    });

    return target;
  });
}