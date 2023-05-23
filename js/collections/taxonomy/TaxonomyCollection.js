// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/taxonomy/TaxonomyModel'
], function(_, Backbone, TaxonomyModel){
    var TaxonomyCollection = Backbone.Collection.extend({
        defaults: {
            model: TaxonomyModel
        }
    });
    // Return the model for the module
    return TaxonomyCollection;
});