// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/tour/accommodations/AccommodationModel'
], function(_, Backbone, AccommodationModel){
    var AccommodationCollection = Backbone.Collection.extend({
        defaults: {
            model: AccommodationModel
        }
    });
    // Return the model for the module
    return AccommodationCollection;
});