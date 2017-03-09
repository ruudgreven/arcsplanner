
'use strict';

/**
 * @ngdoc function
 * @name arcsplannerApp.controller:ConverterSvc
 * @description
 * # ConverterSvc
 * Can be used to convert markdown to html.
 */

angular.module('arcsplannerApp').service('ConverterSvc', function($rootScope, $log) {
    this.converter = new showdown.Converter();

    this.convertToHtml = function(text) {
        var  html = this.converter.makeHtml(text);
        return html;
    }
});