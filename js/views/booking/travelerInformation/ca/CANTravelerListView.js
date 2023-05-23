define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'views/booking/travelerInformation/ca/CANTravelerLayoutView',
    'app',
    'collections/booking/travelerInformation/ca/CANTravelerCollection',
    'event.aggregator',
    'util/booking/bookingUtil',
    'views/booking/travelerInformation/TravelerListView'
], function ($, _, Backbone, Marionette, CANTravelerLayoutView, App, CANTravelerCollection, EventAggregator, BookingUtil, TravelerListView) {
    var TCTravellerListView = TravelerListView.extend({
        collection: CANTravelerCollection,
        itemView: CANTravelerLayoutView
    });
    // Our module now returns our view
    return TCTravellerListView;
});
