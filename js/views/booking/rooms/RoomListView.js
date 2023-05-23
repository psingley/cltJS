define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'views/booking/rooms/RoomLayoutView',
    'app',
    'collections/booking/rooms/RoomCollection',
    'util/booking/bookingUtil',
    'util/timeoutUtil'
], function ($, _, Backbone, Marionette, RoomLayoutView, App, RoomCollection, BookingUtil, TimeoutUtil) {
    var RoomListView = Backbone.Marionette.CollectionView.extend({
        collection: RoomCollection,
        itemView: RoomLayoutView,
        itemViewOptions: function (model, index) {
            return {
                roomIndex: index + 1
            }
        },
        travelerCollectionEvents: {
            //"change": "updateSum",
            'add': 'updateSum',
            'remove': 'updateSum'
        },
        initialize: function () {
            //bind the model events
            Marionette.bindEntityEvents(this, App.Booking.travelers, this.travelerCollectionEvents);
        },
        timeoutUtil: new TimeoutUtil(),
        updateSum: function () {
            this.timeoutUtil.suspendOperation(800, function () {
                App.Booking.Steps['roomsStep'].calculateStepPrice();
            });
        }
    });
    // Our module now returns our view
    return RoomListView;
});
