
var app = angular.module('tradex', 
                        [ 
                          'ui.router',
                        ]);


app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

	$urlRouterProvider.otherwise('/');

	$stateProvider
    .state('home', {
      url: '/',
      views:{
        'mainLayout' : {
          templateUrl: 'js/app/views/home.html',
          controller: 'homeController'
        },
            
      }
    });

  $locationProvider.html5Mode(true);
  

});

