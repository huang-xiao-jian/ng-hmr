'use strict';

import { HMRStateProviderConfig, HMRProvider } from './src/hmr.cooperation';

const HMR_MODULE = 'ng-hmr';

angular.module(HMR_MODULE, [])
  .config(HMRStateProviderConfig)
  .provider('$hmr', HMRProvider);

export { HMR_MODULE };