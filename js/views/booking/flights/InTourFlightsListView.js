define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'text!templates/booking/flights/inTourFlightListTemplate.html',
    'views/booking/flights/InTourFlightView',
    'collections/booking/flights/InTourFlightCollection',
    'event.aggregator'
], function ($, _, Backbone, Marionette, App, inTourFlightListTemplate, InTourFlightView, InTourFlightCollection, EventAggregator) {
    var InTourFlightListView = Backbone.Marionette.CompositeView.extend({
        collection: InTourFlightCollection,
        template: Backbone.Marionette.TemplateCache.get(inTourFlightListTemplate),
        templateHelpers: function () {
            return {
                dateText: App.dictionary.get('tourRelated.Booking.Date'),
                fromText: App.dictionary.get('tourRelated.Booking.FlightsProtection.From'),
                toText: App.dictionary.get('tourRelated.Booking.FlightsProtection.To')
            }
        },
        itemView: InTourFlightView,
        appendHtml: function (collectionView, itemView) {
            // ensure we nest the child list inside of
            // the current list item
            //collectionView.$(".inTourFlights").append(itemView.el);
        },
        initialize: function () {
            var outerScope = this;
            /*EventAggregator.on('searchForAirChanged', function () {
                //if they are not getting air from us show in tour transfers
                if (App.Booking.Steps['flightStep'].getAddAir()) {
                    outerScope.$el.closest('.section').show();
                } else {
                    //if they are getting air hide this section
                    outerScope.$el.closest('.section').hide();
                }
            });*/
        }
    });
    return InTourFlightListView;
});