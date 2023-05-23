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
    'views/booking/tourCustomizations/TourAdditionalFeesView'
], function($, _, Backbone, Marionette, App, PackageUpgradeCollection, TourAdditionalFeesView){
    var TourAdditionalFeesListView = Backbone.Marionette.CollectionView.extend({
        collection: PackageUpgradeCollection,
        itemView: TourAdditionalFeesView
    });

    return TourAdditionalFeesListView;
});