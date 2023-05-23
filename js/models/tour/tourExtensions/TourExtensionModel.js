// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone'
], function($,_, Backbone){
    var TourExtensionModel = Backbone.Model.extend({
        defaults: {
            title: '',
            description: '',
            summary: '',
            price: 0,
            city: '',
            test123: 'model_1'
        }
    });
    // Return the model for the module
    return TourExtensionModel;
});
