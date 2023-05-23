// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone',
    'models/general/MediaImageModel'
], function($,_, Backbone,MediaImageModel){
    var OtherTourModel = Backbone.Model.extend({
        defaults: {
            title: '',
            subtitle: '',
            summary: '',
            tourImage: MediaImageModel,
            url: '',
            urlTitle: ''
        }
    });
    // Return the model for the module
    return OtherTourModel;
});
