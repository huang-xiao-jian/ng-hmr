/**
 * @description - provide core $hmr service
 * @author - bornkiller <hjj491229492@hotmail.com>
 */

'use strict';

import { Observable } from '@bornkiller/observable';
import { hmrThroughFilter} from './worker/hmr.filter';

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

  this.Observable = Observable;
  this.routeStorage = RouteStorage;
  this.pipeStorage = PipeStorage;
  this.modalStorage = ModalStorage;

  this.$get = ['$injector', function ($injector) {
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
          InstanceStorage.set(token, implement);
          break;
        case 'Controller':
          ControllerStorage.set(token, implement);
          break;
        case 'Route':
          RouteStorage.set(token, implement);
          break;
        default:
          // eslint-disable-next-line no-console, angular/log
          console.warn('feature %s / %s maybe not support now', token, category);
      }
    }

    /**
     * @description - take hot effect
     *
     * @param {string} category - angular component type, like filter, factory, route
     * @param {string} token - angular component access token
     * @param {function} implement - angular component next implement
     */
    function hmrOnStore(category, token, implement) {
      switch (category) {
        case 'Filter':
          hmrThroughFilter($injector, token);
          break;
        default:
          console.log('what the hell');
      }
    }
  }];
}