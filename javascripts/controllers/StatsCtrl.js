'use strict';

/**
 * @ngdoc function
 * @name arcsplannerApp.controller:StatsCtrl
 * @description
 * # StatsCtrl
 * Controller of the blocks
 */
angular.module('arcsplannerApp')
    .controller('StatsCtrl', function ($scope, $log, PlanSvc) {
        $scope.arcschart = {
            colors: ['#dddddd'],
            labels: ['Onbekend'],
            data: [100]
        };

        $scope.groupingchart = {
            colors: ['#dddddd'],
            labels: ['Onbekend'],
            data: [100]
        };

        $scope.chartoptions = {
            cutoutPercentage: 40,
            tooltips: {
                enabled: false
            }
        };


        $scope.$on( 'plan.changed', function( event ) {
            var timeline = PlanSvc.getTimeline();

            if (timeline.length == 0) {
                $scope.arcschart.colors = ['#dddddd'];
                $scope.arcschart.labels = ['Onbekend'];
                $scope.arcschart.data = [100];

                $scope.groupingchart.colors = ['#dddddd'];
                $scope.groupingchart.labels = ['Onbekend'];
                $scope.groupingchart.data = [100];
            } else {
                var attention = 0;
                var relevance = 0;
                var confidence = 0;
                var satisfaction = 0;

                var single = 0;
                var duo = 0;
                var group = 0;
                var clas = 0;

                //Loop through all blocks
                for (var i = 0; i < timeline.length; i++) {
                    var timelineEntry = timeline[i];

                    attention += timelineEntry.block.arcs.attention.score * timelineEntry.duration;
                    relevance += timelineEntry.block.arcs.relevance.score * timelineEntry.duration;
                    confidence += timelineEntry.block.arcs.confidence.score * timelineEntry.duration;
                    satisfaction += timelineEntry.block.arcs.satisfaction.score * timelineEntry.duration;

                    single += ((timelineEntry.block.grouping == 'S') ? 1 : 0) * timelineEntry.duration;;
                    duo += ((timelineEntry.block.grouping == 'D') ? 1 : 0) * timelineEntry.duration;;
                    group += ((timelineEntry.block.grouping == 'G') ? 1 : 0) * timelineEntry.duration;;
                    clas += ((timelineEntry.block.grouping == 'C') ? 1 : 0) * timelineEntry.duration;;
                }

                attention = (attention < 0) ? 0 : attention;
                relevance = (relevance < 0) ? 0 : relevance;
                confidence = (confidence < 0) ? 0 : confidence;
                satisfaction = (satisfaction < 0) ? 0 : satisfaction;

                var sumArcs = attention + relevance + confidence + satisfaction;
                var sumGrouping = single + duo + group + clas;

                attention = Math.floor(attention / sumArcs * 100);
                relevance = Math.floor(relevance / sumArcs * 100);
                confidence = Math.floor(confidence / sumArcs * 100);
                satisfaction = Math.floor(satisfaction / sumArcs * 100);

                single = Math.floor(single / sumGrouping * 100);
                duo = Math.floor(duo / sumGrouping * 100);
                group = Math.floor(group / sumGrouping * 100);
                clas = Math.floor(clas / sumGrouping * 100);

                $scope.arcschart.colors = ['#e83b31', '#008ce7', '#7db13b', '#ffd620'];
                $scope.arcschart.labels = ['Attention', 'Relevance', 'Confidence', 'Satisfaction'];
                $scope.arcschart.data = [attention, relevance, confidence, satisfaction];

                $scope.groupingchart.colors = ['#CDDC39', '#009688', '#FF5722', '#ffd620'];
                $scope.groupingchart.labels = ['Individueel', 'Duo\'s', 'Groepjes', 'Klas'];
                $scope.groupingchart.data = [single, duo, group, clas];

            }



            if(!$scope.$$phase) {
                $scope.$apply();
            }
        });
    });