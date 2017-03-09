
'use strict';

/**
 * @ngdoc function
 * @name arcsplannerApp.controller:ConverterSvc
 * @description
 * # ConverterSvc
 * Can be used to convert markdown to html.
 */

angular.module('arcsplannerApp').factory('ConverterSvc', function($rootScope, $log) {
    var converter = new showdown.Converter();

    var convertorSvc = {

        /**
         * Initialize the convertor service.
         */
        init : function() {

        },

        /**
         * Convert the given markdown string to HTML
         * @param text
         * @returns {*}
         */
        convertToHtml : function (text) {
            var html = converter.makeHtml(text);
            return html;
        },

        /**
         * Converts the given number of minutes to a pretty timestamp:
         * @param minutes
         */
        convertToPrettyTime : function (minutes) {
            var hours = Math.floor(minutes / 60);
            minutes = minutes % 60;

            return '0' + hours + ':' + (minutes < 9 ? '0' + minutes : minutes);
        }
    };

    convertorSvc.init();
    return convertorSvc;
});