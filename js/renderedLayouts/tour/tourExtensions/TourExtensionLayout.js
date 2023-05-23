/**
 * @class TourExtensionLayout
 * @extends RenderedLayout
 */
define([
    'app',
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'util/tourDetailUtil',
    'views/tour/tourExtensions/TourExtensionListView',
    'views/tour/tourExtensions/TourExtensionView',
    'collections/tour/tourExtensions/TourExtensionCollection',
    'extensions/marionette/views/RenderedLayout',
    'event.aggregator'
], function (App, $, _, Backbone, Marionette, TourDetailUtil, TourExtensionListView, TourExtensionView, TourExtensionCollection, RenderedLayout, EventAggregator) {
    var TourExtensionLayout = RenderedLayout.extend({
        el: '#tour_extensions_section_container',
        regions: {
            defaultView: "#tourExtensions"
        },
        ui: {
            '$expandedView': '.expanded',
            '$closeButton': '.close_button'
        },
        events: {
            'click .close_button': 'closeSection'
        },
        initialize: function () {
            var viewContext = this;

            /**
             * @event tourDetailsRequestComplete
             */
            EventAggregator.on('tourDetailsRequestComplete', function (tourDetailsModel) {
                viewContext.showTourExtensions(tourDetailsModel.tourExtensions);
            });
        },
        showTourExtensions: function (extensions) {
            this.defaultView.show(
                new TourExtensionListView(
                    {
                        collection: extensions,
                        $expandedView: this.ui.$expandedView,
                        $closeButton: this.ui.$closeButton
                    })
            );
        },
        closeSection: function (e) {
            TourDetailUtil.closeExpandedSection(e, this.ui.$expandedView, this.ui.$closeButton);
        }
    });
// Our module now returns our view
    return TourExtensionLayout;
});