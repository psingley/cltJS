define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'event.aggregator',
    'app',
    'util/objectUtil',
    'views/booking/travelerInformation/TravelerSmallListView',
    'util/booking/bookingUtil',
    'views/validation/InfoView'
], function ($, _, Backbone, Marionette, EventAggregator, App, ObjectUtil, TravelerSmallListView, BookingUtil, InfoView) {
    var TravelProtectionLayout = Backbone.Marionette.Layout.extend({
        el: '#travelerProtectionRegion',
        regions: {
            travelersRegion: '.travelerCheckBoxes',
            messagesRegion: '#protectionMessagesRegion'
        },
        events: {
            'click input[name=protection]': 'toggleTravelProtection',
            'click input[name=traveler]': 'updateStepPrice'
        },
        initialize: function () {
        	var outerScope = this;

            EventAggregator.on('getBookingComplete submitRoomingAndTravelersComplete', function () {
                /*outerScope.showTravelerCheckBoxes();
                 */
                if (!App.Booking.Steps['flightStep'].checkInsuranceAvailable()) {
                    console.log('There is no insurance available for this tour');
                } else {
                    //wait until the prices have been updated then show the price of insurance
                    var landInsurance = outerScope.getLandInsurance();
                    if (landInsurance != undefined) {
                        EventAggregator.on('packageUpgrade:' + landInsurance.get('id') + ':changed', function () {
                            outerScope.updateInsurancePrice();
                        });
                    }

                    var airInsurance = outerScope.getAirInsurance();
                    if (airInsurance != undefined) {
                        EventAggregator.on('packageUpgrade:' + airInsurance.get('id') + ':changed', function () {
                            outerScope.updateInsurancePrice();
                        });
                    }

                    outerScope.currentInsurance = outerScope.getCurrentInsurance();
                }
            });

            EventAggregator.on('searchForAirChanged', function () {
            	outerScope.updateInsurancePrice();
            	outerScope.currentInsurance = outerScope.getCurrentInsurance();
	            outerScope.initInsuranceUpgrade();
	            outerScope.updateInsurance();
            });
        },
        initInsuranceUpgrade: function () {
            if (this.currentInsurance) {
                var $travelers = this.$el.find('input[name=traveler]:checked');
                this.currentInsurance.set({quantity: $travelers.length});
                this.setTravelerIds($travelers);
            }
        },
		updateInsurance: function() {
			var $insurance = this.getCheckedInsurance();

			if (!ObjectUtil.isNullOrEmpty($insurance) && $insurance.val() == 'true') {
				App.Booking.assignedInsurance = this.currentInsurance;
				App.Booking.Steps['flightStep'].calculateStepPrice();
			}
		},
        updateStepPrice: function (e) {
            App.Booking.Steps['flightStep'].calculateStepPrice();
            this.updateCheckboxQuantity(e);
        },
        updateInsurancePrice: function () {
            var $insurancePrice = this.$el.find('#insurancePrice');
            var perPersonText = App.dictionary.get('tourRelated.Booking.FlightsProtection.PerPerson');
            var insurancePrice = App.Booking.Steps['flightStep'].getInsurancePrice();

            if (!ObjectUtil.isNullOrEmpty(insurancePrice)) {
                $insurancePrice.text(insurancePrice.toString().formatPrice()  + ' ' + perPersonText);
            }
        },
        toggleTravelProtection: function (e) {
            var $target = $(e.target);
            if ($target.val() === 'true') {
                this.showTravelerCheckBoxes();
                this.initInsuranceUpgrade();
                App.Booking.assignedInsurance = this.currentInsurance;
                App.Booking.Steps['flightStep'].calculateStepPrice();
                this.messagesRegion.close();
            } else {
                this.closeTravelerCheckBoxes();
                App.Booking.assignedInsurance = null;
                App.Booking.Steps['flightStep'].calculateStepPrice();
                var message = App.Booking.sections.flightsAndProtection.insuranceDisclaimer;
                this.messagesRegion.show(new InfoView([message]));
            }

            App.Booking.Steps['flightStep'].updateSubmissionStatus();
        },
        setTravelerIds: function ($travelerCheckBoxes) {
            var travelerIds = [];
            _.each($travelerCheckBoxes, function (travelerCheckBox) {
                var $travelerCheckBox = $(travelerCheckBox);
                var travelerId = $travelerCheckBox.val();
                travelerIds.push(travelerId);
            });

            this.currentInsurance.set({travelerIds: travelerIds});
        },
        getCurrentInsurance: function () {
            var $searchAirSelection = this.isAirSearchSelected();

            //if search for air is selected
            if ((!ObjectUtil.isNullOrEmpty($searchAirSelection) && $searchAirSelection.val() == 'true') || App.Booking.Steps['flightStep'].hasInternalAir()) {
                var insuranceAir = this.getAirInsurance();

                if (insuranceAir != undefined) {
                    return insuranceAir;
                } else {
                    console.log('could not find air insurance');
                }
            } else {
                var insuranceLand = this.getLandInsurance();

                if (insuranceLand != undefined) {
                    return insuranceLand;
                } else {
                    console.log('could not find land insurance');
                }
            }
        },
        isAirSearchSelected: function () {
            var $searchForAir = $('.search_for_air:checked');
            if (!ObjectUtil.isNullOrEmpty($searchForAir) && $searchForAir.length > 0) {
                return $searchForAir;
            } else {
                console.log('could not find seach air radio options');
                return null;
            }
        },
        
        updateCheckboxQuantity: function (e) {
            var $target = $(e.target);

            if ($target.prop('type') === 'checkbox') {
                var $travelers = this.$el.find('input[name=traveler]:checked');
                this.currentInsurance.set({quantity: $travelers.length});
                this.setTravelerIds($travelers);
            }
        },
        getCheckedInsurance: function () {
            var $insuranceSelection = this.$el.find('input[name=protection]:checked');
            return $insuranceSelection;
        },
        showTravelerCheckBoxes: function () {
            this.travelersRegion.show(new TravelerSmallListView({collection: App.Booking.travelers, type: 'checkbox'}));
        },
        closeTravelerCheckBoxes: function () {
            this.travelersRegion.close();
        },
        getInsuranceQuantity: function () {
            var $travelers = this.$el.find('input[name=traveler]:checked');
            return $travelers.length;
        },
        getLandInsurance: function () {
            if (ObjectUtil.isNullOrEmpty(this.insuranceLand)) {
                this.insuranceLand = App.Booking.insurance.find(function (packageUpgrade) {
                    var serviceTypeDetail = packageUpgrade.get('layoutType');
                    return serviceTypeDetail.id == App.taxonomy.getId('layoutTypes', 'Land Supplement');
                });
            }
            return this.insuranceLand;
        },
        getAirInsurance: function () {
            if (ObjectUtil.isNullOrEmpty(this.insuranceAir)) {
                this.insuranceAir = App.Booking.insurance.find(function (packageUpgrade) {
                    var serviceTypeDetail = packageUpgrade.get('layoutType');
                    return serviceTypeDetail.id == App.taxonomy.getId('layoutTypes', 'Air Supplement');
                });
            }
            return this.insuranceAir;
        },
        removeInsurance: function(){
            var $insuranceItem = this.getCheckedInsurance();
            $insuranceItem.prop('checked', false);
            this.closeTravelerCheckBoxes();
            App.Booking.Steps['flightStep'].calculateStepPrice();
        }
    });

    return TravelProtectionLayout;
});