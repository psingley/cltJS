// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/search/facets/CountryRegionModel'
], function(_, Backbone, CountryRegionModel){
    var CountryRegionCollection = Backbone.Collection.extend({
        defaults: {
            model: CountryRegionModel
        }
    });
    // Return the model for the module
    return CountryRegionCollection;
});