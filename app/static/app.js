'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngSanitize',
  'ngRoute',
  'myApp.register',
  'myApp.share',
  'myApp.logout',
  'myApp.login',
  'myApp.wishlist',
  'myApp.process'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/api/user/login'});
}])
.filter("sanitize", ['$sce', function($sce) {
  return function(htmlCode){
    return $sce.trustAsHtml(htmlCode);
  }
}]);
