/**
 * @description
 * - ng-hmr cooperate with ng-hot-loader
 * - heavy dependency with lodash(_), jquery($), expose global variable
 * @author - bornkiller <hjj491229492@hotmail.com>
 */
'use strict';

import angular from 'angular';
import { HMRProvider } from './src/hmr.provider';
import { HMRInjectorDecorator } from './src/hmr.injector';
import { HMRExpose } from './src/hmr.expose';

const HMR_MODULE = 'ng-hmr';

angular.module(HMR_MODULE, [])
  .provider('$hmr', HMRProvider)
  .config(HMRInjectorDecorator)
  .run(HMRExpose);

export { HMR_MODULE };