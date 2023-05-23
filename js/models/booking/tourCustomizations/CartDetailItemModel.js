define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {
    var CartDetailItemModel = Backbone.Model.extend({
        defaults: {
            id: '',
            packageItemId: 0,
            price: 0,
            title: '',
            quantity: 0,
            total: 0,
            formattedServiceDate: '',
        	passengerTypeName: '',
            serviceDate: new Date().minDate,
            commission: 0,
            unit: '',
            totalCommission: 0
        }
    });
    return CartDetailItemModel;
});