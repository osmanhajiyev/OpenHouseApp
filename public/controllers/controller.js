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
    console.log("I got the appartments I requested with name: " + name);
    $scope.pullAppartmentsAggreatesByName(name);
  });
}

$scope.pullAppartmentsAggreatesByName = function(name) {
  console.log("pulling appartments aggregates with name: " + name);
  $http.get('/pullAppartmentsAggreatesByName/' + name).success(function(response) {
    $scope.averages = response;
    console.log($scope.averages);
  });
}

$scope.register = function(){
  $http.post('/register', $scope.vm)
               .success(function (response) {
                if(response.success){
                    $rootScope.loggedIn =true;
                    $rootScope.userprofile = response.user;
                    $location.path('/userinfo');
                  }
               });
}


$scope.login = function(){
  $http.post('/authenticate', $scope.vm)
               .success(function (response) {
                if(response.success){
                   $rootScope.loggedIn =true;
                   $rootScope.userprofile = response.user;
                   $location.path('/homepage');
                }
               });
}

$scope.addUser = function() {
  console.log("I added a user");
    $http.get('http://maps.google.com/maps/api/geocode/json?address=' + $scope.user.zipcode).success(function(mapData) {
      angular.extend($scope, mapData);
    $scope.user.lat = mapData.results[0].geometry.location.lat;
    $scope.user.lng = mapData.results[0].geometry.location.lng;
    });

  $scope.user.username = $rootScope.userprofile.username;
  $http.post('/openhouse', $scope.user).success(function(response) {
    console.log(response);
    $location.path('/homepage');
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
  console.log($scope.user._id);
  $http.put('/openhouse/' + $scope.user._id, $scope.user).success(function(response) {
    refresh();
  })
};

$scope.deselect = function() {
  $scope.user = "";
}

}]);﻿

myApp.controller('mapCtrl', ['$scope', '$http', '$rootScope', '$location', function($scope, $http, $rootScope, $location) {
var mapOptions = {
  zoom: 5,
  center: new google.maps.LatLng(24.886, -70.268),
  mapTypeId: google.maps.MapTypeId.ROADMAP
  }

  $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

  var triangleCoords = [
  {lat: 25.774, lng: -80.190},
  {lat: 18.466, lng: -66.118},
  {lat: 32.321, lng: -64.757}
  ];

  // Construct the polygon.
    var bermudaTriangle = new google.maps.Polygon({
    paths: triangleCoords,
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 3,
    fillColor: '#FF0000',
    fillOpacity: 0.35
    });
    
    bermudaTriangle.setMap($scope.map);



    var drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.MARKER,
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: ['marker', 'circle', 'polygon', 'polyline', 'rectangle']
        },

    markerOptions: {icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'},
        circleOptions: {
        fillColor: '#ffff00',
        fillOpacity: 1,
        strokeWeight: 5,
        clickable: true,
        editable: true,
        zIndex: 1
        }
    });

    // Add a listener for the click event.
    bermudaTriangle.addListener('click', showArrays);
    //userCreatedShape.addListener('click', showArrays);

    drawingManager.setMap($scope.map);

    var infoWindow = new google.maps.InfoWindow();




    function showArrays(event) {
        // Since this polygon has only one path, we can call getPath() to return the
        // MVCArray of LatLngs.
        var vertices = this.getPath();

        var contentString = 'Clicked location: <br>' + event.latLng.lat() + ',' + event.latLng.lng() +
            '<br>';

        // Iterate over the vertices.
        for (var i =0; i < vertices.getLength(); i++) {
          var xy = vertices.getAt(i);
          contentString += '<br>' + 'Coordinate ' + i + ':<br>' + xy.lat() + ',' +
              xy.lng();
        }

        // Replace the info window's content and position.
        infoWindow.setContent(contentString);
        infoWindow.setPosition(event.latLng);

        infoWindow.open($scope.map);
    }

}]);
