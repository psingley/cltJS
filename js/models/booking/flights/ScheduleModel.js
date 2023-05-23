define([
    'jquery',
    'underscore',
    'backbone',
    'app',
    'moment',
    'models/booking/flights/FlightModel',
    'collections/booking/flights/FlightCollection',
    'util/objectUtil'
], function ($, _, Backbone, App, Moment, FlightModel, FlightCollection, ObjectUtil) {
    var ScheduleModel = Backbone.Model.extend({
        defaults: {
            price: 0,
            ticketByDate: new Date().minDate,
            contractType: '',
            fareType: null,
            isFlexibleAir: false,
            flights: [],
            departureDurationInMinutes:0,
            arrivalDurationInMinutes:0,
            sortDeparture: new Date().minDate,
            sortArrival: new Date().minDate,
            sortDurationMinutes: 0,
            sortStops: 0,
            passengerType: '',
            tax: 0
        },
        initialize: function(schedule) {
            if(!ObjectUtil.isNullOrEmpty(schedule)) {
                this.setFlightSchedule(schedule);
            }
        },
        setFlightSchedule: function (schedule) {
            _.sortBy(schedule.flights, 'departureDateTime');

            var flights = _.chain(schedule.flights)
                        .groupBy('serviceOrderId')
                        .map(function(value, key){
                            return {
                                serviceOrderId: parseInt(key),
                                flights: new FlightCollection(value)
                            }
                        })
                        .value();
            _.sortBy(flights, 'serviceOrderId');

            //set sort values
            var departureFlights = this.getFlightsByServiceOrderId(flights, App.taxonomy.getTaxonomyItem('serviceOrders', 'Pre').neoId),
                arrivalFlights = this.getFlightsByServiceOrderId(flights, App.taxonomy.getTaxonomyItem('serviceOrders', 'Post').neoId),
                departureFlightsCount = ObjectUtil.isNullOrEmpty(departureFlights) ? 0 : departureFlights.length,
                arrivalFlightsCount = ObjectUtil.isNullOrEmpty(arrivalFlights) ? 0 : arrivalFlights.length;

            var earliestFlight = _.first(schedule.flights),
                latestFlight = _.last(schedule.flights),
                departureDate = ObjectUtil.isNullOrEmpty(earliestFlight) ? null : earliestFlight.departureDateTime,
                arrivalDate = ObjectUtil.isNullOrEmpty(latestFlight) ? null : latestFlight.arrivalDateTime;

            if (!ObjectUtil.isNullOrEmpty(departureDate) > 0 && !ObjectUtil.isNullOrEmpty(arrivalDate) > 0 ) {
                var sortDepartureDate = new Date(departureDate);
                var sortArrivalDate = new Date(arrivalDate);

                this.set({
                    price: schedule.price,
                    ticketByDate: schedule.ticketByDate,
                    contractType: schedule.contractType,
                    isFlexibleAir: schedule.isFlexibleAir,
                    fareType: schedule.fareType,
                    sortDeparture: sortDepartureDate,
                    sortArrival: sortArrivalDate,
                    sortDurationMinutes: schedule.departureDurationInMinutes + schedule.arrivalDurationInMinutes,
                    tax: schedule.tax,
                    fuelSurcharge: schedule.fuelSurcharge,
                    passengerType: schedule.passengerType,
                    sortStops: departureFlightsCount + arrivalFlightsCount - 2,
                    osiMessage: schedule.osiMessage,
                    ticketBy: schedule.ticketBy,
                    fareCommand: schedule.fareCommand,
                    departureStops:departureFlightsCount - 1,
                    arrivalStops: arrivalFlightsCount - 1,
                    flightGroups: flights,
                    departureDurationInMinutes:schedule.departureDurationInMinutes,
                    arrivalDurationInMinutes:schedule.arrivalDurationInMinutes
                });
            }
        },
        getFlightsByServiceOrderId: function(flights, serviceOrderId){
            var group = _.find(flights, function(flightGroup) {
                return flightGroup.serviceOrderId === serviceOrderId;
            });

            return ObjectUtil.isNullOrEmpty(group) ? null : group.flights;
        }
    });
    return ScheduleModel;
});