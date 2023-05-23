// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone'
], function($,_, Backbone){
    var TourDateEventModel = Backbone.Model.extend({
        defaults: {
            id: '',
            title: '',
            description: '',
            icon: '',
            alt: ''
        }
    });
    // Return the model for the module
    return TourDateEventModel;
});
