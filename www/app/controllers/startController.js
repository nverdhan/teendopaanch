game325.controller('startController', ['$http', '$scope', 'startGameService','$state', 'authService' ,'$window' , '$mdDialog', function ($http, $scope, startGameService, $state, authService, $window, $mdDialog){
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
    authService.get().then(function (data) {
        $scope.loggedinuser = data.data.user;
        // console.log(data.data.user);
       if(data.data.error){
           console.log(123);
       }else{
           // socket.emit('joinRoom', {roomId : $scope.gameId});        
       }
    });
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
        console.log(req);
        startGameService.join(req).then(function(res){
            console.log(res.data)
            if(res.data.error){
                $scope.roomerror();
                return false;
            }
          $state.go('game/:id/:type', {id : res.data.roomId, type : res.data.type});      
        });
        $scope.roomerror = function(ev) {
         $mdDialog.show({
          template:
            '<md-dialog>' +
            '    <md-button style="background-color: rgba(241,103,103,1)!important" ng-click="closeDialog()" aria-label="closedialog">' +
            '      <i class="fa fa-times" style="float:right;"></i>' +
            '    </md-button>' +
            '  <md-content>Invalid Room!' +
            // '  <div class="md-actions">' +
            
            // '  </div>' +
            '</md-content></md-dialog>',
            controller: 'errDialogController'
        });
    }
        

    }
        $scope.toggleScores = function(ev){
        // if($scope.showScores == false){
        //     $scope.showScores = true;
        // }else{
        //     $scope.showScores = false;
        // }
         $mdDialog.show({
          // template:
          //   '<md-dialog>' +
          //   '    <md-button style="background-color: rgba(241,103,103,1)!important" ng-click="closeDialog()">' +
          //   '      <i class="fa fa-times" style="float:right;"></i>' +
          //   '    </md-button>' +
          //   '  <md-content>Invalid Room!' +
          //   // '  <div class="md-actions">' +
            
          //   // '  </div>' +
          //   '</md-content></md-dialog>',
            templateUrl: 'app/templates/scoredialog.html',
            controller: 'scoreDialogController'
        });
    }
}]);

game325.controller('errDialogController',['$scope', '$mdDialog', function($scope, $mdDialog){
    $scope.closeDialog = function(){
            $mdDialog.hide();
        };
}])
game325.controller('coverController', ['$rootScope', '$http', '$scope', '$state', '$stateParams','authService', 'gameService', 'socket', '$timeout', 'delayService', '$mdSidenav', '$anchorScroll', '$location', '$mdDialog', function ($rootScope, $http, $scope, $state, $stateParams, authService, gameService, socket, $timeout ,delayService, $mdSidenav, $anchorScroll, $location, $mdDialog){

  
}])