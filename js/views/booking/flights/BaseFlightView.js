define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'moment',
    'util/dateUtil',
    'util/objectUtil',
    'models/booking/flights/FlightModel'
], function ($, _, Backbone, Marionette, App, Moment, DateUtil, ObjectUtil, FlightModel) {
    var BaseFlightView = Backbone.Marionette.ItemView.extend({
        model: FlightModel,
        templateHelpers: function () {

            var arrivalDate = new Moment(this.model.get('arrivalDateTime'));
            var arrivalDateFormatted = arrivalDate.format('MMM DD, YYYY');
            var arrivalTimeFormatted = arrivalDate.format('hh:mm') + " " + DateUtil.getAMOrPM(arrivalDate);

            var departureDate = new Moment(this.model.get('departureDateTime'));
            var departureDateFormatted = departureDate.format('MMM DD, YYYY');
            var departureTimeFormatted = departureDate.format('hh:mm') + " " + DateUtil.getAMOrPM(departureDate);

            var flightText = App.dictionary.get('tourRelated.Booking.FlightsProtection.Flight');

            return{
                arriveText: App.dictionary.get('tourRelated.Booking.FlightsProtection.Arrive'),
                returnText: App.dictionary.get('tourRelated.Booking.FlightsProtection.Return'),
                departText: App.dictionary.get('tourRelated.Booking.FlightsProtection.Depart'),
                leaveText: App.dictionary.get('tourRelated.Booking.FlightsProtection.Leave'),
                continueText: App.dictionary.get('tourRelated.Booking.FlightsProtection.Continue'),
                layoverText: App.dictionary.get('tourRelated.Booking.FlightsProtection.Layover'),
                flightText: flightText,
                arrivalDateFormatted: arrivalDateFormatted,
                arrivalTimeFormatted: arrivalTimeFormatted,
                departureDateFormatted: departureDateFormatted,
                departureTimeFormatted: departureTimeFormatted
            }
        },
        onRender: function () {

            var target = this.$el;
            var url = this.model.get("url");
            if (!ObjectUtil.isNullOrEmpty(url)) {

                target.find('.airline_icon').show();
            }

        }

    });
    return BaseFlightView;
});