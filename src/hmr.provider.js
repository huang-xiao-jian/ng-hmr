/**
 * @description - provide core $hmr service
 * @author - bornkiller <hjj491229492@hotmail.com>
 */

'use strict';

import { adoptNextFilter } from './worker/filter';
import { adoptNextDirective } from './worker/directive';
import { adoptNextTemplate, adoptNextModalTemplate } from './worker/template';
import { adoptNextController, adoptNextModalController } from './worker/controller';
import { hmrIdentityCaptureReg, isModalTemplate, isModalController } from './util/hmr.util';

export /* @ngInject */ function HMRProvider() {
  // InstanceStorage => manage filter, factory, directive
  // TemplateStorage => manage template
  // ControllerStorage => manage explicit controller only till now, support implicit controller later
  const InstanceStorage = new Map();
  const TemplateStorage = new Map();
  const ControllerStorage = new Map();
  
  this.instanceStorage = InstanceStorage;
  this.templateStorage = TemplateStorage;
  this.controllerStorage = ControllerStorage;
  
  this.$get = ['$injector', '$rootScope', function ($injector, $rootScope) {
    return {
      hmrOnChange,
      hmrDoActive,
      instanceStorage: InstanceStorage,
      templateStorage: TemplateStorage,
      controllerStorage: ControllerStorage
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
        case 'ImplicitController':
          ControllerStorage.set(token, implement);
          break;
        case 'ExplicitController':
          ControllerStorage.set(implement.ng_hmr_identity, implement);
          break;
        case 'Template':
          TemplateStorage.set(hmrIdentityCaptureReg.exec(implement)[1], implement);
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
        case 'Template':
          !isModalTemplate(implement) ? adoptNextTemplate($injector, implement) : adoptNextModalTemplate($injector, implement);
          break;
        case 'ExplicitController':
          !isModalController($injector, implement) ? adoptNextController($injector, implement) : adoptNextModalController($injector, implement);
          break;
        default:
          $rootScope.$apply();
      }
    }
  }];
}