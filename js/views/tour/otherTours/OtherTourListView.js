define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'util/tourDetailUtil',
    'views/tour/otherTours/OtherTourView',
    'collections/tour/otherTours/OtherTourCollection',
    'util/owlCarouselUtil'
], function ($, _, Backbone, Marionette, App, EventAggregator, TourDetailUtil, OtherTourView, OtherTourCollection, OwlCarouselUtil) {
    var OtherTourListView = Backbone.Marionette.CollectionView.extend({
        collection: OtherTourCollection,
        itemView: OtherTourView,
        onShow: function () {
            var viewContext = this;
            //hides other tours you may like section if empty
            if (this.collection == null || this.collection.length < 1) {
                $('#other_tours_section').hide();
            } else {
                if (!App.mobile) {
                    $('#other_tours_section').show();

                    var $images = $('.otherTourImage');
                    $images.load(function () {
                        TourDetailUtil.updateOtherToursHeight();
                    });
                }
            }
            OwlCarouselUtil.tourPageCarousel(3,viewContext.$el);
        }
    });
    // Our module now returns our view
    return OtherTourListView;
});