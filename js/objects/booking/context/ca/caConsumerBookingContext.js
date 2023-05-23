define([
    'domReady',
    'app',
    'jquery',
    'backbone',
    'marionette',
    'event.aggregator',
    'objects/booking/context/ca/caBookingContext'
],
    function (domReady, App, $, Backbone, Marionette, EventAggregator, CANBookingContext) {
        /**
         * @extends caBookingContext
         * @class caConsumerBookingContext
         */
        var caConsumerBookingContext = (function () {

            var constructor = function () {
                this.onGetBookingComplete();
                this.onTogglePackageUpgrades();
                this.onSubmitTourCustomizationsClick();
                this.onPageLoad();
            };

            return constructor;
        })();

        caConsumerBookingContext.prototype = new CANBookingContext();
        return caConsumerBookingContext;
    });