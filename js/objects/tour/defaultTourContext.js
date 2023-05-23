define([
    'domReady',
    'app',
    'jquery',
    'backbone',
    'marionette',
    'objects/tour/baseTourContext'
],
    function (domReady, App, $, Backbone, Marionette, BaseTourContext) {
        /**
         * @class defaultTourContext
         * @extends baseTourContext
         */
        var defaultTourContext = (function () {
            var constructor = function () {
                this.onTourDetailsRequestComplete();
                this.onPageLoad();
            };

            return constructor;
        })();

        defaultTourContext.prototype = new BaseTourContext();
        return defaultTourContext;
    });