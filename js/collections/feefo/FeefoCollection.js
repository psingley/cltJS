define([
    'underscore',
    'backbone',
    'models/feefo/FeefoReviewModel'
], function(_, Backbone, FeefoReviewModel){
    var FeefoCollection = Backbone.Collection.extend({
        defaults: {
            model: FeefoReviewModel
        }
    });
    // Return the model for the module
    return FeefoCollection;
});