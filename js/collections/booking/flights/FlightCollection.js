/**
 * Created by ssinno on 10/23/13.
 */
// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/booking/flights/FlightModel',
    'util/objectUtil'
], function (_, Backbone, FlightModel, ObjectUtil) {
    var FlightCollection = Backbone.Collection.extend({
        defaults: {
            model: FlightModel
        },
        initialize: function(serviceOrderId, flights) {
            this.reset();
            var outerScope = this;
            if(!ObjectUtil.isNullOrEmpty(flights)) {
                _.sortBy(flights, 'departureDateTime');

                _.each(flights, function (flight) {
                    var flightModel = new FlightModel(flight);
                    outerScope.add(flightModel);
                });
            }
        }
    });
    // Return the model for the module
    return FlightCollection;
});