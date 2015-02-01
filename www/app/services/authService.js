game325.factory('authService', ['$http', function($http){
    return {
        get : function(){
            return $http.post(apiPrefix + 'auth');
        }
    }
}])