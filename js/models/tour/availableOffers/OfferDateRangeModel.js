// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone'
], function($,_, Backbone){
    var OfferDateRangeModel = Backbone.Model.extend({
        defaults: {
            startDate: new Date().minDate,
            endDate: new Date().minDate
        }
    });
    // Return the model for the module
    return OfferDateRangeModel;
});
