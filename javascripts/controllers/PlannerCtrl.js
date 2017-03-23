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
                timeAxis: {scale: 'minute', step: 5},
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


        $scope.$on( 'plan.changed', function( event ) {
            $log.info('(PlannerCtrl)Updated received');

            var timelineEntries = PlanSvc.getTimeline();
            var ids = timeline.items.getIds();

            for (var i = 0; i < timelineEntries.length; i++) {
                var timelineEntry = timelineEntries[i];

                var itemclass = '';
                if (timelineEntry.block.grouping == 'S') {
                    itemclass = 'grouping-single'
                } else if (timelineEntry.block.grouping == 'D') {
                    itemclass = 'grouping-duo'
                } else if (timelineEntry.block.grouping == 'G') {
                    itemclass = 'grouping-group'
                } else if (timelineEntry.block.grouping == 'C') {
                    itemclass = 'grouping-class'
                }

                //Add item if it's not already on the timeline, or update when it's already on the timeline
                if (ids.indexOf(timelineEntry.id) == -1) {
                    timeline.items.add({id: timelineEntry.id, content: timelineEntry.block.title, editable: true, start: timelineEntry.startTime.format(), end: timelineEntry.endTime.format(), group: 1, className: itemclass});
                } else {
                    timeline.items.update({id: timelineEntry.id, content: timelineEntry.block.title, editable: true, start: timelineEntry.startTime.format(), end: timelineEntry.endTime.format(), group: 1, className: itemclass});
                }
            }

        });

        $scope.onDropComplete=function(data,evt){
            $log.info('(PlannerCtrl): Dropping block \"' + data.block.title + '\"');
            try {
                var timelineEntry = PlanSvc.addTimelineEntryToBestFittingPosition(data.block);
                $log.info('(PlannerCtrl): Timeline entry added with id ' + timelineEntry.id);
                return true
            } catch (e) {
                $log.info('(PlannerCtrl): Timeline entry NOT added: ' + e);
                return false;
            }
        };

        $scope.onLoaded = function (graphRef) {
            timeline.ref = graphRef;
            timeline.ref.on('select', function (properties) {
                //alert('selected items: ' + properties.items);
            });
        };



    });