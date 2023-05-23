// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone'
], function($,_, Backbone){
    var AgentModel = Backbone.Model.extend({
        defaults: {
            name: '',
            specialist:false,
            addressLine1: '',
            addressLine2: '',
            phone:'',
            email:'',
            distance:''
        }
    });
    // Return the model for the module
    return AgentModel;
});