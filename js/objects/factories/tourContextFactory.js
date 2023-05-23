define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'objects/tour/defaultTourContext'
], function ($, _, Backbone, Marionette, App, DefaultTourContext) {
    /**
     * Takes a set of options in the constructor
     * and instantiates the correct search context
     *
     * @class tourContextFactory
     * @param options
     */
    var tourContextFactory = (function () {
        var constructor = function (options) {

            /**
             * gets the default search context
             *
             * @method getDefaultTourContext
             * @return object
             */
            var getDefaultTourContext = function () {
                return new DefaultTourContext();
            };

            /**
             * Call this method to get the tour context
             *
             * @method getTourContext
             */
            this.getTourContext = function () {
                return getDefaultTourContext();
            };
        };

        return constructor;
    })();
    return tourContextFactory;
});