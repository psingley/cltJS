// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone'
], function($,_, Backbone){
    var ChatMessageModel = Backbone.Model.extend({
        defaults: {
            chatterName: '',
            message: '',
            isOperator:false
        }
    });
    // Return the model for the module
    return ChatMessageModel;
});