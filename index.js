'use strict';

import angular from 'angular';
import { HMRStateProviderConfig, HMRModalDecoratorConfig, HMRInjectorDecoratorConfig, HMRProvider } from './src/hmr.cooperation';

const HMR_MODULE = 'ng-hmr';

angular.module(HMR_MODULE, [])
  .config(HMRStateProviderConfig)
  .config(HMRModalDecoratorConfig)
  .config(HMRInjectorDecoratorConfig)
  .provider('$hmr', HMRProvider);

export { HMR_MODULE };