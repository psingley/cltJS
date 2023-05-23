// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/search/facetItems/FacetItemModel'
], function(_, Backbone, FacetItemModel){
    var FacetItemCollection = Backbone.Collection.extend({
        defaults: {
            model: FacetItemModel
        }
    });
    // Return the model for the module
    return FacetItemCollection;
});