# ng-hmr
cooperate with ng-hot-loader, make NG HMR possible, no suggest for legacy project

## pre-requirement
implement depend on `lodash`, so you have to install.

+ `angular` - global variable
+ `lodash` - global variable
+ `angular-ui-router` - version > 1.0.0

## usage

```javascript
import 'angular';
import 'angular-ui-router';
import 'ng-hmr';
```

```javascript
const dependencies = [
  'ui.router',
  'ng-hmr'
];

angular.module('App', dependencies)
```

## limitation
+ support router level `template`, `controller` hot module replacement
+ support factory level `service` hot module replacement
+ file and code should follow strict rules

## rule and example

### factory
+ file name => 'prompt.factory.js'
+ declare variable name => 'promptFactory'
+ result should be literal object => {key: value}

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
+ file name => 'todo.route.js'
+ declare variable name => 'TodoRoute'
+ template => 'html string'

+ controller => ControllerVariable
+ controller file name => 'todo.controller.js'
+ controller declare variable name => 'TodoController'

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

## demo 
please see [angular-boilerplate-webpack](https://github.com/bornkiller/angular-boilerplate-webpack) for HMR attempt.
