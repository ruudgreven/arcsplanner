'use strict';

/**
 * @ngdoc function
 * @name arcsplannerApp.controller:TimelineCtrl
 * @description
 * # TimelineCtrl
 * Controller of the blocks
 */
angular.module('arcsplannerApp')
    .controller('TimelineCtrl', function ($scope, $http, $log, config) {
        $scope.blocks = [];

        $http({
            method: 'GET',
            url: '/api/blocks'
        }).then(function success(response) {
            $scope.blocks = response.data.blocks;
            $log.info("Retrieved blocks for timeline: " + $scope.blocks);
        }, function error(response) {
            $log.error("There was an error: ");
        });
    });