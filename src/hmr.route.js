/**
 * @description - provide route $hmr service, includes declare and active
 * @author - bornkiller <hjj491229492@hotmail.com>
 */

'use strict';

import { hmrIdentityCaptureReg } from './util/hmr.reg';

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
            let hmrTemplate = $hmrProvider.routeStorage.get(identity);

            hmrTemplate && (value = hmrTemplate);
          }
          return value;
        }
      };

      target[viewName] = new Proxy(config, handler);
    });

    return target;
  });
}