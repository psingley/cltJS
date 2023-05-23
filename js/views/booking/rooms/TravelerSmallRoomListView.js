define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'util/animationUtil',
    'views/booking/rooms/TravelerSmallRoomView',
    'app',
    'collections/booking/travelerInformation/TravelerCollection'
], function ($, _, Backbone, Marionette, AnimationUtil, TravelerSmallRoomView, App, TravelerCollection) {
    var TravelerSmallRoomListView = Backbone.Marionette.CollectionView.extend({
        collection: TravelerCollection,
        itemView: TravelerSmallRoomView,
        events: {
            'click .delete': 'removeTraveler'
        },
        itemViewOptions: function (model, index) {
            return {
                travelerNumber: App.Booking.travelers.length
	        };
        },
        removeTraveler: function (e) {
            e.preventDefault();
            AnimationUtil.startItineraryAnimationSlow();
            var $traveler = $(e.target);
            var travelerId = $traveler.data('cid');
            this.collection.remove(travelerId);
	        $('.searchAirMessagesRegion').hide();
        }
      
    });
    // Our module now returns our view

    return TravelerSmallRoomListView;
});
