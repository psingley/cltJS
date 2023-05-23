define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'views/booking/tourCustomizations/OnTourChoiceDayView',
    'app',
    'collections/booking/tourCustomizations/PackageUpgradesGroupedByDayCollection',
    'event.aggregator'
], function ($, _, Backbone, Marionette, OnTourChoiceDayView, App, PackageUpgradeCollection) {
    var OnTourChoiceDayListView = Backbone.Marionette.CollectionView.extend({
        collection: PackageUpgradeCollection,
        itemView: OnTourChoiceDayView
    });
    // Our module now returns our view
    return OnTourChoiceDayListView;
});
