(function () {
    'use strict';
	
    angular
        .module('app', ['ngRoute'])
        .config(appConfig)
        .controller('controller', controller)
        .factory('dataservice', dataservice);
                
        controller.$inject = ['$rootScope', '$location', 'dataservice'];
        dataservice.$inject = ['$q','$http'];    

	function appConfig($routeProvider, $locationProvider){
		$locationProvider.html5Mode(true);	
	}

        function controller($rootScope, $location, dataservice) {
            var vm = this;
            
            getDataBasedOnRouteParams();
            registerEventHandlers();
            
            function registerEventHandlers(){
                $rootScope.$on('$locationChangeSuccess', function () {
        		getDataBasedOnRouteParams();
    		});
            }
            
            function getDataBasedOnRouteParams(){
	            vm.league = $location.path().split('/')[1];
	           
	           
	           
	            if (vm.league){
	                dataservice.getResultForLeague(vm.league)
	                    .then(function(data){
	                            vm.results = angular.fromJson(data[0].Result);
					vm.calculated = data[0].CalculatedAt;
	                        });;
	            } else{
	                dataservice.getLeagues()
	                    .then(function(data){
	                        vm.leagues = data;
	                    });
	            }     
            }
        }
        
        function dataservice($q, $http){
            return {
                getLeagues : _.once(getLeagues),
		        getResultForLeague : _.memoize(getResultForLeague)
            }
            
            function getLeagues(league){     
                return $q(function(resolve, reject) {                        
                    $http.get('http://tournament.azurewebsites.net/api/tournament/EM2016/league')
                        .then(function(response){                        
                            resolve(response.data);
                        });
                });
            } 
            
            function getResultForLeague(league){     
                return $q(function(resolve, reject) {                        
                    $http.get('http://tournament.azurewebsites.net/api/tournament/EM2016/league/' + league +'/result')
                        .then(function(response){                        
                            resolve(response.data);
                        });
                });
            }           
        }    
})();
