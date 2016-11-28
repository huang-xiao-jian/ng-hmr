# ng-hmr
cooperate with ng-hot-loader, make NG HMR possible, no suggest for legacy project

## pre-requirement
Current implement depend on `lodash`, `jquery`, `angular-ui-router`, `angular-ui-bootstrap`, so you have to install them all. also, browser should support ES6 `Proxy`， `Reflect`. I will try to find better solution after HMR work as expected.

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

### route

+ template => `html string`, like `html-loader`
+ controller => `*Controller`, actual implement, not string token

```javascript
/**
 * @description - layout router config
 * @author - bornkiller <hjj491229492@hotmail.com>
 */

import { TodoController } from './todo.controller';

// router rule declare
export const TodoRoute = [
  {
    name: 'application.todo',
    url: '/todo',
    views: {
      'page': {
        template: require('./todo.html'),
        controller: TodoController,
        controllerAs: 'vm'
      }
    }
  }
];
```

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

### modal

+ template => `html string`, like `html-loader`, especially, the template filename should endsWith `modal.html`, because `route template`, `modal template` has different update strategy, and i can't identify which one should take effect.
+ controller => `*ModalController`, not string token, especially, the controller filename should endsWith `modal.controller.js`, the same reason as above.

```javascript
/**
 * @description - collection feature controller
 * @author - bornkiller <hjj491229492@hotmail.com>
 */
'use strict';

import { TodoModalController } from './todo.modal.controller';

/* @ngInject */
export class TodoController {
  constructor($q, $scope, $ngRedux, $uibModal) {
    this.$uibModal = $uibModal;
  }

  displayPoemModal() {
    this.$uibModal.open({
      template: require('./todo.modal.html'),
      controller: TodoModalController,
      controllerAs: 'vm'
    });
  }
}
```

### tricky
when update `controller`, `ng-hmr` need strategy to determine whether override the specific field or just leave it, the default strategy extreme simple: 

```javascript
/**
 * @description - determine whether ng-hmr should override the field, true for yes ,false for no
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

you can mount your own strategy implement onto the controller. please note here,  `ng-hmr` already handle `$injector dependency` override, so never consider about `dependencies`, just think about normal field.

## demo 
please see [angular-boilerplate-webpack](https://github.com/bornkiller/angular-boilerplate-webpack) for HMR attempt.

## license
MIT
