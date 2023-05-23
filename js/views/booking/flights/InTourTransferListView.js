define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'views/booking/flights/InTourTransferView',
    'app',
    'collections/booking/tourCustomizations/BookingPackageUpgradeCollection',
    'event.aggregator'
], function ($, _, Backbone, Marionette, InTourTransferView, App, PackageUpgradeCollection, EventAggregator) {
    var InTourTransferListView = Backbone.Marionette.CollectionView.extend({
        collection: PackageUpgradeCollection,
        itemView: InTourTransferView
    });
    // Our module now returns our view
    return InTourTransferListView;
});
