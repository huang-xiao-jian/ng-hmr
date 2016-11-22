/**
 * @description - HMR bridge manager
 * @author - bornkiller <hjj491229492@hotmail.com>
 */
'use strict';

import { omit, isEmpty } from 'lodash';
import { Observable } from '@bornkiller/observable';

import { analyzeModalIdentity, resolveModalClass } from './hmr.warrior';
import {
  updateModalTemplate,
  updateModalController,
  updateViewTemplate,
  updateViewController,
  updateViewFilter,
  updateViewInstance
} from './hmr.worker';

/**
 * @description - provide core $hmr service
 */
/* eslint-disable angular/document-service, angular/angularelement */
export /* @ngInject */ function HMRProvider() {
  const Storage = new Map();
  const ModalStorage = new Map();
  const PipeStorage = new Map();

  this.register = register;
  this.storage = Storage;
  this.modalStorage = ModalStorage;
  this.pipeStorage = PipeStorage;

  // name = state.name + views.name + template / controller
  function register(name) {
    Storage.set(name, new Observable());
  }

  this.$get = ['$injector', '$compile', '$controller', '$timeout', '$state', '$uibResolve', '$parse', function ($injector, $compile, $controller, $timeout, $state, $uibResolve, $parse) {
    return {
      notify,
      update,
      through,
      override
    };

    /**
     * @description - HMR filter implement
     *
     * @param {string} name
     * @param {function} implement
     */
    function through(name, implement) {
      PipeStorage.set(`${name}Filter`, implement);
      updateViewFilter($parse, name);
    }

    /**
     * @description - HMR factory / service implement
     *
     * @param {string} name
     * @param {object} instance
     */
    function override(name, instance) {
      updateViewInstance($injector, name, instance);
    }

    /**
     * @description - HMR modal implement
     *
     * @param hotModalModule
     * @param {string} hotModalType - template or controller
     */
    function update(hotModalModule, hotModalType) {
      if (hotModalType == 'template') {
        let modalTemplateIdentity = analyzeModalIdentity(hotModalModule);

        ModalStorage.set(modalTemplateIdentity, {template: hotModalModule});
        updateModalTemplate($compile, hotModalModule);
      } else {
        // update modal controller options
        let modalControllerIdentity = analyzeModalIdentity(hotModalModule);
        let modalInstanceIdentity = `${modalControllerIdentity}-instance`;
        let modalResolveIdentity = `${modalControllerIdentity}-resolve`;

        let $uibModalInstance = ModalStorage.get(modalInstanceIdentity);
        let modalResolveOptions = ModalStorage.get(modalResolveIdentity);

        ModalStorage.set(modalControllerIdentity, {controller: hotModalModule});

        if (isEmpty(modalResolveOptions)) {
          updateModalController($controller, {$uibModalInstance: $uibModalInstance}, hotModalModule);
        } else {
          $uibResolve.resolve(modalResolveOptions).then(locals => {
            $timeout(() => {
              updateModalController($controller, {...locals, $uibModalInstance: $uibModalInstance}, hotModalModule);
            }, 1);
          });
        }
      }
    }

    // HMR route implement
    function notify(name, hotModule) {
      let observable = Storage.get(name);
      let [stateName, viewName, hotModuleType] = name.split('_');

      // 需要判定匹配目标是否处于激活状态
      if ($state.includes(stateName)) {
        hotModuleType === 'template' ? updateViewTemplate($compile, viewName, hotModule) : updateViewController($injector, viewName, hotModule);
      }

      // 此处修改router声明, reload的时候才会生效,使之符合HMR原则
      observable.next(hotModule);
    }
  }];
}

/**
 * @description - decorate route definition, prepare for HMR
 *
 * @param $stateProvider
 * @param $hmrProvider
 */
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

      $hmrProvider.storage.get(templateAccessorToken).subscribe(template => {
        mirror.template = template;
      });

      $hmrProvider.storage.get(controllerAccessorToken).subscribe(controller => {
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

/**
 * @description - decorate modal service, prepare for HMR
 *
 * @param $provide
 * @param $hmrProvider
 */
export /* @ngInject */ function HMRModalDecoratorConfig($provide, $hmrProvider) {
  $provide.decorator('$uibModal', ['$delegate', function ($delegate) {
    return {
      ...$delegate,
      open: HMRModalOpen
    };

    function HMRModalOpen(options) {
      let {template, controller, windowClass} = options;
      let modalTemplateIdentity = analyzeModalIdentity(template);
      let modalControllerIdentity = analyzeModalIdentity(controller);
      let hmrModalWindowClass = resolveModalClass(windowClass, [modalTemplateIdentity, modalControllerIdentity]);

      let hmrModalTemplate = $hmrProvider.modalStorage.get(modalTemplateIdentity) || {template};
      let hmrModalController = $hmrProvider.modalStorage.get(modalControllerIdentity) || {controller};

      options = {...options, ...hmrModalTemplate, ...hmrModalController, ...hmrModalWindowClass};

      let modalInstance = $delegate.open(options);
      let modalInstanceIdentity = `${modalControllerIdentity}-instance`;
      let modalResolveIdentity = `${modalControllerIdentity}-resolve`;

      $hmrProvider.modalStorage.set(modalInstanceIdentity, modalInstance);
      $hmrProvider.modalStorage.set(modalResolveIdentity, options.resolve || {});

      modalInstance.result.then(() => {
        $hmrProvider.modalStorage.delete(modalInstanceIdentity);
      }, () => {
        $hmrProvider.modalStorage.delete(modalInstanceIdentity);
      });

      return modalInstance;
    }
  }]);
}