define([
    'underscore',
    'backbone',
    'models/search/facetItems/FacetItemModel',
    'collections/search/facetItems/FacetItemCollection'
], function(_, Backbone, FacetItemModel, FacetItemCollection){
    var FacetModel = Backbone.Model.extend({
        defaults: {
            id: '0',
            title: '',
            items: FacetItemCollection,
            searchType: 'equalTo'
        },
        initialize: function () {
            this.items = new FacetItemCollection();
            this.fetchCollections();
        },
        fetchCollections: function () {
            //when we call fetch for the model we want to fill its collections
            this.items.set(
                _(this.get("items")).map(function(item){
                    return new FacetItemModel(item);
                })
            );
        }
    });
    // Return the model for the module
    return FacetModel;
});
