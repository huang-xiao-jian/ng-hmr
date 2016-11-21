/**
 * @description - provide core $hmr service
 * @author - bornkiller <hjj491229492@hotmail.com>
 */
export /* @ngInject */ function HMRProvider() {
  // RouteStorage => manage route
  const RouteStorage = new Map();
  const ModalStorage = new Map();
  const PipeStorage = new Map();

  this.storage = Storage;
  this.modalStorage = ModalStorage;
  this.pipeStorage = PipeStorage;

  // name = state.name + views.name + template / controller

  this.$get = ['$injector', '$compile', '$controller', '$timeout', '$state', '$uibResolve', '$parse', function ($injector, $compile, $controller, $timeout, $state, $uibResolve, $parse) {
    return {
    };
  }];
}