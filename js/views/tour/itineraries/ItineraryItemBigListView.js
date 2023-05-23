//
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'views/tour/itineraries/ItineraryItemBigView',
    'collections/tour/itineraries/ItineraryItemCollection'
], function ($, _, Backbone, Marionette, App, EventAggregator, ItineraryItemBigView, ItineraryItemCollection) {
    var ItineraryItemShortListView = Backbone.Marionette.CollectionView.extend({
        collection: ItineraryItemCollection,
        itemView: ItineraryItemBigView,
        className:"itinerary_table"
    });

    // Our module now returns our view
    return ItineraryItemShortListView;
});
