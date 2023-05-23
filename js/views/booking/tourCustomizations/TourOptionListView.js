
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'views/booking/tourCustomizations/TourOptionView',
    'app',
    'collections/booking/tourCustomizations/BookingPackageUpgradeCollection',
    'event.aggregator'
], function ($, _, Backbone, Marionette, TourOptionView, App, PackageUpgradeCollection, EventAggregator) {
    var TourOptionListView = Backbone.Marionette.CollectionView.extend({
        collection: PackageUpgradeCollection,
        itemView: TourOptionView,
        className: 'booking customizations optional_excursions',
        tagName: 'div'
    });
    // Our module now returns our view
    return TourOptionListView;
});
