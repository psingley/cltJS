define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'util/booking/bookingUtil',
    'event.aggregator',
    'renderedLayouts/booking/steps/TravelerStepLayout',
    'views/booking/travelerInformation/ca/CANTravelerListView'
], function ($, _, Backbone, Marionette, App, BookingUtil, EventAggregator, TravelerStepLayout, CANTravelerListView) {
    var CANTravellerStepLayout = TravelerStepLayout.extend({
        initialize: function () {
            CANTravellerStepLayout.__super__.initialize.apply(this);
        },
        renderTravellerList: function () {
            this.travelerInformationRegion.show(new CANTravelerListView({
                collection: App.Booking.travelers
            }));
        }
    });
    return CANTravellerStepLayout;
});