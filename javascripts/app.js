'use strict';

/**
 * @ngdoc overview
 * @name arcsplannerApp
 * @description
 * # arcsplanner
 *
 * Main module of the application.
 */
angular
    .module('arcsplannerApp', [
        'ngSanitize',
        'angular-timeline',
        'ui.router',
        'ngVis',
        'ngDraggable',
        'angular-google-analytics',
        'chart.js'
    ]).config(function ($stateProvider) {
        $stateProvider
            .state('planner',{
                url: '',
                views: {
                    'planner': {
                        templateUrl: 'views/planner/planner.phtml',
                        controller: 'PlannerCtrl'
                    },
                    'selector': {
                        templateUrl: 'views/planner/selector.phtml',
                        controller: 'BlocksCtrl',
                    },
                    'timeline': {
                        templateUrl: 'views/planner/timeline.phtml',
                        controller: 'TimelineCtrl'
                    },
                    'stats': {
                        templateUrl: 'views/planner/stats.phtml',
                        controller: 'StatsCtrl'
                    }
                }
            });
    }).constant('config', {

    }).config(['AnalyticsProvider', function (AnalyticsProvider) {
        // Add configuration code as desired
        AnalyticsProvider.setAccount(ANALYTICS_ID);
    }]).run(['Analytics', function(Analytics) { }]);;