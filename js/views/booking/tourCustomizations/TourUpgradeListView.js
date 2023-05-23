define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'views/booking/tourCustomizations/TourUpgradeView',
    'collections/booking/tourCustomizations/BookingPackageUpgradeCollection'
], function($, _, Backbone, Marionette, TourUpgradeView, BookingPackageUpgradeCollection){

    var TourUpgradeListView = Backbone.Marionette.CollectionView.extend({
        itemView: TourUpgradeView,
        collection: BookingPackageUpgradeCollection,
        itemViewOptions: function(model, index){
            return{
                index: index
            }
        }
    });

    return TourUpgradeListView;
});