/**
 * Created by wasib & gourav on 31/12/17.
 */

var dataApprovalApp = angular.module('dataApprovalApp', ['ui.bootstrap',
    'ngRoute',
    'ngCookies',
    'ngSanitize',
    'ngMessages',
    'd2HeaderBar',
    'd2Directives',
    'd2Filters',
    'd2Services',
    'pascalprecht.translate',
    'trackerReportsAppServices'
])

    .config(function ($routeProvider, $translateProvider) {
        $routeProvider.when('/', {
            templateUrl: 'views/home.html',
            controller: 'homeController'
        }).when('/applications-for-approval', {
            templateUrl: 'views/applications-for-approval.html',
            controller: 'ApplicationsForApprovalController'

        }).when('/approved-list', {
            templateUrl: 'views/approved-list.html',
            controller: 'ApprovedListController'

        }).when('/audit-report', {
            templateUrl: 'views/audit-report.html',
            controller: 'AuditReportController'

        }).when('/rejected-list', {
            templateUrl: 'views/rejected-list.html',
            controller: 'RejectedListController'

        }).otherwise({
            redirectTo: '/'
        });

        $translateProvider.preferredLanguage('en');
        $translateProvider.useSanitizeValueStrategy('escaped');
        $translateProvider.useLoader('i18nLoader');

    });

