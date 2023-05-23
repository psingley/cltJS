// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/tour/otherTours/OtherTourModel'
], function(_, Backbone, OtherTourModel){
    var OtherTourCollection = Backbone.Collection.extend({
        defaults: {
            model: OtherTourModel
        }
    });
    // Return the model for the module
    return OtherTourCollection;
});