define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'renderedLayouts/booking/steps/BaseStepLayout',
    'services/bookingService',
    'util/booking/bookingUtil',
    'views/validation/ErrorView',
    'event.aggregator',
    'views/booking/flights/InTourTransferLayoutView',
    'renderedLayouts/booking/flights/SedanServiceLayout',
    'renderedLayouts/booking/flights/FlightsLayout',
    'renderedLayouts/booking/flights/TravelProtectionLayout',
    'util/objectUtil',
    'goalsUtil',
    'util/dataLayerUtil',
    'util/travelerUtil',
	'collections/booking/tourCustomizations/BookingPackageUpgradeCollection',
	'util/seoTaggingUtil'
], function (
    $,
    _,
    Backbone,
    Marionette,
    App,
    BaseStepLayout,
    BookingService,
    BookingUtil,
    ErrorView,
    EventAggregator,
    InTourTransferLayoutView,
    SedanServiceLayout,
    FlightsLayout,
    TravelProtectionLayout,
    ObjectUtil,
    goalsUtil,
    DataLayerUtil,
    TravelerUtil,
	PackageUpgradeCollection,
	SeoTaggingUtil) {
    var FlightStepLayout = BaseStepLayout.extend({
        el: '#FlightsandProtection',
        regions: function () {
            var regions = {
                'inTourTransfersRegion': '#inTourTransfersRegion',
                'flightsRegion': '#tourFlightsRegion'
            };

            return _.extend(regions, FlightStepLayout.__super__.regions);
        },
        events: {
            'click .button_next': 'submitStep'
        },
        initialize: function () {
            this.constructor.__super__.initialize.apply(this);
            var outerScope = this;
            DataLayerUtil.TourCustomizations();
            this.hideAllSections();
            this.includedText = App.dictionary.get('tourRelated.Booking.RoomingTravelerInfo.Included');
            this.sedanService = new SedanServiceLayout();
            this.flights = new FlightsLayout();
            this.travelProtection = new TravelProtectionLayout();

            EventAggregator.on('getBookingComplete', function (booking) {
                App.Booking.inTourTransfers = booking.inTourTransfers;
                outerScope.initInTourTransfers();
                outerScope.tourAdditionalFees = booking.tourAdditionalFees;
            });

            EventAggregator.on('roomingAndTravelersStepComplete', function () {
                outerScope.onRoomingAndTravelersStepComplete();
            });

            EventAggregator.on('flightsAndProtectionStep.subSectionChange', function () {
                outerScope.subSectionChange();
            });

            EventAggregator.on('airSearch-noFlightsAvailable', function () {
                //outerScope.removeInterAirPrice();
            });
        },
        subSectionChange: function () {
            this.validateStepWithoutAnimation(false);
        },
        initInTourTransfers: function () {
            this.inTourTransfersRegion.show(new InTourTransferLayoutView());
        },
        onRoomingAndTravelersStepComplete: function () {
            this.updateSubmissionStatus();
        },
        hideAllSections: function () {
            var $inTourTransfers = this.$el.find('#inTourTransfersRegion');
            if ($inTourTransfers.length > 0) {
                var $section = $inTourTransfers.closest('.section');
                $section.hide();
            }
        },

        submitStep: function (e) {
            e.preventDefault();
            var schedule = this.getSchedule();
            var interAirOnly = true;
            var addAir = this.getAddAir();
            var internalAir = this.hasInternalAir();
            var adultCount = this.flights.getPassengerCount();
            var sedanServiceSelection = this.getSedanServiceSelection();
            var sedanServiceAvailable = this.getSedanServiceAvailable();
            var sedanServicePrice = 0;
            if (!ObjectUtil.isNullOrEmpty(App.Booking.transferPrice)) {
                sedanServicePrice = App.Booking.transferPrice;
            }

            //air data needs to be validated if does not validate, we have some messages to display
            var errorAirDataMessages = [];
            errorAirDataMessages = this.flights.validateAirData([]);
            if (errorAirDataMessages.length != 0) {
                EventAggregator.trigger('flights.showAirMessages', new ErrorView(errorAirDataMessages));
                $('html, body').animate({
                    scrollTop: $(".section.flights_to_from").offset().top
                }, 'fast');
                document.querySelector('.searchAirMessagesRegion.pad div.errorMessages').style.display = 'none';
                return;
            }

            if (this.validateStep()) {
                var outerScope = this;
                var packageUpgrades = new PackageUpgradeCollection();

                var transfers = _.filter(App.Booking.assignedPackageUpgrades.models, function (update) {
                    return outerScope.isTransferOnTour(update);
                });
                if (transfers && transfers.length > 0) {
                    packageUpgrades.add(transfers);
                }

                if (App.Booking.assignedInsurance) {
                    packageUpgrades.add(App.Booking.assignedInsurance);
                }
                BookingService.flightsForm_Complete(addAir, schedule, interAirOnly, packageUpgrades, adultCount, sedanServiceSelection, sedanServiceAvailable, sedanServicePrice,internalAir)
                    .done(function (response) {
                        //submit goal for Add Flights
                        goalsUtil.bookingEngineAddFlights();

                        outerScope.updateBookingInfo(response);
                        outerScope.calculateStepPrice();
		                  outerScope.addIncludedText();
                        App.Booking.Steps['summaryStep'].calculateStepPrice();
						EventAggregator.trigger('submitFlightsComplete');

						//Criteo Pixel added

						if ($('#travelerInformationContent').length > 0 && !App.isUKSite) {

							var price = Number($('#grandTotal').text().replace(/[^0-9\.]+/g, ""));
							var url = window.location.pathname;
							var tourName = "";
							if (!ObjectUtil.isNullOrEmpty(url)) {
								var arr = url.split('/');
								tourName = arr[arr.length - 2];
							}

							var deviceType = /iPad/.test(navigator.userAgent)
								? "t"
								: /Mobile|iP(hone||od)|Android|BlackBerry|IEMobile|Silk/.test(navigator.userAgent)
									? "m"
									: "d";

							if (SeoTaggingUtil.useExternalScripts()) {
								window.criteo_q = window.criteo_q || [];
								var imported = document.createElement('script');
								imported.src = '//static.criteo.net/js/ld/ld.js';
								imported.async = 'true';
								document.head.appendChild(imported);
								window.criteo_q.push(
									{ event: "setAccount", account: App.siteSettings.criteoPixelId },
									{ event: "setSiteType", type: deviceType },
									{ event: "viewBasket", item: [{ id: tourName, price: price, quantity: 1 }] }
								);
							} else {
								console.log('Criteo Pixel');
								console.log('Event - SetAccount    Account -' + App.siteSettings.criteoPixelId);
								console.log('Event - setSiteType   Type - ' + deviceType);
								console.log('Event - ViewBasket');
								console.log("Item - " + tourName);
								console.log("Price - " + price + ' Quantity - 1');
							}
						}

			//Criteo Pixel ends
                        TravelerUtil.showIATA();
                        BookingUtil.goToNextStep(e);

                        DataLayerUtil.PaymentDataLayer();
                       
                    })
                    .fail(function (response) {
                        console.log(response.responseText);
                        outerScope.messagesRegion.show(new ErrorView([App.dictionary.get('tourRelated.Booking.FlightsProtection.AirSearchFailMessage')]));
                    });
            }
        },
        isTransferOnTour: function (upgrade) {
            var serviceType = upgrade.get('serviceType');
            var serviceOrder = upgrade.get('serviceOrder');

            var isTransfer = serviceType.id === App.taxonomy.getId('serviceTypes', 'Transfer');
            var isOnTour = serviceOrder.id === App.taxonomy.getId('serviceOrders', 'Tour');

            return isTransfer && isOnTour;
        },
        calculateStepPrice: function() {
	        var prices = [];

            var outerScope = this;
			var transfers = 0.00;
	        App.Booking.assignedPackageUpgrades.filter(function(upgrade) {
		        if (outerScope.isTransferOnTour(upgrade)) {
                    transfers += upgrade.get('price') * upgrade.get('quantity');
		        }
	        });

	        //get insurance price if selected
	        var $insurance = this.travelProtection.getCheckedInsurance();
	        var insurancePrice = 0.00;
	        if ($insurance.length > 0 && $insurance.val() === 'true') {
                insurancePrice = this.getInsurancePrice();
		        var $travelers = this.travelProtection.$el.find('input[name=traveler]:checked');
		        if ($travelers.length > 0 && $insurance.val() === 'true') {
			        insurancePrice = insurancePrice * $travelers.length;
		        }
	        }

	        var sedanServicePrice = 0.00;
	        if (!ObjectUtil.isNullOrEmpty(App.Booking.transferPrice) && this.getSedanServiceSelection() === 'true') {
		        sedanServicePrice = App.Booking.transferPrice * this.flights.getPassengerCount();
	        }

	        var schedule = this.getSchedule();
	        if (!ObjectUtil.isNullOrEmpty(schedule)) {
		        var priceAndTax = parseFloat(schedule.get('price') + schedule.get('tax'));
		        prices.push(priceAndTax.toFixed(2) * this.flights.getPassengerCount());
	        }

	        var flightTotal = 0.00;
            _.each(prices, function(price) {
                flightTotal += parseFloat(price);
            });

	        //update rooming & travelers price
	        var roomsStep = App.Booking.Steps['roomsStep'];
            //App.Booking.Steps['roomsStep'].stepPrice = roomsStep.stepLandOnlyPrice;
            //if (App.Booking.airSearchDone) {
            //    prices.push(roomsStep.stepLandOnlyPrice);
            //} else {
                prices.push(roomsStep.stepPrice);
            //}
            BookingUtil.adjustStepPrice(roomsStep.getStepDiv(), prices);

	        var stepNum = this.getStepDiv().data('step');
	        var navStep = $('#step_navigation > li[data-step="' + stepNum + '"]');
	        var $currencySelector = navStep.find('.currency');
	        if ($currencySelector.length == 0) {
	        	navStep.find('a').append('<span class="currency"></span>');
	        }

            var totalPassengers = this.flights.getPassengerCount();
            if (flightTotal > 0 && totalPassengers > 0) {
             	App.Booking.flightsPrice = flightTotal / totalPassengers;
            }
            else {
                App.Booking.flightsPrice = 0;
            }
	        var travelAndProtectionTotal = insurancePrice + sedanServicePrice + transfers;
            $('.transferProtection').text(travelAndProtectionTotal.toFixed(2).toString().formatPrice() + ' ' + App.siteSettings.currencyCode);

            this.stepPrice = flightTotal + travelAndProtectionTotal;
            BookingUtil.adjustGrandTotal();
        },
        addIncludedText: function () {
			if (this.getAddAir()) {
				$('#flightTotal').text(this.includedText);
			} else {
				$('#flightTotal').text("");
			}
        },
        getSedanServiceAvailable: function () {
            if (!ObjectUtil.isNullOrEmpty(App.Booking.showSedanService)) {
                return App.Booking.showSedanService;
            }

            return 'false';
        },
        getSchedule: function () {
            var $selectedSchedule = this.$el.find('input[name=flight]:checked');
            if (App.Booking.hideFlightSchedule) {
            	$selectedSchedule.prop('active', false);
	            return null;
            }
            if ($selectedSchedule.length == 0) {
                return null;
            }

            var selectedScheduleCid = $selectedSchedule.data('cid');
            var schedule = App.Booking.flightSchedules.find(function (schedule) {
                return schedule.cid === selectedScheduleCid;
            });

            if (schedule != undefined) {
                EventAggregator.trigger('flightIsChosen', schedule.get('isFlexibleAir'));
                return schedule;
            } else {
                return null;
            }
        },
        getInsurancePrice: function () {
            var $searchAirSelection = this.getSelectedSearchAir();

            if (!this.checkInsuranceAvailable()) {
                return null;
            }

            //if search for air is selected
            if ((!ObjectUtil.isNullOrEmpty($searchAirSelection) && $searchAirSelection.val() == 'true') || this.hasInternalAir()) {
                var insuranceAir = this.travelProtection.getAirInsurance();

                if (insuranceAir != undefined) {
                    return insuranceAir.get('price');
                } else {
                    console.log('could not find air insurance');
                }
            } else {
                var insuranceLand = this.travelProtection.getLandInsurance();

                if (insuranceLand != undefined) {
                    return insuranceLand.get('price');
                } else {
                    console.log('could not find land insurance');
                }
            }
        },
        hasInternalAir: function () {
            var bInternalAir = false;

            if (!ObjectUtil.isNullOrEmpty(this.tourAdditionalFees) && this.tourAdditionalFees.length > 0) {

                this.tourAdditionalFees.each(function (tourAdditionalFee) {
                    var serviceTypeDetail = tourAdditionalFee.get('serviceTypeDetail');

                    if (!ObjectUtil.isNullOrEmpty(serviceTypeDetail)) {

                        if (serviceTypeDetail.neoId == '299' || serviceTypeDetail.neoId == '157') {
                            bInternalAir = true;
                        }
                    }

                });
            }
            return bInternalAir;
        },
        checkInsuranceAvailable: function () {
            //make sure we actually have insurance
            if (App.Booking.insurance.length == 0) {
                console.log('no land insurance available for this tour');
                return false;
            }

            return true;
        },
        getSelectedSearchAir: function () {
            var $searchForAir = this.$el.find('.search_for_air:checked');
            if (!ObjectUtil.isNullOrEmpty($searchForAir) && $searchForAir.length > 0) {
                return $searchForAir;
            } else {
                console.log('could not find search air radio options');
                return null;
            }
        },
        getInterAirOnly: function () {
            //if they are responsible for their own air,
            // but would like to get in tour flights with us return true
            if (!this.getAddAir()) {
                var $interAirOnly = this.$el.find('input[name=inTour]:checked');
                if ($interAirOnly.length == 0) {
                    console.log('No inter air selector found');
                    return false;
                } else {
                    var interAirOnly = $interAirOnly.val();
                    return interAirOnly === 'true';
                }
            }
            else {
                return false;
            }
        },
        getAddAir: function () {
            var $searchAirSelection = this.getSelectedSearchAir();
            if (!ObjectUtil.isNullOrEmpty($searchAirSelection)) {
                var searchAirSelection = $searchAirSelection.val();
                return searchAirSelection === 'true';
            }
            return false;
        },
        getRequestACallback: function () {
            var $requestACallbackSelection = this.$el.find('.search_for_air:checked');
            if (!ObjectUtil.isNullOrEmpty($requestACallbackSelection) && $requestACallbackSelection.length > 0) {
                var requestACallbackSelection = $requestACallbackSelection.val();
                return requestACallbackSelection === 'callback';
            }
            return false;
        },
        getAirportId: function () {
            var $departCity = $(this.flightsRegion.el).find('#airportId');
            return $departCity.val();
        },
        getSedanServiceSelection: function () {
            var $shownOptions = this.sedanService.$el.find('input[name=sedanService]:visible');
            if ($shownOptions.length == 0) {
                return 'false';
            }
            var $sedanServiceSelection = $shownOptions.parent().find(':checked');

            if ($sedanServiceSelection.length == 0) {
                return 'false';
            }

            return $sedanServiceSelection.val();
        },
        getTravelerTypeCounts: function () {
            var travelerTypeCounts = App.Booking.travelers.countBy(function (traveler) {
                var passengerType = traveler.get('passengerType');
                return passengerType.id === App.taxonomy.getId('passengerTypes', 'Adult') ? 'Adult' : 'Child';
            });

            if (travelerTypeCounts.Adult == undefined) {
                travelerTypeCounts.Adult = 0;
            }

            if (travelerTypeCounts.Child == undefined) {
                travelerTypeCounts.Child = 0;
            }
        },
        removeInterAirPrice: function () {
            if(App.siteSettings.includeInterAirPrice) {
                var prices = [];
                var roomsStep = App.Booking.Steps['roomsStep'];
                prices.push(roomsStep.stepLandOnlyPrice);
                BookingUtil.adjustStepPrice(roomsStep.getStepDiv(), prices);
                BookingUtil.adjustGrandTotal();
            }
        }
    });
    return FlightStepLayout;
});