// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone'
], function($,_, Backbone){
    var DistrictSaleManagerModel = Backbone.Model.extend({
        defaults: {
            name: '',
            region:'',
            phone: ''
        }
    });
    // Return the model for the module
    return DistrictSaleManagerModel;
});