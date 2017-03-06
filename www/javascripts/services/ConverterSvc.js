
'use strict';

/**
 * @ngdoc function
 * @name robocodecupApp.controller:RankingCtrl
 * @description
 * # competitionSrv
 * Contains information about the current competition
 */

angular.module('arcsplannerApp').service('ConverterSvc', function($rootScope, $log) {
    this.converter = new showdown.Converter();

    this.convertToHtml = function(text) {
        var  html = this.converter.makeHtml(text);
        return html;
    }
});