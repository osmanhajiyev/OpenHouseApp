var myApp = angular.module('myApp', ['ngRoute']);

myApp.config(function($routeProvider){
  console.log("I am running app config");
  $routeProvider
  .when('/', {
    templateUrl: '../login/login.html',
  })
  .when('/register', {
    templateUrl: '../register/register.html',
  })
  .when('/userinfo', {
      resolve:{
      "check": function($location, $rootScope){
        if(!$rootScope.loggedIn){
          $location.path('/');
        }
      }
    },
      templateUrl: '../userinfo.html'
  })
  .when('/homepage', {
    resolve:{
      "check": function($location, $rootScope){
        if(!$rootScope.loggedIn){
          $location.path('/');
        }
      }
    },
      templateUrl: '../homepage.html'
  })
  .otherwise({
    redirectTo:'/'
  });
});

myApp.controller('AppCtrl', ['$scope', '$http', '$rootScope', '$location', function($scope, $http, $rootScope, $location) {
    console.log("Hello World from controller");


var refresh = function() {
  $http.get('/openhouse').success(function(response) {
    console.log("I got the data I requested updated");
    $scope.userlist = response;
    $scope.user = "";
  });
};


$scope.register = function(){
  $http.post('/register', $scope.vm)
               .success(function (response) {
                if(response.success){
                    $rootScope.loggedIn =true;
                    $location.path('/userinfo');
                  }
               });
}


$scope.login = function(){
  $http.post('/authenticate', $scope.vm)
               .success(function (response) {
                console.log(response);
                if(response.success){
                   $rootScope.loggedIn =true;
                   $location.path('/homepage');
                }
               });
}

$scope.addUser = function() {
  console.log($scope.user);
  console.log("I added a user");
  $http.post('/openhouse', $scope.user).success(function(response) {
    console.log(response);
    refresh();
  });
  $location.path('/homepage');
};

$scope.remove = function(id) {
  console.log(id);
  $http.delete('/openhouse/' + id).success(function(response) {
    refresh();
  });
};

$scope.edit = function(id) {
  console.log(id);
  $http.get('/openhouse/' + id).success(function(response) {
    $scope.user = response;
  });
};  

$scope.update = function() {
  console.log($scope.user._id);
  $http.put('/openhouse/' + $scope.user._id, $scope.user).success(function(response) {
    refresh();
  })
};

$scope.deselect = function() {
  $scope.user = "";
}

  $scope.submit = function(){
    console.log('scope is ' + $scope.username);
    console.log('scope is ' + $scope.password);
    if($scope.password == 'admin' && $scope.username == 'admin'){
      $rootScope.loggedIn = true;
      $location.path('/userinfo');
    } else {
      alert('Incorrect username and password');
    }
  };


}]);﻿