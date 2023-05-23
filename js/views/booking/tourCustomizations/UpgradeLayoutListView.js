define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'views/booking/tourCustomizations/UpgradeLayoutView',
    'collections/booking/tourCustomizations/PackageUpgradeGroupCollection'
], function ($, _, Backbone, Marionette, UpgradeLayoutView, PackageUpgradeGroupCollection) {

    var UpgradeLayoutListView = Backbone.Marionette.CollectionView.extend({
        itemView: UpgradeLayoutView,
        collection: PackageUpgradeGroupCollection,
        itemViewOptions: function (model, index) {
            return {
                index: index
            }
        }
    });

    return UpgradeLayoutListView;
});