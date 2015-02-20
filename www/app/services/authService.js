game325.factory('AuthService', ['$http','$rootScope', 'Session','$window','$cookieStore', function ($http, $rootScope, Session, $window, $cookieStore){
    var authService = {};
    authService.register = function(credentials){
    	return $http.post(apiPrefix+'/register', credentials)
    				.then(function (res){
    					if(res.data.status == 'success'){
    						Session.create(res.data.user.id, res.data.user.name, res.data.user.img);
    					}
    					return res.data;
    				})
    }
    authService.login = function (credentials){
    	return $http.post(apiPrefix + '/login', credentials)
    				.then(function (res){
    					if(res.data.status == 'success'){
    						Session.create(res.data.user.id, res.data.user.name, res.data.user.img);
    					}
    					return res.data;	
    				})
    }
    authService.logout = function(){
    	return $http.post(apiPrefix+'/logout')
    				.then(function (res){
    					if (res.data.status == true) {
    						Session.destroy();
    					};
    					return res;
    				})
    }
    authService.getCredentials = function (credentials){
    	return $http.post(apiPrefix + '/getCredentials', credentials)
    				.then(function (res){
    					var res = res.data;
    					return res;
    				})
    }
    authService.isAuthenticated = function(){
    	console.log($cookieStore.get('userid'));
    	if($cookieStore.get('userId') != 'anon'){
    		return true;
    	}else{
    		return false;
    	}
    }
   	authService.get  =  function(){
            return $http.post(apiPrefix + 'auth');
        }
    return authService;
}]);
game325.service('Session', function (){
	this.create = function(id, name, image, type){
		this.id = id;
		this.name = name;
		this.image = image;
		this.type = type;
	}
	this.destroy = function(){
		this.id = null;
		this.name = null;
		this.image = null;
		this.type = null;	
	}
	return this;
})