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
        'ngAnimate',
        'ui.bootstrap',
        'ngSanitize',
        'angular-timeline',
        'ui.router',
        'ngVis',
        'ngDraggable',
        'angular-google-analytics',
        'chart.js',
        'LocalStorageModule'
    ]).config(function ($stateProvider) {
        $stateProvider
            .state('planner',{
                url: '',
                views: {
                    'planner': {
                        templateUrl: 'views/planner/planner.html',
                        controller: 'PlannerCtrl'
                    },
                    'selector': {
                        templateUrl: 'views/planner/selector.html',
                        controller: 'BlocksCtrl',
                    },
                    'timeline': {
                        templateUrl: 'views/planner/timeline.html',
                        controller: 'TimelineCtrl'
                    },
                    'stats': {
                        templateUrl: 'views/planner/stats.html',
                        controller: 'StatsCtrl'
                    }
                }
            });
    }).constant('config', {

    }).config(['AnalyticsProvider', function (AnalyticsProvider) {
        // Add configuration code as desired
        AnalyticsProvider.setAccount(ANALYTICS_ID);
    }]).config(function (localStorageServiceProvider) {
        localStorageServiceProvider.setPrefix('arcsplanner')
    }).run(['Analytics', function(Analytics) { }]);;