angular.module('myApp.process', ['ngRoute','ngSanitize'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/api/thumbnail/process', {
    templateUrl: 'static/templates/wish.html',
    controller: 'processCtrl',
  resolve: {
          loginRequired: loginRequired
        }
  });
  
  function loginRequired($q, $location, $auth) {
      var deferred = $q.defer();
      if ($auth.isAuthenticated()) {
        deferred.resolve();
      } else {
        $location.path('/login');
      }
      return deferred.promise;
    }
}])

.controller('processCtrl', ['$scope', '$log', '$http', '$sce', '$location', '$rootScope',function($scope, $log, $http, $sce, $location, $rootScope) {
$scope.k='Click desired Image';
$scope.toggleVar = true;
if ($rootScope.user == null){
	$location.path('/api/user/login');
}
//$scope.formshw="false";
$scope.getImages = function() {

    $log.log("test");

    // get the URL from the input
    //var userInput = $scope.url;
    var url= $scope.url;

    // fire the API request
    $http.get('/api/thumbnail/process?url=' + url).
      success(function(results) {
        //$log.log(results);
        var dt=results;
        $scope.n= dt["data"]["thumbnails"]
        //$scope.n= $sce.trustAsHtml(dt["data"]["thumbnails"])
        //var t=n[""]
        //$log.log("cooze");
        $log.log("nxt");
        //$log.log(n);
        $log.log($scope.k);
        
      }).
      error(function(error) {
        $log.log(error);
      });

  };
  $scope.change= function($index){
  	$scope.k='Image URL: ' + $scope.n[$index];
  	$scope.thumb= $scope.n[$index];
  	$scope.toggleVar = false;
  	//$scope.formshw="true";
  };
  
  $scope.getDetails= function(){
  var descrip = $scope.description;
  var title = $scope.title;
  var usr= $rootScope.user;
  var thumbnail=$scope.thumb;
  var u= $scope.url;
  var p= $scope.singleSelect;
  $http.post('/api/user/' + usr + '/wishlist', {"title": title, "description": descrip , "user": usr, "thumbnail": thumbnail, "url": u, "priority":p}).
      success(function(results) {
      	$location.path('/api/user/:id/wishlist');
        $log.log(results);
      }).
      error(function(error) {
        $log.log(error);
      });
  
  
  };
  
  
  
}]);
