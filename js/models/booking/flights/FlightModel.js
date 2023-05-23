define([
    'jquery',
    'underscore',
    'backbone',
    'app',
    'moment',
    'util/dateUtil',
    'util/objectUtil',
    'util/stringUtil'
], function ($, _, Backbone,App, Moment, DateUtil,  ObjectUtil, StringUtil ) {
    var FlightModel = Backbone.Model.extend({
        defaults: {
            price: '',
            airline: null,
            departureDateTime: new Date().minDate,
            arriveDateTime: new Date().minDate,
            arrivalAirport: null,
            departureAirport: null,
            cabin: null,
            operatedByAirline: null,
            flightNumber: 0,
            classOfService: '',
            equipment: ''
        },
        initialize: function(flight) {
            this.set({
                airline: flight.airline,
                equipment: flight.equipment,
                departureDateTime: flight.departureDateTime,
                arriveDateTime: flight.arriveDateTime,
                arrivalAirport: flight.arrivalAirport,
                departureAirport: flight.departureAirport,
                cabin: flight.cabin,
                operatedByAirline: flight.operatedByAirline,
                flightNumber: flight.flightNumber,
                classOfService: flight.classOfService
            });
        }
    });
    return FlightModel;
});