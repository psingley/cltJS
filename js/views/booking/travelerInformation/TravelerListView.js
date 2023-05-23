define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'views/booking/travelerInformation/TravelerLayoutView',
    'app',
    'collections/booking/travelerInformation/TravelerCollection',
    'event.aggregator',
    'util/booking/bookingUtil'
], function ($, _, Backbone, Marionette, TravelerLayoutView, App, TravelerCollection, EventAggregator, BookingUtil) {
    var TravelerListView = Backbone.Marionette.CollectionView.extend({
        collection: TravelerCollection,
        itemView: TravelerLayoutView,
        itemViewOptions: function (model, index) {
            return {
                travelerNumber: index + 1,
                numberOfTravelers: App.Booking.travelers.length
            }
        },
        onShow: function () {
            BookingUtil.renderStepButtons();
        }
    });
    // Our module now returns our view
    return TravelerListView;
});
