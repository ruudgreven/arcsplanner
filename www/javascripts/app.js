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
        'ui.router'
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
                    }
                }
            });
    }).constant('config', {

    });