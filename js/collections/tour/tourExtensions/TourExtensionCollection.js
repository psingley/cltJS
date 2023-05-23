// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/tour/tourExtensions/TourExtensionModel'
], function(_, Backbone, TourExtensionModel){
    var TourExtensionCollection = Backbone.Collection.extend({
        model: TourExtensionModel
    });
    // Return the model for the module
    return TourExtensionCollection;
});