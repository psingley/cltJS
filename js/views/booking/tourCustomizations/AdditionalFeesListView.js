/**
 * Created by ssinno on 2/3/14.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'collections/booking/tourCustomizations/BookingPackageUpgradeCollection',
    'views/booking/tourCustomizations/AdditionalFeesView'
], function($, _, Backbone, Marionette, App, PackageUpgradeCollection, AdditionalFeesView){
    var AdditionalFeesListView = Backbone.Marionette.CollectionView.extend({
        collection: PackageUpgradeCollection,
        itemView: AdditionalFeesView
    });

    return AdditionalFeesListView;
});