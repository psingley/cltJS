define([
    'jquery',
    'underscore',
    'backbone',
    'models/booking/tourCustomizations/BookingPackageUpgradeModel',
    'text!templates/booking/tourCustomizations/tourUpgradeTemplate.html',
    'app',
    'event.aggregator',
    'views/booking/tourCustomizations/BasePackageUpgradeView',
    'util/ObjectUtil'
], function ($, _, Backbone, BookingPackageUpgradeModel, tourUpgradeTemplate, App, EventAggregator, BasePackageUpgradeView, ObjectUtil) {
    var TourUpgradeView = BasePackageUpgradeView.extend({
        model: BookingPackageUpgradeModel,
        template: tourUpgradeTemplate,
        tagName: 'div',
        events: {
            'click .packageUpgrade_checkbox': 'togglePackageUpgrade'
        },
        initialize: function (options) {
            var outerScope = this;
            this.constructor.__super__.initialize.apply(this);
            this.index = options.index;

            EventAggregator.on('numberOfRoomsUpdate', function(){
                outerScope.$el.find('.noOfRooms').text(App.Booking.rooms.length);
            });
        },
        templateHelpers: function(){
            var outerScope = this;
          return {
              roomsText: function () {
                  if (!App.Booking.rooms.length || App.Booking.rooms.length == 1) {
                      return App.dictionary.get('tourRelated.Booking.RoomingTravelerInfo.Room');
                  }
                  return App.dictionary.get('tourRelated.Booking.TourCustomizations.Rooms');
              },
              nightsText: App.dictionary.get('tourRelated.Booking.TourCustomizations.Nights'),
              itemChecked: function() {
                  if (this.layoutType.neoId == 2) /*default optional*/
                      return "checked";
              },
              noOfRooms: App.Booking.rooms.length
          }
        },
        onRender: function () {
            if (this.index == 0) {
                this.$el.addClass('input_row top_border');
            } else {
                this.$el.addClass('input_row');
            }

            if (this.model.get("layoutType").neoId == 2 && ObjectUtil.isNullOrEmpty(this.model.get('parentTourLayoutId'))) {
                EventAggregator.trigger('togglePackageUpgrades', this.$el.find("input.packageUpgrade_checkbox"), this.model);
            }
        },
        togglePackageUpgrade: function(e){
            var $target = $(e.target);
            EventAggregator.trigger('togglePackageUpgrades', $target, this.model);
        }
    });

    return TourUpgradeView;
});