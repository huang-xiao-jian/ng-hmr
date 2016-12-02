/**
 * @description - provide core $hmr service
 * @author - bornkiller <hjj491229492@hotmail.com>
 */

'use strict';

import { adoptNextFilter } from './worker/filter';
import { adoptNextDirective } from './worker/directive';
import { adoptNextTemplate, adoptNextController} from './worker/route';
import { adoptNextModalTemplate, adoptNextModalController } from './worker/modal';
import { hmrIdentityCaptureReg } from './util/hmr.util';

export /* @ngInject */ function HMRProvider() {
  // RouteStorage => manage route, InstanceStorage => manage filter, factory, directive, ModalStorage => manage modal
  // ControllerStorage support explicit controller only, angular.module().controller('', SomeController)
  const RouteStorage = new Map();
  const InstanceStorage = new Map();
  const ModalStorage = new Map();
  const ControllerStorage = new Map();

  this.routeStorage = RouteStorage;
  this.instanceStorage = InstanceStorage;
  this.modalStorage = ModalStorage;

  this.$get = ['$injector', '$rootScope', function ($injector, $rootScope) {
    return {
      hmrOnChange,
      hmrDoActive,
      routeStorage: RouteStorage,
      instanceStorage: InstanceStorage,
      modalStorage: ModalStorage
    };

    /**
     * @description - notify storage receive latest component implement
     *
     * @param {string} category - angular component type, like filter, factory, route
     * @param {string} token - angular component access token
     * @param {function} implement - angular component next implement
     */
    function hmrOnChange(category, token, implement) {
      switch (category) {
        case 'Filter':
          InstanceStorage.set(`${token}Filter`, $injector.invoke(implement));
          break;
        case 'Directive':
          InstanceStorage.set(`${token}Directive`, $injector.invoke(implement));
          break;
        case 'Factory':
          InstanceStorage.set(token, $injector.invoke(implement));
          break;
        case 'Controller':
          ControllerStorage.set(token, implement);
          break;
        case 'RouteTemplate':
          RouteStorage.set(hmrIdentityCaptureReg.exec(implement)[1], implement);
          break;
        case 'RouteController':
          RouteStorage.set(implement.ng_hmr_identity, implement);
          break;
        case 'ModalTemplate':
          ModalStorage.set(hmrIdentityCaptureReg.exec(implement)[1], implement);
          break;
        case 'ModalController':
          ModalStorage.set(implement.ng_hmr_identity, implement);
          break;
        default:
          // eslint-disable-next-line no-console, angular/log
          console.warn('feature %s / %s maybe not support now', token, category);
      }
    }

    /**
     * @description - take hot effect, filter need re-compile, while factory, service not
     *
     * @param {string} category - angular component type, like filter, factory, route
     * @param {string} token - angular component access token
     * @param {function} implement - angular component next implement
     */
    function hmrDoActive(category, token, implement) {
      switch (category) {
        case 'Filter':
          adoptNextFilter($injector, token);
          break;
        case 'Directive':
          adoptNextDirective($injector, token);
          break;
        case 'RouteTemplate':
          adoptNextTemplate($injector, implement);
          break;
        case 'RouteController':
          adoptNextController($injector, implement);
          break;
        case 'ModalTemplate':
          adoptNextModalTemplate($injector, implement);
          break;
        case 'ModalController':
          adoptNextModalController($injector, implement);
          break;
        default:
          $rootScope.$apply();
      }
    }
  }];
}