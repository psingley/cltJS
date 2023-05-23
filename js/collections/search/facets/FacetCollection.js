// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/search/facets/FacetModel'
], function(_, Backbone, FacetModel){
    var FacetCollection = Backbone.Collection.extend({
        defaults: {
            model: FacetModel
        }
    });
    // Return the model for the module
    return FacetCollection;
});