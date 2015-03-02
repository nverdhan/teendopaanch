game325.factory('gameService', ['$http', function($http){
    return {
        play : function(req){
            return $http.post(apiPrefix + 'game', { data : req });
        }
    }
}]);
game325.factory('errService',['$mdDialog', function($mdDialog){
	return {
		showErrSimple : function(errmsg) {
	         $mdDialog.show({
	          template:
	            '<md-dialog>' +
	            '    <md-button style="background-color: rgba(241,103,103,1)!important" ng-click="closeDialog()" aria-label="closedialog">' +
	            '      <i class="fa fa-times" style="float:right;"></i>' +
	            '    </md-button>' +
	            '  <md-content>' +
	            errmsg+
	            // '  <div class="md-actions">' +
	            
	            // '  </div>' +
	            '</md-content></md-dialog>',
	            controller: 'errDialogController'
	        });
	    }

	}
}])