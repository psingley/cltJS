
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'views/tour/accommodations/AccommodationView',
    'collections/tour/accommodations/AccommodationCollection',
    'util/owlCarouselUtil'
], function ($, _, Backbone, Marionette, App, EventAggregator, AccommodationView, AccommodationCollection, OwlCarouselUtil) {
    var AccommodationListView = Backbone.Marionette.CollectionView.extend({
        collection: AccommodationCollection,
        itemView: AccommodationView,
        onShow: function () {
            $("#hotelsAccommodationsViewMore").hide();
            var viewContext = this;
            OwlCarouselUtil.tourPageCarousel(4,viewContext.$el);
        }
    });
    // Our module now returns our view
    return AccommodationListView;
});