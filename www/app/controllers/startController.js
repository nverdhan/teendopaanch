game325.controller('startController', ['$http', '$scope', 'startGameService','$state', 'authService' ,'$window', function ($http, $scope, startGameService, $state, authService, $window){
//     authService.get().then(function(res){
//        console.log(res);
//         if(res.data.error == "401"){
//             $scope.authorized = false;
//         }else if(res.data.user){
//          $stateProvider.state('start');
//            $state.go('start');
//         }
//     });
    $scope.joinGameRoomId = '';
    console.log($state.current.name);
    $scope.showStartGame = false;
    $scope.showCreateGame = false;
    $scope.showJoinGame = false;
    if($state.current.name == 'start'){
        $scope.showStartGame = true;
    }
    if($state.current.name == 'create'){
        $scope.showCreateGame = true;
    }
    if($state.current.name == 'join'){
        $scope.showJoinGame = true;
    }
    $scope.loading = false;
    // $scope.twitterAuth = function(){
    //     $window.location.href = "http://127.0.0.1:3000/auth/twitter"
    // }
    $scope.startGame = function(){
        var req = {};
        startGameService.start(req).then(function(res){
          $state.go('game/:id', {id : res.data.roomId, type : res.data.type});      
        });
    }
    $scope.createGame = function(){
        var req = {};
        startGameService.create(req).then(function(res){
            console.log(res.data)
          $state.go('game/:id/:type', {id : res.data.roomId, type : res.data.type});      
        });
    }
    $scope.joinGame = function(){
        var req = {
            roomId : $scope.joinGameRoomId
        };
        startGameService.join(req).then(function(res){
            console.log(res.data)
            if(res.data.error)
                alert('invalid room');return false;
          $state.go('game/:id/:type', {id : res.data.roomId, type : res.data.type});      
        });
    }
}]);