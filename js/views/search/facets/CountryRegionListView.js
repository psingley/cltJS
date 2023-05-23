
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'views/search/facets/CountryRegionView',
    'app',
    'collections/search/facets/CountryRegionCollection',
    'event.aggregator',
    'models/search/facets/CountryRegionModel'
], function ($, _, Backbone, Marionette, CountryRegionView, App, CountryRegionCollection, EventAggregator, CountryRegionModel) {
    var CountryRegionListView = Backbone.Marionette.CollectionView.extend({
        collection: CountryRegionCollection,
        itemView: CountryRegionView,
        tagName: 'ul',
        className: 'option_list'
    });
    // Our module now returns our view
    return CountryRegionListView;
});
