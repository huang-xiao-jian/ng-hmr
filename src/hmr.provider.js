/**
 * @description - provide core $hmr service
 * @author - bornkiller <hjj491229492@hotmail.com>
 */

'use strict';

import { hmrThroughFilter} from './worker/hmr.filter';
import { hmrThroughTemplate } from './worker/hmr.template';
import { hmrThroughController } from './worker/hmr.controller';
import { hmrThroughModalTemplate } from './worker/hmr.modal';
import { hmrIdentityCaptureReg } from './util/hmr.reg';

export /* @ngInject */ function HMRProvider() {
  // split component category
  // RouteStorage => manage route, PipeStorage => manage pipe, ModalStorage => manage modal
  // store ultimate mode
  const RouteStorage = new Map();
  const RouteLinkStorage =new Map();
  const PipeStorage = new Map();
  // support explicit controller only, angular.module().controller('', SomeController)
  const ControllerStorage = new Map();
  const InstanceStorage = new Map();
  const ModalStorage = new Map();

  this.routeStorage = RouteStorage;
  this.routeLinkStorage = RouteLinkStorage;
  this.pipeStorage = PipeStorage;
  this.modalStorage = ModalStorage;
  this.instanceStorage = InstanceStorage;

  this.$get = ['$injector', '$rootScope', function ($injector, $rootScope) {
    return {
      hmrOnTransfer,
      hmrOnStore
    };

    /**
     * @description - notify storage receive latest component implement
     *
     * @param {string} category - angular component type, like filter, factory, route
     * @param {string} token - angular component access token
     * @param {function} implement - angular component next implement
     */
    function hmrOnTransfer(category, token, implement) {
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
     * @param {string} token - angular component access token or just implement
     */
    function hmrOnStore(category, token) {
      switch (category) {
        case 'Filter':
          hmrThroughFilter($injector, token);
          break;
        case 'RouteTemplate':
          hmrThroughTemplate($injector, token);
          break;
        case 'RouteController':
          hmrThroughController($injector, token, RouteLinkStorage.get(token.ng_hmr_identity));
          break;
        case 'ModalTemplate':
          hmrThroughModalTemplate($injector, token);
          break;
        default:
          $rootScope.$apply();
      }
    }
  }];
}