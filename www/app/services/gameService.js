game325.factory('gameService', ['$http', function($http){
    return {
        play : function(req){
            return $http.post(apiPrefix + 'game', { data : req });
        }
    }
}]);