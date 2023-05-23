define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'views/booking/rooms/OrphanedTravelerView',
    'app',
    'collections/booking/travelerInformation/TravelerCollection',
    'text!templates/booking/rooms/orphanedTravelerListTemplate.html',
    'util/booking/bookingUtil',
    'event.aggregator'
], function ($, _, Backbone, Marionette, OrphanedTravelerView, App, TravelerCollection, orphanedTravelerListTemplate, BookingUtil, EventAggregator) {
    var OrphanedTravelersListView = Backbone.Marionette.CompositeView.extend({
        collection: TravelerCollection,
        itemView: OrphanedTravelerView,
        template: Backbone.Marionette.TemplateCache.get(orphanedTravelerListTemplate),
        templateHelpers: function () {
            return {
                unassignedTravelerText: App.dictionary.get('tourRelated.Booking.TravelerInfo.UnassignedTravelers'),
                assignText: App.dictionary.get('tourRelated.Booking.TravelerInfo.Assign')
            }
        },
        events: {
            'click .delete': 'removeTraveler',
            'click .assign' : 'assignTraveler'
        },
        itemViewOptions: function (model, index) {
            return {
                travelerIndex: index + 1
            }
        },
        appendHtml: function (collectionView, itemView) {
            // ensure we nest the child list inside of
            // the current list item
            collectionView.$("#unassignedTravelers").append(itemView.el);
        },
        assignTraveler: function(e){
            e.preventDefault();
            var travelerCid = $(e.target).data('cid');

            var assignedTraveler = App.Booking.travelers.find(function(traveler){
                return traveler.cid == travelerCid;
            });

            var $selectedRoom = this.$el.find('.rooms > option:selected');
            var room = App.Booking.rooms.find(function(room){
                return  room.cid == $selectedRoom.data('cid');
            });

            this.collection.remove(travelerCid);
            var roomIndex = App.Booking.rooms.indexOf(room) + 1;
            EventAggregator.trigger('roomTravelerAssigned:' + roomIndex, assignedTraveler);
        },
        removeTraveler: function (e) {
            e.preventDefault();

            var $traveler = $(e.target);
            var travelerId = $traveler.data('cid');
            this.collection.remove(travelerId);
            App.Booking.travelers.remove(travelerId);

            App.Booking.Steps['roomsStep'].calculateStepPrice();
        }
    });
    // Our module now returns our view
    return OrphanedTravelersListView;
});
