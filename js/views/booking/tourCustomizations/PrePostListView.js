define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'views/booking/tourCustomizations/PrePostView',
    'app',
    'collections/booking/tourCustomizations/BookingPackageUpgradeCollection'    
], function ($, _, Backbone, Marionette, PrePostView, App, PackageUpgradeCollection) {
    var PrePostListView = Backbone.Marionette.CollectionView.extend({
        collection: PackageUpgradeCollection,
        itemView: PrePostView
    });
    // Our module now returns our view
    return PrePostListView;
});
