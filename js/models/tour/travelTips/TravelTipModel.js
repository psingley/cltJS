// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone'
], function($,_, Backbone){
    var TravelTipModel = Backbone.Model.extend({
        defaults: {
            tip: '',
            shortTip: '',
            category: ''
        }
    });
    // Return the model for the module
    return TravelTipModel;
});
