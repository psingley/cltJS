define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {
    var InTourFlightModel = Backbone.Model.extend({
        defaults: {
            serviceDate: new Date().minDate,
            departureAirport: '',
            departureAirportCode: '',
            arrivalAirport: '',
            arrivalAirportCode: ''
        }
    });
    return InTourFlightModel;
});