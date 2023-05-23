// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/tour/optionalExcursions/OptionalExcursionsModel'
], function(_, Backbone, OptionalExcursionsModel){
    var OptionalExcursionsCollection = Backbone.Collection.extend({
        defaults: {
            model: OptionalExcursionsModel
        }
    });
    // Return the model for the module
    return OptionalExcursionsCollection;
});