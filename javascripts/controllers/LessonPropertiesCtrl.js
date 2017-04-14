'use strict';

/**
 * @ngdoc function
 * @name arcsplannerApp.controller:LessonPropertiesCtrl
 * @description
 * # LessonPropertiesCtrl
 * Controller of the blocks
 */
angular.module('arcsplannerApp')
    .controller('LessonPropertiesCtrl', function ($scope, $log, PlanSvc, $window) {
        $scope.lessonTime = undefined;

        $scope.init = function() {
            $scope.lessonTime = PlanSvc.getLessonDuration();
        };

        $scope.save = function() {
            PlanSvc.clearPlan();
            PlanSvc.setLessonDuration($scope.lessonTime);
            PlanSvc.saveProperties();
            $window.location.reload();
        }
    });