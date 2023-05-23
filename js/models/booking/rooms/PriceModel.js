define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {
    var PriceItemModel = Backbone.Model.extend({
        defaults: {
            landPrice: 0,
            interAirPrice: 0
        }
    });
    return PriceItemModel;
});