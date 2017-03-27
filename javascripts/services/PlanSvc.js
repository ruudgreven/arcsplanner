
'use strict';

/**
 * @ngdoc function
 * @name arcsplannerApp.controller:PlanSvc
 * @description
 * # PlanSvc
 * Can be used to plan lessons based on blocks
 */
angular.module('arcsplannerApp').factory('PlanSvc', function($rootScope, $log, Analytics) {
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
         * Returns the current timeline
         * @returns {Array}
         */
        getTimeline: function() {
            return timelineEntries;
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


            //Check if the starttime is >0
            if (startTimeMinutes < 0) {
                throw '(PlanSvc.addTimelineEntry): Block not added. The block starts before the beginning of the lesson';
            }

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

            //Check if the duration is equal to or greater than 5 minutes
            if (durationMinutes < 5) {
                throw '(PlanSvc.moveTimelineEntry): Block not moved. Minimum duration is 5 minutes';
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
                block: block,
                content: ''
            };

            timelineEntries.push(timelineEntry);
            lastId++;

            //Sort the timelineentries
            sortTimelineEntries();

            //Send a message to google analytics
            Analytics.trackEvent('block', 'add', block.title);

            //Send a message that the plan has changed
            $rootScope.$broadcast('plan.changed');

            return timelineEntry;
        },

        /**
         * Adds a block to the current timeline at the best fitting position
         * @param block A block to add
         * @returns {TimelineEntry} the added timeline entry.
         * @throws Errormessage (string) when something went wrong.
         */
        addTimelineEntryToBestFittingPosition: function(block) {
            var mintime = block.time[0];
            var maxtime = block.time[1];

            var maxtimefit = planSvc.findBestFittingFreeBlocks(maxtime);
            if (maxtimefit != -1) {
                return planSvc.addTimelineEntry(maxtimefit, maxtime, block);
            } else {
                var mintimefit = planSvc.findBestFittingFreeBlocks(mintime);
                if (mintimefit != -1) {
                    $log.info('(PlannerSvc.addTimelineEntryToBestFittingPosition): The default time of ' + maxtime + ' does not fit. Use minimum time of ' + mintime + ' Add it at time ' + mintimefit);
                    return planSvc.addTimelineEntry(mintimefit, mintime, block);
                } else {
                    var fiveminutesfit = planSvc.findBestFittingFreeBlocks(5);
                    if (fiveminutesfit != -1) {
                        $log.info('(PlannerSvc.addTimelineEntryToBestFittingPosition): The minimum time of ' + mintime + ' does not fit. Use 5 minutes time. Add it at time ' + fiveminutesfit);
                        return planSvc.addTimelineEntry(fiveminutesfit, 5, block);
                    } else {
                        throw '(PlannerSvc.addTimelineEntryToBestFittingPosition: There is no place for a timeline entry with minimum time of 5 minutes';
                    }

                }
            }
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

            //Check if the starttime is >0
            if (startTimeMinutes < 0) {
                throw '(PlanSvc.addTimelineEntry): Block not added. The block starts before the beginning of the lesson';
            }

            var endTimeMinutes = startTimeMinutes + durationMinutes;

            //Check if the duration is not longer than the actual lesson
            if (endTimeMinutes > lessonDuration) {
                throw '(PlanSvc.moveTimelineEntry): Block not moved. The block exceeds the endtime of the lesson';
            }

            //Check if the duration is equal to or greater than 5 minutes
            if (durationMinutes < 5) {
                throw '(PlanSvc.moveTimelineEntry): Block not moved. Minimum duration is 5 minutes';
            }

            //Check if there is overlap with existing entries
            for (var i = 0; i < timelineEntries.length; i++) {
                var entry = timelineEntries[i];
                if (entry.id != timelineEntry.id) {
                    if (entry.startTimeMinutes < (startTimeMinutes + durationMinutes) && entry.endTimeMinutes > startTimeMinutes) {
                        throw '(PlanSvc.addTimelineEntry): Block not added. There is overlap with an existing one';
                    }
                }
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

            //Send a message that the plan has changed
            $rootScope.$broadcast('plan.changed');
        },

        /**
         * Remove the timelineEntry with the given id
         * @param id
         * @returns {boolean} true when removed, or throws an exception when not found
         */
        removeTimelineEntry : function(id) {
            var indexToRemove = -1;

            for (var i = 0; i < timelineEntries.length; i++) {
                var entry = timelineEntries[i];
                if (entry.id == id) {
                    indexToRemove = i;
                }
            }

            if (indexToRemove != -1) {
                var timelineEntry = timelineEntries.splice(indexToRemove, 1)[0];

                //Send a message to google analytics
                Analytics.trackEvent('block', 'remove', timelineEntry.block.title);

                //Send a message that the plan has changed
                $rootScope.$broadcast('plan.changed');
                return true;
            } else {
                throw 'Timeline entry with id ' + id + ' not found!';
            }
        },

        /**
         * Find all free blocks
         * Returns a list of free blocks in the format {start: <time in minutes>, end: <time in minutes> }
         * @returns {*}
         */
        getFreeBlocks : function() {
            var freeBlocks = []; //Add objects with {starttime, duration}

            if (timelineEntries.length == 0) {
                freeBlocks.push({start: 0, end: lessonDuration});
                return freeBlocks;
            }

            //Find all lesson blocks and add the time between them to freeBlocks
            var lastEndtime = undefined;
            for (var i = 0; i < timelineEntries.length; i++) {
                var timelineEntry = timelineEntries[i];
                if (lastEndtime != undefined) {
                    freeBlocks.push({start: lastEndtime, end: timelineEntry.startTimeMinutes});
                } else {
                    freeBlocks.push({start: 0, end: timelineEntry.startTimeMinutes});
                }
                lastEndtime = timelineEntry.endTimeMinutes;
            }

            //Add the last block that ends add the end of the lesson
            if (timelineEntries[timelineEntries.length - 1].end != lessonDuration) {
                freeBlocks.push({start: timelineEntries[timelineEntries.length - 1].endTimeMinutes, end: lessonDuration});
            }

            //Check for same end and starttime and remove these
            var toRemove = [];
            for (var i = 0; i < freeBlocks.length; i++) {
                var freeBlock = freeBlocks[i];
                if (freeBlock.start == freeBlock.end) {
                    toRemove.push(i);
                }
            }

            var removalCount = 0;
            for (var i = 0; i < toRemove.length; i++) {
                freeBlocks.splice(toRemove[i] - removalCount, 1);
                removalCount++;
            }

            return freeBlocks;
        },

        /**
         * Find all free blocks that has a minimum of the given duration
         * @param duration
         * @returns {Array}
         */
        findFittingFreeBlocks: function(duration) {
            var freeBlocks = this.getFreeBlocks();
            var matchingBlocks = [];
            for (var i = 0; i < freeBlocks.length; i++) {
                if ((freeBlocks[i].end - freeBlocks[i].start) >= duration) {
                    matchingBlocks.push(freeBlocks[i]);
                }
            }
            return matchingBlocks;
        },

        /**
         * Finds the starttime of the block with the smallest duration that fits the given duration. Returns -1 if
         * there where no free fitting blocks
         * @param duration
         */
        findBestFittingFreeBlocks: function(duration) {
            var freeFittingBlocks = this.findFittingFreeBlocks(duration);
            var blockDurations = [];

            if (freeFittingBlocks.length == 0) {
                return -1;
            }

            //Order all fitting durations based on the duration
            var len = freeFittingBlocks.length;
            for (var i = len - 1; i >= 0; i--) {
                for (var j = 1; j <= i; j++) {
                    var duration1 = freeFittingBlocks[j - 1].end - freeFittingBlocks[j - 1].start;
                    var duration2 = freeFittingBlocks[j].end - freeFittingBlocks[j].start;

                    if (duration1 > duration2) {
                        var temp = freeFittingBlocks[j - 1];
                        freeFittingBlocks[j - 1] = freeFittingBlocks[j];
                        freeFittingBlocks[j] = temp;
                    }
                }
            }

            //Return the starttime of the first block that fits
            for (var i = 0; i < freeFittingBlocks.length; i++) {
                if ((freeFittingBlocks[i].end - freeFittingBlocks[i].start) >= duration) {
                    return freeFittingBlocks[i].start;
                }
            }

            return -1;
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
        },

        /**
         * Prints the current free blocks in JSON (Pretty print)
         */
        printFreeBlocks: function() {
            $log.info('Current free blocks: ' + JSON.stringify(this.getFreeBlocks(), null, 2));
        }

    };

    planSvc.init();
    return planSvc;
});