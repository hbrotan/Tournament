(function () {
    'use strict';
	
    angular
        .module('app', [])
        .controller('controller', controller)
        .factory('dataservice', dataservice);
                
        controller.$inject = ['dataservice'];
        dataservice.$inject = ['$q','$http'];    
                                           
        function controller(dataservice) {
            var vm = this;
            
            vm.results = dataservice.getData();            
        }
        
        function dataservice($q, $http){
            return {
		        getData : _.memoize(getData)
            }
            
            function getData(id){     
                return $q(function(resolve, reject) {                        
                    $http.get('Resultat_16_05_2016.json')
                        .then(function(response){                        
                            resolve(response.data);
                        });
                });
            }           
        }    
})();