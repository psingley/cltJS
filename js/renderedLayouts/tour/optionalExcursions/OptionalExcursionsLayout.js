define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'util/tourDetailUtil',
    'views/tour/optionalExcursions/OptionalExcursionsListView',
    'views/tour/optionalExcursions/OptionalExcursionsView',
    'collections/tour/optionalExcursions/OptionalExcursionsCollection',
    'extensions/marionette/views/RenderedLayout',
    'event.aggregator',
    'util/objectUtil'
], function ($, _, Backbone, Marionette, TourDetailUtil, OptionalExcursionsListView, OptionalExcursionsView, OptionalExcursionsCollection, RenderedLayout, EventAggregator, ObjectUtil) {
    var OptionalExcursionsLayout = RenderedLayout.extend({
        el: '#optional_excursions_section_container',
        regions: {
            defaultView: "#optionalExcursions"
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
                viewContext.showOptionalExcursions(tourDetailsModel.optionalExcursions);
            });
        },
        /**
         * Renders the Optional Excursions List View
         *
         * @method showOptionalExcursions
         * @param optionalExcursions
         */
        showOptionalExcursions: function (optionalExcursions) {
            var filteredOptionalExcursions =
                optionalExcursions.filter(function (excursion) {
                    var hasSummary = !ObjectUtil.isNullOrEmpty(excursion.get('summary'));
                    var hasTitle = !ObjectUtil.isNullOrEmpty(excursion.get('title'));
                    var hasDescription = !ObjectUtil.isNullOrEmpty(excursion.get('description'));

                    return hasDescription && hasSummary && hasTitle;
                });

            optionalExcursions.set(filteredOptionalExcursions);

            this.defaultView.show(
                new OptionalExcursionsListView(
                    {
                        collection: optionalExcursions,
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
    return OptionalExcursionsLayout;
});