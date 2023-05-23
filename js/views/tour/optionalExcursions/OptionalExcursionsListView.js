define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'views/tour/optionalExcursions/OptionalExcursionsView',
    'collections/tour/optionalExcursions/OptionalExcursionsCollection',
    'util/tourDetailUtil',
    'util/owlCarouselUtil'
], function ($, _, Backbone, Marionette, App, EventAggregator, OptionalExcursionsView, OptionalExcursionsCollection, TourDetailUtil, OwlCarouselUtil) {
    var OptionalExcursionsListView = Backbone.Marionette.CollectionView.extend({
        collection: OptionalExcursionsCollection,
        itemView: OptionalExcursionsView,
        initialize: function (options) {
            this.$expandedView = options.$expandedView;
            this.$closeButton = options.$closeButton;
        },
        itemViewOptions: function () {
            var viewContext = this;

            return  {
                $expandedView: viewContext.$expandedView,
                $closeButton: viewContext.$closeButton
            };
        },
        onShow: function () {
            var viewContext = this;

            //hides optional excursions section if empty
            if (this.collection == null || this.collection.length < 1) {
                $('#optional_excursions_section_container').hide();
                $('#optional_excursions_section_container').attr('shownondesktop', 'false');

            } else {
                $('#optional_excursions_section_container').show();
                $('#optional_excursions_section_container').attr('shownondesktop', 'true');
            }

            
            if (TourDetailUtil.getQueryStringParamValue("p") != "1") {
                OwlCarouselUtil.tourPageCarousel(4,viewContext.$el);
            }
        }
    });
    // Our module now returns our view
    return OptionalExcursionsListView;
});