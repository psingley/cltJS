define([
    'jquery',
    'underscore'
], function ($, _) {
    var performanceUtil = (function () {

        //constructor
        var constructor = function () {
            var startTime;
            var endTime;

            this.start = function () {
                startTime = window.performance.now();
            }

            this.end = function () {
                endTime = window.performance.now();
                var totalTime = endTime - startTime;
                if (window.console) {
                   console.log(totalTime);
                }
            }
        };

        return constructor;
    })();

    return performanceUtil;
});