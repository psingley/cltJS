// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone'
], function($,_, Backbone){
    var GuidedTravelPerkModel = Backbone.Model.extend({
        defaults: {
            title: '',
            description: '',
            url: '',
            urlTitle: ''
        }
    });
    // Return the model for the module
    return GuidedTravelPerkModel;
});
