define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'views/dsmLocator/DistrictSaleManagerView',
    'collections/dsmLocator/DistrictSaleManagerCollection'
], function ($, _, Backbone, Marionette, App, EventAggregator, DistrictSaleManagerView, DistrictSaleManagerCollection) {
    var DistrictSaleManagerListView = Backbone.Marionette.CollectionView.extend({
        collection: DistrictSaleManagerCollection,
        tagName:"div",
        itemView: DistrictSaleManagerView
    });
    // Our module now returns our view
    return DistrictSaleManagerListView;
});