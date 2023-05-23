define([
    'jquery',
    'underscore',
    'backbone',
    'collections/booking/flights/FlightCollection'
], function ($, _, Backbone, FlightCollection) {
    var AirfairOptionModel = Backbone.Model.extend({
        defaults: {
            id: 0,
            flights: FlightCollection,
            name: '',
            pricePerPerson: 0
        }
    });
    return AirfairOptionModel;
});