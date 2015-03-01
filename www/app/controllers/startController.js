game325.controller('startController', ['$http', '$scope', 'startGameService','$state', 'AuthService' ,'$window' , '$mdDialog', function ($http, $scope, startGameService, $state, AuthService, $window, $mdDialog){
//     AuthService.get().then(function(res){
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
    AuthService.get().then(function (data) {
        $scope.loggedinuser = data.data.user;
        // console.log(data.data.user);
       if(data.data.error){
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
          console.log(res);
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
    $scope.goToCover = function(){
      setTimeout(function(){
        $state.go('cover');
      }, 0);
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
game325.controller('coverController', ['$rootScope', '$http', '$scope', '$state', '$stateParams','AuthService', 'startGameService' ,'gameService', 'socket', '$timeout', 'delayService', '$mdSidenav', '$anchorScroll', '$location', '$mdDialog','$cookieStore','AUTH_EVENTS','Session', function ($rootScope, $http, $scope, $state, $stateParams, AuthService, startGameService, gameService, socket, $timeout ,delayService, $mdSidenav, $anchorScroll, $location, $mdDialog, $cookieStore, AUTH_EVENTS, Session){
  $scope.className='';
  $scope.showLoggedInOptions = false;

  $scope.start325Game = function(){
    setTimeout(function(){
      $state.go('home');
    },800)
    
  }
  $scope.changeClass = function(a){
    // $scope.className = 'expanded';
    if(a == 'game-325'){
      var req = {};
        if(Session.name && Session.type != 'local'){
          $scope.showLoggedInOptions = true;
        }else{
          startGameService.start(req).then(function(res){
            $state.go('game/:id', {id : res.data.roomId, type : res.data.type});      
          });
        }
    }
  }

  $scope.getGameLogo = function(className){
    var logoimg = '';
    var w = 80;
    var h = 80;
    var t = -40;

    switch(className){
      case 'aboutus':
        logoimg = 'about-us.png';
        w = 120;
        h = 120;
        break;
      case 'leaderboard':
        logoimg = 'leaderboard.png';
        w= 200;
        h= 200;
        break;
      case 'game-325':
        logoimg = '325img.svg';
        w = 200;
        h = 200;
        break;
      case 'game-hearts':
        logoimg = 'hearts.png';
        break;
      case 'game-29':
        logoimg = 'game-29.png';
        w = 120;
        h = 120;
        break;
      case 'game-7':
        logoimg = 'satti-center.png';
        break;  
      case 'game-10pakad':
        logoimg = '10-pakad.png';
        w = 120;
        h = 120;
        break;
      case 'game-a':
        logoimg = 'game-stats.png';
        w = 100;
        h = 100;
        break;
      case 'game-c':
        logoimg = 'discuss.png';
        w = 120;
        h = 120;
        break;
      case 'game-b':
        logoimg = 'demand.png';
        break;
      default: 
        logoimg = 'ankit.jpg';
        w = 80;
        h = 80;
        t = 0;
        break;
    }
    logoimg = '../../assets/img/' + logoimg;
    if(window.innerWidth < 700 || window.innerHeight < 500){
      w = w/2;
      h = h/2;
      t = t/2;
    }
    return{
      'background-image' : 'url('+logoimg+')',
      'width' : w+'px',
      'height' : h + 'px',
      'top' : t + 'px'
    }
  }
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
    AuthService.get().then(function (data) {
        $scope.loggedinuser = data.data.user;
       if(data.data.error){
       }else{
           // socket.emit('joinRoom', {roomId : $scope.gameId});        
       }
    });
    $scope.startGame = function(){
        var req = {};
        startGameService.start(req).then(function(res){
          console.log(res);
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
            '</md-content></md-dialog>',
            controller: 'errDialogController'
        });
      }
    }
  $scope.loggedIn = false;
  $scope.profile = {
      name : '',
      image : '',
      backgroundPosition : ''
  }
  if(Session.name){
    $scope.profile.name = Session.name;
    $scope.loggedIn = true;
  }
  if(Session.type == 'local'){
    $scope.profile.image = '/assets/img/avatars.png';
    $scope.profile.backgroundPosition = 45*Session.image+'px 0px';
  }else{
    $scope.profile.image = Session.image;
    $scope.profile.backgroundPosition = '50% 50%';
  }
  $scope.showProfile = function(){
    var id = $cookieStore.get('userId');
    id = JSON.parse(id);
    if(id.type == 'local'){
      $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
    }
  }
}]);
