/**
 * @description - HMR bridge manager
 * @author - bornkiller <hjj491229492@hotmail.com>
 */
'use strict';

import angular from 'angular';
import { omit } from 'lodash';
import { has } from 'lodash';
import { chain } from 'lodash';
import { Observable } from '@bornkiller/observable';

/* eslint-disable angular/document-service, angular/angularelement */
export /* @ngInject */ function HMRProvider() {
  const Storage = new Map();
  
  this.register = register;
  this.pick = pick;
  
  // name = state.name + views.name + template / controller
  function register(name) {
    Storage.set(name, new Observable());
  }
  
  function pick(name) {
    return Storage.get(name);
  }
  
  this.$get = ['$injector', '$compile', '$state', function ($injector, $compile, $state) {
    return {
      notify
    };
    
    function notify(name, hotModule) {
      let observable = Storage.get(name);
      let [stateName, viewName, hotModuleType] = name.split('_');
      
      // 需要判定匹配目标是否处于激活状态
      if ($state.includes(stateName)) {
        hotModuleType === 'template' ? hotUpdateView(viewName, hotModule) : hotUpdateController(viewName, hotModule);
      }
      
      // 此处修改router声明, reload的时候才会生效,使之符合HMR原则
      observable.next(hotModule);
    }
    
    function hotUpdateView(viewName, template) {
      let selector = `[ui-view=${viewName}]`;
      let target = angular.element(document.querySelector(selector));
      let scope = target.scope();
      let middleware = $compile(template)(scope);
      let subViewTargets = middleware.find('[ui-view]');
      
      if (subViewTargets.length) {
        let subViewSelectors = subViewTargets.map(function () {
          let subViwName = $(this).attr('ui-view');
          
          return `[ui-view=${subViwName}]`;
        }).toArray();
        
        middleware = subViewSelectors.reduce(function (prev, selector) {
          prev.find(selector).replaceWith($(selector));
          
          return prev;
        }, middleware);
      }
      
      target.empty().append(middleware);
    }
    
    function hotUpdateController(viewName, controller) {
      let selector = `[ui-view=${viewName}]`;
      let target = document.querySelector(selector);
      let scope = angular.element(target).scope();
      let prevVM = scope.vm;
      let nextVM = $injector.instantiate(controller);
      let toString = Object.prototype.toString;
      
      // 假设所有关联属性在constructor内部声明,变量类型不变
      chain(nextVM).keys().value().forEach(key => {
        if (!has(prevVM, key) || toString.call(prevVM[key]) !== toString.call(nextVM[key])) {
          prevVM[key] = nextVM[key];
        }
      });
      
      chain(Object.getOwnPropertyNames(nextVM.__proto__)).filter(key => key !== 'constructor').value().forEach(key => {
        prevVM.__proto__[key] = nextVM.__proto__[key];
      });
      
      scope.$apply();
    }
  }];
}

export /* @ngInject */ function HMRStateProviderConfig($stateProvider, $hmrProvider) {
  $stateProvider.decorator('views', function (state, $delegate) {
    let target = {};
    let views = $delegate(state);
    
    angular.forEach(views, (config, viewName) => {
      let middleware = omit(config, ['template', 'controller']);
      let templateAccessorToken = `${state.name}_${viewName}_template`;
      let controllerAccessorToken = `${state.name}_${viewName}_controller`;
      let mirror = {
        template: config.template,
        controller: config.controller
      };
      
      $hmrProvider.register(templateAccessorToken);
      $hmrProvider.register(controllerAccessorToken);
      
      $hmrProvider.pick(templateAccessorToken).subscribe(template => {
        mirror.template = template;
      });
      
      $hmrProvider.pick(controllerAccessorToken).subscribe(controller => {
        mirror.controller = controller;
      });
      
      middleware.templateProvider = function () {
        return mirror.template;
      };
      
      middleware.controllerProvider = function () {
        return mirror.controller;
      };
      
      target[viewName] = middleware;
    });
    
    return target;
  });
}