'use strict';

/**
 * @ngdoc function
 * @name arcsplannerApp.controller:TimelineCtrl
 * @description
 * # TimelineCtrl
 * Controller of the blocks
 */
angular.module('arcsplannerApp')
    .controller('TimelineCtrl', function ($scope, $http, $log, PlanSvc, ConverterSvc) {
        $scope.timeline = PlanSvc.getTimeline();

        $scope.$on( 'plan.changed', function( event ) {
            $scope.timeline = PlanSvc.getTimeline();
            $scope.$apply();
        });

        $scope.getLabel = function(event) {
            return ConverterSvc.convertToPrettyTime(event.startTimeMinutes) + ' - ' + ConverterSvc.convertToPrettyTime(event.endTimeMinutes);
        };

        /**
         * Converts the given markdown to HTML.
         * @param text
         */
        var convertToHtml = function(text) {
            return ConverterSvc.convertToHtml(text);
        };
    });