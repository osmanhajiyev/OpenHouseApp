var myApp = angular.module('myApp', ['ngRoute', 'angularCharts']);

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

    templateUrl: '../userinfo.html'
  })
  .when('/homepage', {
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

  $scope.pullAppartmentsByName = function(name) {
    console.log("pulling appartments with name: " + name);
    $http.get('/appartmentsByName/' + name).success(function(response) {
      $scope.appartmentList = response;
      $scope.pullAppartmentsAggreatesByName(name);
    });
  };

  $scope.register = function() {
    $http.post('/register', $scope.vm)
                 .success(function (response) {
                  console.log("We registered");
                  if(response.success){
                    console.log("We succesfully registered");
                      $rootScope.loggedIn =true;
                      $rootScope.userprofile = response.user;
                      $location.path('/userinfo');
                    }
                 });
  };

  $scope.login = function(){
    $http.post('/authenticate', $scope.vm)
                 .success(function (response) {
                  if(response.success){
                     $rootScope.loggedIn =true;
                     $rootScope.userprofile = response.user;
                     $location.path('/homepage');
                  }
                 });
  };

  $scope.addUser = function() {
    console.log("I added a user");
    if($scope.user.food == undefined){
      $scope.user.food = 5;
    }
  };

  $scope.pullAppartmentsAggreatesByName = function(name) {
    console.log("pulling appartments aggregates with name: " + name);
    $http.get('/pullAppartmentsAggreatesByName/' + name).success(function(response) {
      $scope.averages = response;
    });
  };

  $scope.pullAllAppartments = function(polygon) {
    console.log("pulling all appartments");
    $http.get('/pullAllAppartments').success(function(response) {
      var allAppartments = response;
      var confirmedAppartments = [];
      for (i = 0; i < allAppartments.length; i++) {
        var myLatlng = new google.maps.LatLng(allAppartments[i].lat, allAppartments[i].lng);
        if(google.maps.geometry.poly.containsLocation(myLatlng, polygon)) {
            confirmedAppartments.push(allAppartments[i]);
        }
      }
      $scope.confirmedAppartments = confirmedAppartments;
    });
  };

  $scope.getSliderValue = function(id){
    document.getElementById(id).value=val;
  };

  $scope.register = function() {
    $http.post('/register', $scope.vm)
    .success(function (response) {
      console.log("We registered");
      if(response.success){
        console.log("We succesfully registered");
        $rootScope.loggedIn =true;
        $rootScope.userprofile = response.user;
        $location.path('/userinfo');
      }
    });
  };

  $scope.login = function(){
    $http.post('/authenticate', $scope.vm)
    .success(function (response) {
      if(response.success){
        $rootScope.loggedIn =true;
        $rootScope.userprofile = response.user;
        $location.path('/homepage');
      }
    });
  };

  $scope.addUser = function() {
    console.log("I added a user");
    if($scope.user.food == undefined){
      $scope.user.food = 5;
    }
    if($scope.user.satisfied == undefined){
      $scope.user.satisfied = 5;
    }
    if($scope.user.nightlife == undefined){
      $scope.user.nightlife = 5;
    }
    if($scope.user.schools == undefined){
      $scope.user.schools = 5;
    }
    if($scope.user.transit == undefined){
      $scope.user.transit = 5;
    }
    console.log($scope.user);
    $http.get('http://maps.google.com/maps/api/geocode/json?address=' + $scope.user.zipcode).success(function(mapData) {
      angular.extend($scope, mapData);
      $scope.user.lat = mapData.results[0].geometry.location.lat;
      $scope.user.lng = mapData.results[0].geometry.location.lng;
      $scope.user.username = $rootScope.userprofile.username;
      $http.post('/openhouse', $scope.user).success(function(response) {
        $location.path('/homepage');
      });
    });

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
      $http.put('/openhouse/' + $scope.user._id, $scope.user).success(function(response) {
        refresh();
      })
  };

  $scope.deselect = function() {
      $scope.user = "";
  }

  $scope.updateTextInput = function(val) {
            console.log(val);
            document.getElementById('textInput').value=val;
  }

}]);﻿

myApp.controller('mapCtrl', ['$scope', '$http', '$rootScope', '$location', function($scope, $http, $rootScope, $location) {
   var mapOptions = {
       zoom: 12,
       center: new google.maps.LatLng(49.2827, -123.116226),
       mapTypeId: google.maps.MapTypeId.ROADMAP
   }

   $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);


   var drawingManager = new google.maps.drawing.DrawingManager({
       drawingMode: google.maps.drawing.OverlayType.POLYGON,
       drawingControl: true,
       drawingControlOptions: {
           position: google.maps.ControlPosition.TOP_CENTER,
           drawingModes: ['polygon']
       }
   });

   drawingManager.setMap($scope.map);
   var polygons = [];

   google.maps.event.addDomListener(drawingManager, 'polygoncomplete', function(polygon) {

    //Remove old polygon
    for(var i=0; i<polygons.length; i++) {
        polygons[i].setMap(null);
    }

    polygons.push(polygon);

    $scope.pullAllAppartments(polygon);

   });
}]);
