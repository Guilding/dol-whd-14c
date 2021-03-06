/* eslint-disable no-global-assign */
if (typeof console === 'undefined') {
  console = {
    log: function() {}
  };
}

// Global Dependencies
require('jquery');
require('font-awesome/css/font-awesome.css');
require('angular-data-grid/dist/dataGrid.min.js');
require('angular-data-grid/dist/pagination.min.js');
import 'datatables.net'
import 'datatables.net-buttons';
import 'datatables.net-buttons/js/buttons.html5.js';
import 'datatables.net-responsive';
import 'datatables.net-dt/css/jquery.dataTables.css';
import 'datatables.net-buttons-dt/css/buttons.dataTables.css';
import 'datatables.net-responsive-dt/css/responsive.dataTables.css';
// Angular
import angular from 'angular';
import ngIdle from 'ng-idle';
import ngAnimate from 'angular-animate';
import ngResource from 'angular-resource';
import ngRoute from 'angular-route';
import ngSanitize from 'angular-sanitize';
import 'angular-moment';
import 'ng-mask';
import toastr from 'angular-toastr';
import 'angular-cookies';
// angular 4 components (& downgrade dependencies)
import { downgradeComponent, downgradeInjectable } from '@angular/upgrade/static';
import { DolFooterComponent } from '../v4/dol-footer.component';
import { HelloWorldComponent } from '../v4/hello-world.component';
import { UiLibraryComponent } from '../v4/ui-library.component';
import { LoggingService } from '../v4/services/logging.service';

// Styles
import '../styles/main.scss';

// Angular application module
let app = angular.module('14c', [
  ngAnimate,
  ngResource,
  ngRoute,
  ngIdle,
  ngSanitize,
  toastr,
  require('angular-crumble'),
  'angularMoment',
  'ngMask',
  'ngCookies',
  'dataGrid',
  'pagination'
]);

// augment angular exception handler
app.provider('$exceptionHandler', { $get: function( errorLogService ) {
  return( errorLogService );
}});

app
  .directive('dolFooter', downgradeComponent({ component: DolFooterComponent }))
  //.directive('dolHeader', downgradeComponent({ component: DolHeaderComponent }))
  .directive('helloWorld', downgradeComponent({ component: HelloWorldComponent }))
  .directive('uiLibrary', downgradeComponent({ component: UiLibraryComponent }))
  .factory('loggingService', downgradeInjectable(LoggingService));

// Environment config loaded from env.js
let env = {};
if (window && window.__env) {
  Object.assign(env, window.__env);
}

app.constant('_env', env);

// Load Application Components
require('./constants')(app);
require('./components')(app);
require('./filters')(app);
require('./pages')(app);
require('./services')(app);
app.config(function(IdleProvider, KeepaliveProvider) {
  // configure Idle settings
  IdleProvider.idle(780); // in seconds
  IdleProvider.timeout(120); // in seconds
  IdleProvider.autoResume(false);
  KeepaliveProvider.interval(2); // in seconds
})
let routeConfig = require('./routes.config');
require('./routes')(app);
/* eslint-disable complexity */
app.run(function(
  $rootScope,
  $location,
  Idle,
  $log,
  _env,
  crumble,
  stateService,
  autoSaveService,
  authService,
  apiService,
  $q
) {

  var getParent = crumble.getParent;
  crumble.getParent = function (path) {
    var route = crumble.getRoute(path);
    return (route && angular.isDefined(route.parent)) ? route.parent : getParent(path);
  };

  // check cookie to see if we're logged in
  const accessToken = stateService.access_token;
  let authenticatedPromise;

  if(!Idle.running() && accessToken){
    Idle.watch();
  }

  if (accessToken) {
    // authenticate the user based on token
    authenticatedPromise = authService.authenticateUser();
    authenticatedPromise.then(function() {
    }).catch(function(){
    });
  } else {
    const d = $q.defer();
    authenticatedPromise = d.promise;
    d.resolve();
  }

  //TODO: remove dev_flag check
  if (!env.dev_flag === true) {
    // watch for route changes and redirect non-public routes if not logged in
    $rootScope.$on('$routeChangeStart', function(event, next) {
      authenticatedPromise.then(function() {
        if (!next.$$route) {
          return;
        }

        let userAccess = stateService.IsPointOfContact
          ? routeConfig.access.ROUTE_ADMIN
          : stateService.loggedIn ? routeConfig.access.ROUTE_USER : routeConfig.access.ROUTE_PUBLIC;
        if(userAccess === routeConfig.access.ROUTE_USER) {
          apiService.userInfo(stateService.access_token).then(function(result) {
            if(result.data.organizations.length <= 0) {
              $location.path("/employerRegistration");
            }
          }).catch(function(error) {
            $log.warn('Error in authenticating user or getting saved application.', error)
          });
        }
        if (!routeConfig.checkRouteAccess(next.$$route, userAccess)) {
          // user does not have adequate permissions to access the route so redirect
          $location.path('/' + (userAccess === routeConfig.access.ROUTE_ADMIN ? 'admin' : 'login'));
        } else if (next.$$route.isLanding && userAccess === routeConfig.access.ROUTE_ADMIN) {
          // redirect admin users to the admin dashboard
          $location.path('/admin');
        }
      }).catch(function(error){
        $log.warn('Error in authenticating user or getting saved application.', error)
      });
    });
  }
});
/* eslint-enable complexity */

export { app };
