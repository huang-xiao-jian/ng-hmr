# ng-hmr
cooperate with ng-hot-loader, make NG HMR possible, no suggest for legacy project

## pre-requirement
Current implement depend on `lodash`, `jquery`, `angular-ui-router`, `angular-ui-bootstrap`, so you have to install them all. also, browser should support ES6 `Proxy`， `Reflect`, `Map`. I will try to find better solution after HMR work as expected.

+ `angular` - global variable `angular`, test version >= 1.5.8
+ `angular-ui-router` - test version >= 1.0.0
+ `angular-ui-bootstrap` - test version >= 2.2.0
+ `lodash` - global variable `_`, test version >= 4.16.4
+ `jquery` - global variable `jQuery, $`, test version >= 3.1.1

## usage

```javascript
import 'angular';
import 'angular-ui-router';
import 'angular-ui-bootstrap';
import 'jquery';
import 'lodash';
import 'ng-hmr';
```

```javascript
const dependencies = [
  'ui.router',
  'ui.bootstrap',
  'ng-hmr'
];

angular.module('App', dependencies)
```

## limitation
+ support router level `template`, `controller` hot module replacement
+ support modal level `template`, `controller` hot module replacement
+ support factory level `service` hot module replacement
+ support rough directive hot module replacement, completely re-compile entire template, which means status lost

## rule and example

### factory

+ instance should be literal object => {key: value}

```javascript
export /* @ngInject */ function promptFactory() {
  return {
    isValidPrompt,
    escapeValidPrompt
  };

  function isValidPrompt(structure) {
    return !!structure.errorDesc;
  }
  
  function escapeValidPrompt(structure) {
    return _.escape(structure.errorDesc);
  }
}
```

### module
+ template => `html string`, like `html-loader`. `route template`, `modal template` has different HMR strategy, you have to use `modal.html` as modal template postfix.
+ controller => `*ModalController`, class or just function, not string token.  `route controller`, `modal controller` has different HMR strategy, you have to use `modal.controller.js` as modal controller postfix.

```javascript
/**
 * @description - share module combine several controller, filter, service, directive
 * @author - bornkiller <hjj491229492@hotmail.com>
 */
'use strict';

// share module dependency
import { postfixFilter } from './filter/postfix.filter';
import { promptFactory } from './service/prompt.factory';
import { FighterService } from './service/fighter.service';
import { validateCaptchaDirective } from './directive/validate.directive';

// share module route dependency
import lovePageTemplate from './template/love.html';
import todoPageTemplate from './template/todo.html';
import { LoveController } from './controller/love.controller';
import { TodoController } from './controller/todo.controller';

// share module name
const SHARE_MODULE = 'app.share';

// share module route
const ShareRoute = [
  {
    name: 'application.love',
    url: '/love',
    views: {
      'page': {
        template: lovePageTemplate,
        controller: LoveController,
        controllerAs: 'vm'
      }
    }
  },
  {
    name: 'application.todo',
    url: '/todo',
    views: {
      'page': {
        template: todoPageTemplate,
        controller: TodoController,
        controllerAs: 'vm'
      }
    }
  }
];

/**
 * @description - never declare any dependency here, because dependency should declare into root module
 */
angular.module(SHARE_MODULE, [])
  .filter('bkPostfix', postfixFilter)
  .factory('bkPrompt', promptFactory)
  .service('bkFighter', FighterService)
  .directive('bkValidateCaptcha', validateCaptchaDirective)
  // eslint-disable-next-line angular/di
  .config(['$stateProvider', function ($stateProvider) {
    ShareRoute.forEach((route) => {
      $stateProvider.state(route);
    });
  }]);

// just export module name for root module
export { SHARE_MODULE };
```

### controller
implement controller with `ES6 Class`.

```javascript
export class SidebarController {
  /* @ngInject */
  constructor($http, Notification, bkPrompt) {
    this.$http = $http;
    this.Notification = Notification;
    this.bkPrompt = bkPrompt;
    
    this.description = 'hello world';
    this.authority = {};
  }
  
  handleAuthorityClick(authority) {
    console.group('Authority');
    console.log(this.authority);
    console.log(authority);
    console.groupEnd('Authority');
  
    this.$http.post('/api/example', authority).then((data) => {
      console.log(data);
    }, () => {
      this.Notification.error('Network not connect');
    });
  }
}
```

### tricky
when update `controller`, `ng-hmr` need strategy to determine whether update the specific field or just leave it, the default strategy extreme simple: 

```javascript
/**
 * @description - determine whether ng-hmr should update the field, true for yes ,false for no
 *
 * @param {string} field
 * @param {object} prev 
 * @param {object} next
 */
function shouldFieldUpdate(field, prev, next) {
  let toString = Object.prototype.toString;

  return toString.call(prev) !== toString.call(next);
}
```

you can mount your own strategy implement onto the controller. please note here, `ng-hmr` already handle `dependency inject` override, so never consider about `dependencies`, just think about normal field.

## demo 
please see [angular-boilerplate-webpack](https://github.com/bornkiller/angular-boilerplate-webpack) for HMR attempt.

## license
MIT