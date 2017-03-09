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
                        content: 'Lesplan',
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
                orientation: 'horizontal',      //Update to none
                timeAxis: {scale: 'minute', step: 15},
                stack: true,
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
                    callback(item);
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
                timeline.items.add({id: timelineEntry.id, content: block.title, editable: true, start: timelineEntry.startTime.format(), end: timelineEntry.endTime.format(), group: 1});
                $log.info('(PlannerCtrl): Timeline entry added with id ' + timelineEntry.id);

                PlanSvc.printTimeline();
                return true
            } catch (e) {
                $log.info('(PlannerCtrl): Timeline entry NOT added: ' + e);
                return false;
            }


        };


        $scope.onDropComplete=function(data,evt){
            $log.info('(PlannerCtrl): Dropping block \"' + data.block.title + '\"');
            $scope.addTimelineEntry(30, 30, data.block);
        };

        $scope.onLoaded = function (graphRef) {
            timeline.ref = graphRef;
            timeline.ref.on('select', function (properties) {
                //alert('selected items: ' + properties.items);
            });
        };



    });