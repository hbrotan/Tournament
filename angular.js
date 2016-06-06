(function () {
    'use strict';
	
    angular
        .module('app', ['ngRoute'])
        .controller('controller', controller)
        .factory('dataservice', dataservice);
                
        controller.$inject = ['$routeParams', 'dataservice'];
        dataservice.$inject = ['$q','$http'];    
                                           
        function controller($routeParams, dataservice) {
            var vm = this;
            vm.league = $routeParams.param1;
           
            if (vm.league){
                dataservice.getResultForLeague(vm.league)
                    .then(function(data){
                            vm.results = data;
                        });;
            } else{
                dataservice.getLeagues()
                    .then(function(data){
                        vm.leagues = data;
                    });
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