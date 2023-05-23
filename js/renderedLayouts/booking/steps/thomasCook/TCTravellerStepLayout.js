define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'util/booking/bookingUtil',
    'event.aggregator',
    'renderedLayouts/booking/steps/TravelerStepLayout',
    'views/booking/travelerInformation/thomasCook/TCTravellerListView'
], function ($, _, Backbone, Marionette, App, BookingUtil, EventAggregator, TravelerStepLayout, TCTravellerListView) {
    var TCTravellerStepLayout = TravelerStepLayout.extend({
        initialize: function () {
            TCTravellerStepLayout.__super__.initialize.apply(this);
        },
        renderTravellerList: function () {
            this.travelerInformationRegion.show(new TCTravellerListView({
                collection: App.Booking.travelers
            }));
        }
    });
    return TCTravellerStepLayout;
});