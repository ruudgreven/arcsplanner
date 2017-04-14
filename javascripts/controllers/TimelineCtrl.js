'use strict';

/**
 * @ngdoc function
 * @name arcsplannerApp.controller:TimelineCtrl
 * @description
 * # TimelineCtrl
 * Controller of the blocks
 */
angular.module('arcsplannerApp')
    .controller('TimelineCtrl', function ($scope, $http, $log, $window, PlanSvc, ConverterSvc) {
        $scope.timeline = PlanSvc.getTimeline();
        $scope.showinfo = {
            "summary": false,
            "preparation": true,
            "description": true,
            "content": true
        };
        $scope.currenteditevent = undefined;

        $scope.$on( 'plan.changed', function( event ) {
            $scope.timeline = PlanSvc.getTimeline();
            if(!$scope.$$phase) {
                $scope.$apply();
            }
        });
        
        $scope.getLabel = function(event) {
            return ConverterSvc.convertToPrettyTime(event.startTimeMinutes) + ' - ' + ConverterSvc.convertToPrettyTime(event.endTimeMinutes);
        };

        $scope.setEditEvent = function(event) {
            $scope.currenteditevent = event;
        };

        $scope.saveEditEvent = function() {
            $scope.currenteditevent = undefined;
        };

        /**
         * Converts the given markdown to HTML.
         * @param text
         */
        $scope.convertToHtml = function(text) {
            return ConverterSvc.convertToHtml(text);
        };
    });