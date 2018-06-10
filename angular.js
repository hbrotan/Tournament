(function () {
    'use strict';

    angular
        .module('app', ['ngRoute'])
        .config(appConfig)
        .controller('controller', controller)
        .factory('dataservice', dataservice);

    controller.$inject = ['$rootScope', '$location', 'dataservice'];
    dataservice.$inject = ['$q', '$http'];

    function appConfig($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
    }

    function controller($rootScope, $location, dataservice) {
        var vm = this;
        vm.isBusy = true;

        getDataBasedOnRouteParams();
        registerEventHandlers();

        function registerEventHandlers() {
            $rootScope.$on('$locationChangeSuccess', function () {
                getDataBasedOnRouteParams();
            });
        }

        function getDataBasedOnRouteParams() {
			vm.tournament = $location.path().split('/')[1];
            vm.league = $location.path().split('/')[2];

            if (vm.tournament && vm.league) {
                dataservice.getResultForLeague(vm.tournament, vm.league)
                    .then(function (data) {
                        vm.results = angular.fromJson(data[0].Result);
                        vm.calculated = data[0].CalculatedAt;
                    })
                    .finally(function(){
                        vm.isBusy = false;
                    });
            } else if (vm.tournament){
                dataservice.getLeaguesForTournament(vm.tournament)
                    .then(function (data) {
                        vm.leagues = data;
                    })
                    .finally(function(){
                        vm.isBusy = false;
                    });;
            }
			else {
				vm.isBusy = false;
			}
        }
    }

    function dataservice($q, $http) {
        return {
            getLeaguesForTournament: _.memoize(getLeaguesForTournament),
            getResultForLeague: _.memoize(getResultForLeague)
        }

        function getLeaguesForTournament(tournament) {
            return $q(function (resolve, reject) {
                $http.get('http://tournament.azurewebsites.net/api/tournament/' + tournament + '/league')
                    .then(function (response) {
                        resolve(response.data);
                    });
            });
        }

        function getResultForLeague(tournament, league) {
            return $q(function (resolve, reject) {
                $http.get('http://tournament.azurewebsites.net/api/tournament/' + tournament + '/league/' + league + '/result')
                    .then(function (response) {
                        resolve(response.data);
                    });
            });
        }
    }
})();
