game325.service('startGameService', ['$http', function ($http){
    return {
            start : function(req){
            	return $http.post(apiPrefix+'start', {data : req});
        	},
        	create : function(req){
            	return $http.post(apiPrefix+'create', {data : req});
        	},
        	join : function (req) {
        		return $http.post(apiPrefix+'join', {data : req});
        	}
    } 
}]);