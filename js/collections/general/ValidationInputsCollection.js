define([
    'underscore',
    'backbone',
    'models/general/ValidationInputModel'
], function(_, Backbone, ValidationInputModel){
    var ValidationInputsCollection = Backbone.Collection.extend({
        defaults: {
            model: ValidationInputModel
        }
    });
    // Return the model for the module
    return ValidationInputsCollection;
});
