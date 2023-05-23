define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'views/booking/travelerInformation/thomasCook/TCTravellerLayoutView',
    'app',
    'collections/booking/travelerInformation/thomasCook/TCTravellerCollection',
    'event.aggregator',
    'util/booking/bookingUtil',
    'views/booking/travelerInformation/TravelerListView'
], function ($, _, Backbone, Marionette, TCTravellerLayoutView, App, TCTravellerCollection, EventAggregator, BookingUtil, TravelerListView) {
    var TCTravellerListView = TravelerListView.extend({
        collection: TCTravellerCollection,
        itemView: TCTravellerLayoutView
    });
    // Our module now returns our view
    return TCTravellerListView;
});
