'use strict';

import angular from 'angular';
import { HMRStateProviderConfig, HMRModalDecoratorConfig, HMRProvider } from './src/hmr.cooperation';

const HMR_MODULE = 'ng-hmr';

angular.module(HMR_MODULE, [])
  .config(HMRStateProviderConfig)
  .config(HMRModalDecoratorConfig)
  .provider('$hmr', HMRProvider);

export { HMR_MODULE };