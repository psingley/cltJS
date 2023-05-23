define([
    'underscore',
    'backbone',
    'models/feefo/FeefoMediaModel'
], function(_, Backbone, FeefoMediaModel){
    var FeefoMediaCollection = Backbone.Collection.extend({
        defaults: {
            model: FeefoMediaModel
        }
    });
    // Return the model for the module
    return FeefoMediaCollection;
});