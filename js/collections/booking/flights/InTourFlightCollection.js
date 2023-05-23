/**
 * Created by ssinno on 10/23/13.
 */
// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/booking/flights/InTourFlightModel'
], function(_, Backbone, InTourFlightModel){
    var InTourFlightCollection = Backbone.Collection.extend({
        defaults: {
            model: InTourFlightModel
        },
        initialize: function(inTourFlights){
            var outerScope = this;
            _.each(inTourFlights, function(inTourFlight){
               var inTourFlightModel = new InTourFlightModel();
                inTourFlightModel.set({
                    serviceDate: inTourFlight.serviceDate,
                    departureAirport: inTourFlight.departureAirport,
                    departureAirportCode: inTourFlight.departureAirportCode,
                    arrivalAirport: inTourFlight.arrivalAirport,
                    arrivalAirportCode: inTourFlight.arrivalAirportCode
                });

                outerScope.add(inTourFlightModel);
            });
        }
    });
    // Return the model for the module
    return InTourFlightCollection;
});