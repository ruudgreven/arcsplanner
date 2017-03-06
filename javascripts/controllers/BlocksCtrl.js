'use strict';

/**
 * @ngdoc function
 * @name arcsplannerApp.controller:BlocksCtrl
 * @description
 * # BlocksCtrl
 * Controller of the blocks
 */
angular.module('arcsplannerApp')
    .controller('BlocksCtrl', function ($scope, $http, $log, ConverterSvc, config) {
        $scope.blocks = [];

        $http({
            method: 'GET',
            url: '/api/blocks'
        }).then(function success(response) {
            $scope.blocks = response.data.blocks;
            $log.info("Retrieved blocks: " + $scope.blocks);
        }, function error(response) {
            $log.error("There was an error: " + response);
        });

        $scope.convertToHtml = function(text) {
            return ConverterSvc.convertToHtml(text);
        }
    });