define([
    'jquery',
    'underscore',
    'backbone',
    'models/booking/travelerInformation/TravelerModel',
    'text!templates/booking/rooms/orphanedTravelerTemplate.html',
    'event.aggregator',
    'app'
], function ($, _, Backbone, TravelerModel, travelerSmallLayoutTemplate, EventAggregator, App) {
    var OrphanedTravelerView = Backbone.Marionette.ItemView.extend({
        model: TravelerModel,
        template: Backbone.Marionette.TemplateCache.get(travelerSmallLayoutTemplate),
        templateHelpers: function () {
            return {
                travelerText: App.dictionary.get('tourRelated.Booking.TravelerInfo.Traveler'),
                assignToRoomText: App.dictionary.get('tourRelated.Booking.RoomingTravelerInfo.AssignToRoom'),
                travelerIndex: this.options.travelerIndex,
                cid: this.model.cid,
                personPrice: App.siteSettings.includeInterAirPrice ? this.model.get('price') + this.model.get('interAirPrice') : this.model.get('price'),
                assignText: App.dictionary.get('tourRelated.Booking.TravelerInfo.Assign')
            }
        },
        initialize: function () {
            var outerScope = this;
            EventAggregator.on('numberOfRoomsUpdate', function () {
                outerScope.updateRoomsDropDown();
            });
        },
        updateRoomsDropDown: function () {
            var $roomsDropDown = this.$el.find('.rooms');
            $roomsDropDown.empty();
            App.Booking.rooms.each(function (room) {
                var index = App.Booking.rooms.indexOf(room) + 1;
                $roomsDropDown.append('<option data-cid="' + room.cid + '">Room ' + index + '</option>');
            });
        },
        onShow: function () {
            this.updateRoomsDropDown();
        }
    });

    return OrphanedTravelerView;
});