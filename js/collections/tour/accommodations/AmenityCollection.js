// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/tour/accommodations/AmenityModel'
], function(_, Backbone, AmenityModel){
    var AmenityCollection = Backbone.Collection.extend({
        defaults: {
            model: AmenityModel
        }
    });
    // Return the model for the module
    return AmenityCollection;
});