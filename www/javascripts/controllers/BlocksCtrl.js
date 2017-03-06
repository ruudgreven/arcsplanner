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
        $scope.filter = {
            text: undefined,
            phase: undefined,
            arcs:'',
            grouping:''
        };

        /**
         * Constructuro for the blockscontroller. Receive the blocks from the server
         */
        $scope.init = function() {
            $http({
                method: 'GET',
                url: '/api/blocks'
            }).then(function success(response) {
                $scope.blocks = response.data.blocks;
                $log.info("Retrieved blocks: " + $scope.blocks);
            }, function error(response) {
                $log.error("There was an error: " + response);
            });
        };

        $scope.setFilter = function(name, filtervalue) {
            if (name == 'text') {
                $scope.filter.text = filtervalue;
            } else if (name == 'phase') {
                $scope.filter.phase = filtervalue;
            } else if (name == 'arcs') {
                $scope.filter.arcs = filtervalue;
            } else if (name == 'grouping') {
                $scope.filter.grouping = filtervalue;
            }
        };

        $scope.applyFilter = function(block) {
            if ($scope.filter.text != undefined && block.title.indexOf($scope.filter.text) == -1) {
                return false;
            }
            if ($scope.filter.phase != undefined && block.phases.indexOf($scope.filter.phase) == -1) {
                return false;
            }
            return true;
        };

        $scope.convertToHtml = function(text) {
            return ConverterSvc.convertToHtml(text);
        }
    });