// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/search/facets/TourFeatureModel',
    'app'
], function(_, Backbone, TourFeatureModel, App){
    var TourFeatureCollection = Backbone.Collection.extend({
        defaults: {
            model: TourFeatureModel
        }        
    });
    // Return the model for the module
    return TourFeatureCollection;
});