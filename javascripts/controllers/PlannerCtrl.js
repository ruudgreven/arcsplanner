'use strict';

/**
 * @ngdoc function
 * @name arcsplannerApp.controller:BlocksCtrl
 * @description
 * # BlocksCtrl
 * Controller of the blocks
 */
angular.module('arcsplannerApp')
    .controller('PlannerCtrl', function ($scope, $http, $log, config) {
        $scope.blocks = [];

        $scope.allowDrop = function(ev) {
            console.log("woop");
        };
    });