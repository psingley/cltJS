// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone'
], function($,_, Backbone){
    var AmenityModel = Backbone.Model.extend({
        defaults: {
            name: '',
            available: false,
            note: ''
        }
    });
    // Return the model for the module
    return AmenityModel;
});
