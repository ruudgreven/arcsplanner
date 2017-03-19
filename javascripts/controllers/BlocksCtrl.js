'use strict';

/**
 * @ngdoc function
 * @name arcsplannerApp.controller:BlocksCtrl
 * @description
 * # BlocksCtrl
 * Controller of the blocks
 */
angular.module('arcsplannerApp')
    .controller('BlocksCtrl', function ($scope, $http, $log, ConverterSvc, PlanSvc, config) {
        $scope.blocks = [];
        $scope.allblocks = [];
        $scope.filter = {
            text: undefined,
            phase: undefined,
            arcs: undefined,
            grouping: undefined
        };
        $scope.activeBlock = undefined;

        /**
         * Constructur for the blockscontroller. Receive the blocks from the server
         */
        $scope.init = function() {
            clearBlocks();
            $http({
                method: 'GET',
                url: '/api/blocks'
            }).then(function success(response) {
                $scope.allblocks = response.data.blocks;

                //Convert all text to markdown
                $scope.allblocks.forEach(function(block) {
                    block.summary = convertToHtml(block.summary);
                    block.preparation = convertToHtml(block.preparation);
                    block.description = convertToHtml(block.description);
                    block.source = convertToHtml(block.source);
                });

                addBlocks($scope.allblocks);
                $log.info('(BlocksCtrl): Retrieved ' + $scope.allblocks.length + ' blocks');
            }, function error(response) {
                $log.error('(BlocksCtrl): There was an error: ' + response);
            });
        };

        /**
         * Listen to changes in filter.text and apply filter when changed
         */
        $scope.$watch('filter.text', function() {
            applyFilter();
        });

        /**
         * Set a filter for the blocks
         * @param name Choose one of 'text', 'phase', 'arcs' or 'grouping'
         * @param filtervalue The value for the filter.
         */
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
            applyFilter();
        };

        /**
         * Checks if there is a filter on the given name
         * @param name Choose one of 'text', 'phase', 'arcs' or 'grouping'
         * @returns {boolean} true when there is filter, false when not
         */
        $scope.hasFilterOn = function(name) {
            if (name == 'text') {
                return $scope.filter.text != undefined;
            } else if (name == 'phase') {
                return $scope.filter.phase != undefined;
            } else if (name == 'arcs') {
                return $scope.filter.arcs != undefined;
            } else if (name == 'grouping') {
                return $scope.filter.grouping != undefined;
            }
        };

        /**
         * Remove the filter with the given name
         * @param name
         */
        $scope.removeFilter = function(name) {
            if (name == 'text') {
                $scope.filter.text = undefined;
            } else if (name == 'phase') {
                $scope.filter.phase = undefined;
            } else if (name == 'arcs') {
                $scope.filter.arcs = undefined;
            } else if (name == 'grouping') {
                $scope.filter.grouping = undefined;
            }
            applyFilter();
        };

        /**
         * Marks a block as active. (After clicked on it)
         * @param block
         */
        $scope.toggleActiveBlock = function(block) {
            if ($scope.activeBlock == block) {
                $log.info('(BlocksCtrl): Remove active block');
                $scope.activeBlock = undefined;
            } else {
                $log.info('(BlocksCtrl): Set active block to ' + block.title);
                $scope.activeBlock = block;
            }
        };

        /**
         * Returns a description for the footer of the block
         * @param block
         */
        $scope.getFooterDescription = function(block) {
            var mesg = ''
            if (block.phases.indexOf('S') !== -1 && block.phases.indexOf('C') !== -1 && block.phases.indexOf('E') !== -1) {
                mesg += 'Overal in de les';
            } else if (block.phases.indexOf('S') !== -1 && block.phases.indexOf('C') !== -1 && block.phases.indexOf('E') === -1) {
                mesg += 'Begin of midden v/d les';
            } else if (block.phases.indexOf('S') !== -1 && block.phases.indexOf('C') === -1 && block.phases.indexOf('E') !== -1) {
                mesg += 'Begin of einde v/d les';
            } else if (block.phases.indexOf('S') !== -1 && block.phases.indexOf('C') === -1 && block.phases.indexOf('E') === -1) {
                mesg += 'Begin v/d les';
            } else if (block.phases.indexOf('S') === -1 && block.phases.indexOf('C') !== -1 && block.phases.indexOf('E') !== -1) {
                mesg += 'Midden of einde v/d les';
            } else if (block.phases.indexOf('S') === -1 && block.phases.indexOf('C') !== -1 && block.phases.indexOf('E') === -1) {
                mesg += 'Midden v/d les';
            } else if (block.phases.indexOf('S') === -1 && block.phases.indexOf('C') === -1 && block.phases.indexOf('E') !== -1) {
                mesg += 'Einde v/d les';
            }

            if (block.phases.indexOf('+') !== -1) {
                if (mesg != '') {
                    mesg += ', energizer'
                } else {
                    mesg = "energizer"
                }
            }
            if (block.phases.indexOf('-') !== -1) {
                if (mesg != '') {
                    mesg += ', de-energizer'
                } else {
                    mesg = "de-energizer"
                }
            }
            if (block.phases.indexOf('H') !== -1) {
                if (mesg != '') {
                    mesg += ', EHBD'
                } else {
                    mesg = "EHBD"
                }
            }

            mesg = mesg + ', <strong>' + block.time[0] + '</strong> tot <strong>' + block.time[1] + '</strong> minuten';

            return mesg;
        };

        /**
         * Add drag handler
         * @param data
         * @param evt
         */
        $scope.onStartDrag = function(data, evt) {
            console.log("drag success, data:", data);
        };

        /**
         * Converts the given markdown to HTML.
         * @param text
         */
        var convertToHtml = function(text) {
            return ConverterSvc.convertToHtml(text);
        };


        /**
         * Add the given blocks to the list of blocks
         * @param nwBlocks
         */
        var addBlocks = function(nwBlocks) {
            var counter = 0;
            nwBlocks.forEach(function(block) {
                $scope.blocks[counter%3].push(block);
                counter++;
            })
        };

        /**
         * Remove all blocks
         */
        var clearBlocks = function() {
            $scope.blocks[0] = [];
            $scope.blocks[1] = [];
            $scope.blocks[2] = [];
        };

        /**
         * Applies the current filter
         */
        var applyFilter = function() {
            var removeIds = [];

            for (var i = 0; i < $scope.allblocks.length; i++) {
                var block = $scope.allblocks[i];
                if ($scope.filter.text != undefined && $scope.filter.text != '' && block.title.toLowerCase().indexOf($scope.filter.text.toLowerCase()) == -1) {
                    if (removeIds.indexOf(i) == -1) {
                        removeIds.push(i);
                    }
                }

                //Check the phase list for a string in the filter.phase field.
                if ($scope.filter.phase != undefined && block.phases.indexOf($scope.filter.phase) == -1) {
                    if (removeIds.indexOf(i) == -1) {
                        removeIds.push(i);
                    }
                }

                //Check the arcs type for a string in the filter.arcs field.
                if ($scope.filter.arcs != undefined) {
                    if ($scope.filter.arcs == 'A') {
                        if (block.arcs.attention.score <= 0) {
                            if (removeIds.indexOf(i) == -1) {
                                removeIds.push(i);
                            }
                        }
                    } else if ($scope.filter.arcs == 'R') {
                        if (block.arcs.relevance.score <= 0) {
                            if (removeIds.indexOf(i) == -1) {
                                removeIds.push(i);
                            }
                        }
                    } else if ($scope.filter.arcs == 'C') {
                        if (block.arcs.confidence.score <= 0) {
                            if (removeIds.indexOf(i) == -1) {
                                removeIds.push(i);
                            }
                        }
                    } else if ($scope.filter.arcs == 'S') {
                        if (block.arcs.satisfaction.score <= 0) {
                            if (removeIds.indexOf(i) == -1) {
                                removeIds.push(i);
                            }
                        }
                    }
                }

                //Check the group for a string in the filter.group field.
                if ($scope.filter.grouping != undefined && block.grouping != $scope.filter.grouping) {
                    if (removeIds.indexOf(i) == -1) {
                        removeIds.push(i);
                    }
                }
            }

            //Remove all elements that are in removeids;
            var filteredblocks = [];
            for (var i = 0; i < $scope.allblocks.length; i++) {
                if (removeIds.indexOf(i) == -1) {
                    filteredblocks.push($scope.allblocks[i]);
                }
            }

            clearBlocks();
            addBlocks(filteredblocks);
        };



    });