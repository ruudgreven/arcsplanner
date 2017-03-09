
'use strict';

/**
 * @ngdoc function
 * @name arcsplannerApp.controller:PlanSvc
 * @description
 * # PlanSvc
 * Can be used to plan lessons based on blocks
 */
angular.module('arcsplannerApp').factory('PlanSvc', function($rootScope, $log) {
    var timelineEntries = [];

    var lessonDuration = 180;
    var lessonStartTime;
    var lessonEndTime;

    var lastId;

    /**
     * Receive a TimelineEntry object with the given id
     * @param id
     * @returns {*} The TimelineEntry or undefined when not found
     */
    var getTimelineEntryById = function(id) {
        for (var i = 0; i < timelineEntries.length; i++) {
            var timelineEntry = timelineEntries[i];
            if (timelineEntry.id == id) {
                return timelineEntry;
            }
        }
        return undefined;
    };

    /**
     * Sorts the timelineentries by starttime
     */
    var sortTimelineEntries = function() {
        var len = timelineEntries.length;
        for (var i = len - 1; i >= 0; i--) {
            for (var j = 1; j <= i; j++) {
                if (timelineEntries[j - 1].startTimeMinutes > timelineEntries[j].startTimeMinutes) {
                    var temp = timelineEntries[j - 1];
                    timelineEntries[j - 1] = timelineEntries[j];
                    timelineEntries[j] = temp;
                }
            }
        }
    };

    var planSvc = {
        /**
         * Initialize the lesson service.
         */
        init : function() {
            this.startNewLesson(moment().startOf('day'), 180);
        },

        /**
         * Starts a new lesson.
         * Needs to be the first call to the service, to configure the starttime, duration and entime for the lesson
         * @param startTime, a moment for the start of the lesson
         * @param duration. A duration in minutes
         */
        startNewLesson : function(startTime, duration) {
            lastId = 0;

            lessonStartTime = startTime;
            lessonDuration = duration;
            lessonEndTime = moment(lessonStartTime).add(duration, 'm');
        },

        getLessonStartTime: function() {
            return lessonStartTime;
        },

        getLessonEndTime: function() {
            return lessonEndTime;
        },

        getLessonDuration: function() {
            return lessonDuration;
        },

        /**
         * Adds a block to the current timeline
         * @param startTimeMinutes An offset in minutes from the start from the lesson, zero means the start of the lesson
         * @param durationMinutes A duration for the block
         * @param block A block to add
         * @returns {TimelineEntry} the added timeline entry.
         * @throws Errormessage (string) when something went wrong.
         */
        addTimelineEntry: function(startTimeMinutes, durationMinutes, block) {
            var endTimeMinutes = startTimeMinutes + durationMinutes;

            //Check if the duration is not longer than the actual lesson
            if (endTimeMinutes > lessonDuration) {
                throw '(PlanSvc.addTimelineEntry): Block not added. The block exceeds the endtime of the lesson';
            }

            //Check if there is overlap with existing entries
            for (var i = 0; i < timelineEntries.length; i++) {
                var entry = timelineEntries[i];
                if (entry.startTimeMinutes < (startTimeMinutes + durationMinutes) && entry.endTimeMinutes > startTimeMinutes) {
                    throw '(PlanSvc.addTimelineEntry): Block not added. There is overlap with an existing one';
                }
            }

            //Add the block
            var startTime = moment(lessonStartTime).add(startTimeMinutes, 'm');
            var endTime = moment(lessonStartTime).add(startTimeMinutes + durationMinutes, 'm');

            var timelineEntry = {
                id: lastId,
                startTime: startTime,
                endTime: endTime,
                startTimeMinutes: startTimeMinutes,
                endTimeMinutes: startTimeMinutes + durationMinutes,
                duration: durationMinutes,
                block: block
            };

            timelineEntries.push(timelineEntry);
            lastId++;

            //Sort the timelineentries
            sortTimelineEntries();

            return timelineEntry;
        },

        /**
         * Move a the timeline entry with the given id to the new position. First checks if this movement
         * is valid. If not, it doesn't change anything and throws an exception
         * @param id The id of the timelineEntry
         * @param startTimeMinutes The startTime in minutes
         * @param durationMinutes The endTime in minutes
         */
        moveTimelineEntry: function(id, startTimeMinutes, durationMinutes) {
            var timelineEntry = getTimelineEntryById(id);
            if (timelineEntry == undefined) {
                throw '(PlanSvc.moveTimelineEntry): Can not find the timelineEntry with id ' + id;
            }

            var endTimeMinutes = startTimeMinutes + durationMinutes;
            //Check if the duration is not longer than the actual lesson
            if (endTimeMinutes > lessonDuration) {
                throw '(PlanSvc.moveTimelineEntry): Block not moved. The block exceeds the endtime of the lesson';
            }

            var startTime = moment(lessonStartTime).add(startTimeMinutes, 'm');
            var endTime = moment(lessonStartTime).add(startTimeMinutes + durationMinutes, 'm');

            //Update the block
            timelineEntry.startTime = startTime;
            timelineEntry.endTime = endTime;
            timelineEntry.startTimeMinutes = startTimeMinutes;
            timelineEntry.endTimeMinutes = endTimeMinutes;
            timelineEntry.duration = durationMinutes;

            //Sort the timelineentries
            sortTimelineEntries();
        },

        /**
         * Convert a timeMoment to a relatieve time in minutes from the start of the lesson
         * @param timeMoment A moment in time
         * @returns an integer with the number of minutes from the start of the lesson
         */
        convertMomentToRelativeMinutes: function(timeMoment) {
            return moment.duration(timeMoment.diff(lessonStartTime)).asMinutes();
        },

        /**
         * Prints the timeline JSON (Pretty print)
         */
        printTimeline: function() {
            $log.info('Current timeline: ' + JSON.stringify(timelineEntries, null, 2));
        }

    };

    planSvc.init();
    return planSvc;
});