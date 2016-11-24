/**
 * @description - provide core $hmr service
 * @author - bornkiller <hjj491229492@hotmail.com>
 */

'use strict';

import { adoptNextFilter } from './worker/filter';
import { adoptNextTemplate, adoptNextController} from './worker/route';
import { adoptNextModalTemplate, adoptNextModalController } from './worker/modal';
import { hmrIdentityCaptureReg } from './util/hmr.util';

export /* @ngInject */ function HMRProvider() {
  // split component category
  // RouteStorage => manage route, PipeStorage => manage pipe, ModalStorage => manage modal
  // store ultimate mode
  const RouteStorage = new Map();
  const PipeStorage = new Map();
  // support explicit controller only, angular.module().controller('', SomeController)
  const ControllerStorage = new Map();
  const InstanceStorage = new Map();
  const ModalStorage = new Map();

  this.routeStorage = RouteStorage;
  this.pipeStorage = PipeStorage;
  this.modalStorage = ModalStorage;
  this.instanceStorage = InstanceStorage;

  this.$get = ['$injector', '$rootScope', function ($injector, $rootScope) {
    return {
      hmrOnChange,
      hmrDoActive,
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
          PipeStorage.set(`${token}Filter`, $injector.invoke(implement));
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
     * @param {string} target - angular component access token or just implement
     */
    function hmrDoActive(category, target) {
      switch (category) {
        case 'Filter':
          adoptNextFilter($injector, target);
          break;
        case 'RouteTemplate':
          adoptNextTemplate($injector, target);
          break;
        case 'RouteController':
          adoptNextController($injector, target);
          break;
        case 'ModalTemplate':
          adoptNextModalTemplate($injector, target);
          break;
        case 'ModalController':
          adoptNextModalController($injector, target);
          break;
        default:
          $rootScope.$apply();
      }
    }
  }];
}