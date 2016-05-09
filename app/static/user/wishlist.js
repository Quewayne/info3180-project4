angular.module('myApp.wishlist', ['ngRoute', 'satellizer'])

.config(['$routeProvider','$authProvider', function($routeProvider, $authProvider) {
  $routeProvider.when('/api/user/:id/wishlist', {
    templateUrl: 'static/templates/wishlist.html',
    controller: 'wishCtrl',
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

.controller('wishCtrl', ['$scope', '$log', '$http', '$location', '$rootScope',function($scope, $log, $http, $location,$rootScope) {

$scope.toggleVar = true;
if ($rootScope.user == null){
	$location.path('/api/user/login');
}

var usr= $rootScope.user;


    $log.log(usr);

    // get the URL from the input
    //var userInput = $scope.url;
    var email= $scope.email;
    var password= $scope.password;


    // fire the API request
   $http.get('/api/user/' + usr + '/wishlist').
      success(function(results) {
        //$log.log(results);
        var dt=results;
        $scope.wishes=dt["data"]["wishes"]
        $log.log(dt);
        $log.log($scope.wishes);
       
        
      }).
      error(function(error) {
        $log.log(error);
      });

$scope.go= function(){

	$location.path('/api/thumbnail/process');
};

$scope.share= function(){

	$location.path('/api/user/:id/share');
};

$scope.remove= function($index){
	var urldel=$scope.wishes[$index]["thumbnail"];
	$http.post('/api/user/' + usr + '/remove', {"urldel": urldel}).
      	success(function(results) {
      		$location.path('/api/user/:id/wishlist');
        	$log.log(results);
      }).
      error(function(error) {
        $log.log(error);
      });
	
};

$scope.purchased= function($index){
	var urlup=$scope.wishes[$index]["thumbnail"];
	$http.post('/api/user/' + usr + '/purchased', {"urlup": urlup}).
      	success(function(results) {
      		$location.path('/api/user/:id/wishlist');
        	$log.log(results);
      }).
      error(function(error) {
        $log.log(error);
      });
	
};
  

}]);
