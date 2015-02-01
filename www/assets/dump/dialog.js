(function(angular, undefined){
  "use strict";
  angular
    .module('demoApp', ['ngMaterial'])
    .controller('EmployeeController', EmployeeEditor)
    .controller('GreetingController', GreetingController);
  // Fictitious Employee Editor to show how to use simple and complex dialogs.
  function EmployeeEditor($scope, $mdDialog) {
    var alert;
    $scope.showAlert = showAlert;
    $scope.closeAlert = closeAlert;
    $scope.showGreeting = showCustomGreeting;
    $scope.hasAlert = function() { return !!alert };
    $scope.userName = $scope.userName || 'Bobby';
    // Dialog #1 - Show simple alert dialog and cache
    // reference to dialog instance
    function showAlert() {
      alert = $mdDialog.alert()
        .title('Attention, ' + $scope.userName)
        .content('This is an example of how easy dialogs can be!')
        .ok('Close');
      $mdDialog
          .show( alert )
          .finally(function() {
            alert = undefined;
          });
    }
    // Close the specified dialog instance and resolve with 'finished' flag
    // Normally this is not needed, just use '$mdDialog.hide()' to close
    // the most recent dialog popup.
    function closeAlert() {
      $mdDialog.hide( alert, "finished" );
      alert = undefined;
    }
    // Dialog #2 - Demonstrate more complex dialogs construction and popup.
    function showCustomGreeting($event) {
        $mdDialog.show({
          targetEvent: $event,
          template:
            '<md-dialog>' +
            '  <md-content>Hello {{ employee }}!</md-content>' +
            '  <div class="md-actions">' +
            '    <md-button ng-click="closeDialog()">' +
            '      Close Greeting' +
            '    </md-button>' +
            '  </div>' +
            '</md-dialog>',
          controller: 'GreetingController',
          onComplete: afterShowAnimation,
          locals: { employee: $scope.userName }
        });
        // When the 'enter' animation finishes...
        function afterShowAnimation(scope, element, options) {
           // post-show code here: DOM element focus, etc.
        }
    }
  }
  // Greeting controller used with the more complex 'showCustomGreeting()' custom dialog
  function GreetingController($scope, $mdDialog, employee) {
    // Assigned from construction <code>locals</code> options...
    $scope.employee = employee;
    $scope.closeDialog = function() {
      // Easily hides most recent dialog shown...
      // no specific instance reference is needed.
      $mdDialog.hide();
    };
  }
})(angular);