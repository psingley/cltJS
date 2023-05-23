define([
    'jquery',
    'underscore',
    'backbone',
    'models/booking/tourCustomizations/BookingPackageUpgradeModel',
    'text!templates/booking/flights/transferTemplate.html',
    'app',
    'event.aggregator',
    'util/taxonomy/taxonomyDomUtil',
    'views/booking/tourCustomizations/BasePackageUpgradeView'
], function ($, _, Backbone, PackageUpgradeModel, transferTemplate, App, EventAggregator, TaxonomyDomUtil, BasePackageUpgradeView) {
    var InTourTransferView = BasePackageUpgradeView.extend({
        model: PackageUpgradeModel,
        tagName: 'div',
        className: 'select_row inTourTransfer',
        regions: {
            'travelersRegion': '.travelerCheckBoxes'
        },
        template: Backbone.Marionette.TemplateCache.get(transferTemplate),
        events: {
            'click .packageUpgrade_checkbox': 'togglePackageUpgrade',
            'click input[name=traveler]': 'updateCheckboxQuantity'
        },
        initialize: function () {
            var outerScope = this;
            this.constructor.__super__.initialize.apply(this);

            if (this.isDepartureTransfer()){
                this.$el.addClass('departure');
            }

            if (this.isArrivalTransfer()){
                this.$el.addClass('arrival');
            }

            //update the number of rooms text
            EventAggregator.on('numberOfRoomsUpdate', function () {
                outerScope.$el.find('.noOfRooms').text(App.Booking.rooms.length);
            });

            //add or remove the package upgrade from assigned package upgrades
            EventAggregator.on('searchForAirChanged', function () {
                if (App.Booking.Steps['flightStep'].getAddAir()) {
                    //get the transfer check boxes and make sure they are unchecked
                    var $checkbox = outerScope.$el.find('.packageUpgrade_checkbox');
                    if ($checkbox.is(':checked')) {
                        $checkbox.prop('checked', false);
                        EventAggregator.trigger('togglePackageUpgrades', $checkbox, outerScope.model);
                    }
                }
            });
        },
        onPackageUpgradeChanged: function (price) {
            this.setPrice(price);
            this.setTransferQuantity();
        },
        templateHelpers: function () {
            return {
                roomsText: App.dictionary.get('tourRelated.Booking.TourCustomizations.Rooms'),
                nightsIncludedText: App.dictionary.get('tourRelated.Booking.TourCustomizations.NightsIncluded'),
                currencySymbol:App.siteSettings.currencySymbol
            }
        },
        updateCheckboxQuantity: function (e) {
            InTourTransferView.__super__.updateCheckboxQuantity.call(this, e);
            App.Booking.Steps['flightStep'].updateSubmissionStatus();
        },
        togglePackageUpgrade: function (e) {
            var $target;
            if (e.target) {
                $target = $(e.target);
            } else {
                $target = e;
            }

            this.toggleTravelers($target);
            EventAggregator.trigger('togglePackageUpgrades', $target, this.model);
            App.Booking.Steps['flightStep'].updateSubmissionStatus();
        },
        updateNoOfNights: function (e) {
            var $target = $(e.target);
            var $selectedOption = $target.find('option:selected');

            if (!$selectedOption.isNullOrEmpty()) {
                var noOfNights = $selectedOption.val();
                this.model.set({numberOfNights: noOfNights});
            }
        },
        isDepartureTransfer: function() {
            return this.model.get('contractName').toLowerCase().indexOf('departure') > -1;
        },
        isArrivalTransfer: function() {
            return this.model.get('contractName').toLowerCase().indexOf('arrival') > -1;
        }
    });

    return InTourTransferView;
});