/**
 * Created by wasib & gourav on 31/12/17.
 */
dataApprovalApp
        .controller('homeController', function ($rootScope,
                                                $scope, $location) {
                $scope.applicationsForApproval = function () {
                        $location.path('/applications-for-approval').search();
                },
                        $scope.approvedList = function () {
                                $location.path('/approved-list').search();
                        },
                        $scope.rejectedList = function () {
                                $location.path('/rejected-list').search();
                        },
                        $scope.auditReport = function () {
                                $location.path('/audit-report').search();
                        };
        });
