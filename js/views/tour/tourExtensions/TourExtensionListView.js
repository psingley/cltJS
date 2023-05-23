define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'views/tour/tourExtensions/TourExtensionView',
    'collections/tour/tourExtensions/TourExtensionCollection',
    'util/tourDetailUtil',
    'util/owlCarouselUtil'
], function ($, _, Backbone, Marionette, App, EventAggregator, TourExtensionView, TourExtensionCollection, TourDetailUtil, OwlCarouselUtil) {
    var TourExtensionListView = Backbone.Marionette.CollectionView.extend({
        collection: TourExtensionCollection,
        itemView: TourExtensionView,
        initialize: function (options) {
            this.$expandedView = options.$expandedView;
            this.$closeButton = options.$closeButton;
        },
        itemViewOptions: function () {
            var viewContext = this;

            return  {
                $expandedView: viewContext.$expandedView,
                $closeButton: viewContext.$closeButton
            }
        },
        onShow: function () {
            var viewContext = this;

            //hides optional excursions section if empty
            if (this.collection == null || this.collection.length < 1) {
                $('#tour_extensions_section_container').hide();
                $('#tour_extensions_section_container').attr('shownondesktop', 'false');
              
            } else {
                $('#tour_extensions_section_container').show();
                $('#tour_extensions_section_container').attr('shownondesktop', 'true');
                var $images = $('.extensionImage');
                $images.load(function () {
                    var $columns = viewContext.$el.find('.col');
                    TourDetailUtil.updateColumnHeights($columns);
                });
            }
            OwlCarouselUtil.tourPageCarousel(3,viewContext.$el);
        }
    });
    // Our module now returns our view
    return TourExtensionListView;
});