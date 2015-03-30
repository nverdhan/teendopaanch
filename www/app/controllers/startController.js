// game325.controller('startController', ['$http', '$scope', 'startGameService','$state', 'AuthService' ,'$window' , '$mdDialog', function ($http, $scope, startGameService, $state, AuthService, $window, $mdDialog){
game325.controller('startController', ['$rootScope', '$http', '$scope', '$state', '$stateParams','AuthService', 'startGameService' ,'gameService', 'socket', '$timeout', 'delayService', '$mdSidenav', '$anchorScroll', '$location', '$mdDialog','$cookieStore','AUTH_EVENTS','Session', 'errService', function ($rootScope, $http, $scope, $state, $stateParams, AuthService, startGameService, gameService, socket, $timeout ,delayService, $mdSidenav, $anchorScroll, $location, $mdDialog, $cookieStore, AUTH_EVENTS, Session, errService){
//     AuthService.get().then(function(res){
//        console.log(res);
//         if(res.data.error == "401"){
//             $scope.authorized = false;
//         }else if(res.data.user){
//          $stateProvider.state('start');
//            $state.go('start');
//         }
//     });
    // $scope.showLoggedInOptions = false;

    $scope.joinGameRoomId = '';
    $scope.showStartGame = false;
    $scope.showCreateGame = false;
    $scope.showJoinGame = false;
    $scope.showLoggedInOptions = $rootScope.showLoggedInOptions;
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
    $scope.changeClass = function(a){
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
    $scope.startGame = function(e){
        if(e == 'bots'){
          $state.go('game325');
        }else{
          startGameService.start(req).then(function(res){
            $state.go('game/:id', {id : res.data.roomId, type : res.data.type});
          });
        }
        
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
      }, 100);
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

game325.controller('errDialogController',['$scope', '$mdDialog', '$state', function($scope, $mdDialog, $state){
    $scope.closeDialog = function(){
            $mdDialog.hide();
        };
    $scope.goToHome = function(){
            $mdDialog.hide();
            $state.go('home');
    }
}])
game325.controller('coverController', ['$rootScope', '$http', '$scope', '$state', '$stateParams','AuthService', 'startGameService' ,'gameService', 'socket', '$timeout', 'delayService', '$mdSidenav', '$anchorScroll', '$location', '$mdDialog','$cookieStore','AUTH_EVENTS','Session', 'errService', function ($rootScope, $http, $scope, $state, $stateParams, AuthService, startGameService, gameService, socket, $timeout ,delayService, $mdSidenav, $anchorScroll, $location, $mdDialog, $cookieStore, AUTH_EVENTS, Session, errService){
  $scope.className='';
  $scope.showLoggedInOptions  = false;
  $scope.showGame325 = false;

  $scope.getWinContainerHeight = function(){
    var h = window.innerHeight - 100;
    return {
            'height' : h
    }
  }
  $scope.start325Game = function(){
    $scope.showGame325 = true; 
    if(Session.name && Session.type != 'local'){
          $rootScope.showLoggedInOptions = true;
        }else{
          $rootScope.showLoggedInOptions = false;
        }
    $scope.showLoggedInOptions = $rootScope.showLoggedInOptions;
    setTimeout(function(){
      $state.go('home');
    },800)
    
  }
  // $scope.changeClass = function(a){
  //   // $scope.className = 'expanded';
  //   if(a == 'game-325'){
  //     var req = {};
  //       if(Session.name && Session.type != 'local'){
  //         $scope.showLoggedInOptions = true;
  //       }else{
  //         startGameService.start(req).then(function(res){
  //           $state.go('game/:id', {id : res.data.roomId, type : res.data.type});      
  //         });
  //       }
  //   }
  // }
  // $scope.logOut = function(){
  //       Session.destroy();
  //       $cookieStore.put('userId', 'anon');
  //       $window.location.href = '/';
  // }

  $scope.getGameLogo = function(className){
    var logoimg = '';
    var w = 96;
    var h = 96;
    var t = -40;

    switch(className){
      case 'aboutus':
        logoimg = 'about-us.png';
        w = 50;
        h = 50;
        break;
      case 'leaderboard':
        logoimg = 'leaderboard.png';
        w= 50;
        h= 50;
        break;
      case 'game-325':
        logoimg = '325.png';
        w = 144;
        h = 144;
        break;
      case 'game-hearts':
        logoimg = 'hearts.png';
        break;
      case 'game-29':
        logoimg = '29.png';
        break;
      case 'game-7':
        logoimg = '7centre.png';
        break;  
      case 'game-10pakad':
        logoimg = '10pakad.png';
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
      case 'game-on-demand':
        logoimg = 'demand.png';
        w = 50;
        h = 50;
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
    $scope.startGame = function(e){
        var req = {
          gameType : e
        };
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
