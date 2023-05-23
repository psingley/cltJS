// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone'
], function($,_, Backbone){
    var MediaImageModel = Backbone.Model.extend({
        defaults: {
            url: '',
            altTag:'',
            id:'',
            width:'',
            height:''
        }
    });
    // Return the model for the module
    return MediaImageModel;
});