
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'views/tour/itineraries/ItineraryItemView',
    'collections/tour/itineraries/ItineraryItemCollection'
], function ($, _, Backbone, Marionette, App, EventAggregator, ItineraryItemView, ItineraryItemCollection) {
    var ItineraryItemShortListView = Backbone.Marionette.CollectionView.extend({
        collection: ItineraryItemCollection,
        itemView: ItineraryItemView
    });
    // Our module now returns our view
    return ItineraryItemShortListView;
});
