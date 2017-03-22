'use strict';

/**
 * @ngdoc function
 * @name arcsplannerApp.controller:BlocksCtrl
 * @description
 * # BlocksCtrl
 * Controller of the blocks
 */
angular.module('arcsplannerApp')
    .controller('PlannerCtrl', function ($scope, $log, VisDataSet, PlanSvc) {
        var timeline = {};
        var timelineEntries = [];

        var lessonDuration = 180;
        var lessonStartTime;
        var lessonEndTime;

        $scope.init = function() {
            //The visual representation of the timeline
            timeline = {
                items: new vis.DataSet([

                ]),
                groups: [
                    {
                        id: 1,
                        content: '',
                        visible: true
                    },
                    {
                        id: 2,
                        content: 'Alternatief 1',
                        visible: false
                    }
                ]
            };


            //Add timeline specific items to scope
            $scope.timeline_events = {
                onload: $scope.onLoaded
            };

            $scope.timeline_data = {
                items: timeline.items,
                groups: timeline.groups
            };

            $scope.timeline_options = {
                editable: {
                    remove: true,
                    updateGroup: true,
                    updateTime: true,
                    overrideItems: false
                },
                start: PlanSvc.getLessonStartTime().format(),
                end: PlanSvc.getLessonEndTime().format(),
                moveable: false,
                orientation: 'none',      //Update to none
                timeAxis: {scale: 'minute', step: 15},
                stack: false,
                onMove: function (item, callback) {
                    try {
                        var startTime = moment(item.start);
                        var endTime = moment(item.end);

                        PlanSvc.moveTimelineEntry(item.id, PlanSvc.convertMomentToRelativeMinutes(startTime), moment.duration(endTime.diff(startTime)).asMinutes());
                        $log.info('(PlannerCtrl): Timeline entry moved with id ' + item.id);
                        callback(item);
                    } catch (e) {
                        $log.info('(PlannerCtrl): Timeline entry NOT moved: ' + e);
                        callback(null);
                    }
                },

                onRemove: function (item, callback) {
                    try {
                        PlanSvc.removeTimelineEntry(item.id);
                        $log.info('(PlannerCtrl): Timeline entry removed with id ' + item.id);
                        callback(item);
                    } catch (e) {
                        $log.info('(PlannerCtrl): Timeline entry NOT removed: ' + e);
                        callback(null);
                    }
                },

                onMoving: function (item, callback) {
                    callback(item);
                }
            };
        };

        /**
         * Add a block to the timeline
         * @param startMinute The startminute of the block, start of the lesson is 0
         * @param durationMinutes The duration of the block
         * @param block The block to place
         * @return true when added, false when not
         */
        $scope.addTimelineEntry = function(startMinute, durationMinutes, block) {
            try {
                var timelineEntry = PlanSvc.addTimelineEntry(startMinute, durationMinutes, block);
                var itemclass = '';
                if (block.grouping == 'S') {
                    itemclass = 'grouping-single'
                } else if (block.grouping == 'D') {
                    itemclass = 'grouping-duo'
                } else if (block.grouping == 'G') {
                    itemclass = 'grouping-group'
                } else if (block.grouping == 'C') {
                    itemclass = 'grouping-class'
                }

                timeline.items.add({id: timelineEntry.id, content: block.title, editable: true, start: timelineEntry.startTime.format(), end: timelineEntry.endTime.format(), group: 1, className: itemclass});
                $log.info('(PlannerCtrl): Timeline entry added with id ' + timelineEntry.id);

                PlanSvc.printFreeBlocks();
                return true
            } catch (e) {
                $log.info('(PlannerCtrl): Timeline entry NOT added: ' + e);
                return false;
            }


        };


        $scope.onDropComplete=function(data,evt){
            $log.info('(PlannerCtrl): Dropping block \"' + data.block.title + '\"');

            var mintime = data.block.time[0];
            var maxtime = data.block.time[1];

            var maxtimefit = PlanSvc.findBestFittingFreeBlocks(maxtime);
            if (maxtimefit != -1) {
                $log.info('(PlannerCtrl): The maximum time of ' + maxtime + ' fits. Add it at time ' + maxtimefit);
                $scope.addTimelineEntry(maxtimefit, maxtime, data.block);
            } else {
                var mintimefit = PlanSvc.findBestFittingFreeBlocks(mintime);
                if (mintimefit != -1) {
                    $log.info('(PlannerCtrl): The default time of ' + maxtime + ' does not fit. Use minimum time of ' + mintime + ' Add it at time ' + mintimefit);
                    $scope.addTimelineEntry(mintimefit, mintime, data.block);
                } else {
                    $log.info('(PlannerCtrl): There is no place for a timeline entry with minimum time ' + mintime);
                }
            }


        };

        $scope.onLoaded = function (graphRef) {
            timeline.ref = graphRef;
            timeline.ref.on('select', function (properties) {
                //alert('selected items: ' + properties.items);
            });
        };



    });