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
            city: ''
        }
    });
    // Return the model for the module
    return TourExtensionModel;
});
