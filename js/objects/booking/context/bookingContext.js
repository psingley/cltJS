/**
 * The booking context class defines the different steps,
 * is subscribed to the onBookingComplete event as well as
 * the togglePackageUpgrades event.
 *
 * It can be inherited by other booking context classes.
 *
 * @class bookingContext
 * @constructor
 */
define([
    'domReady',
    'app',
    'jquery',
    'backbone',
    'marionette',
    'event.aggregator',
    'util/uriUtil',
    'util/objectUtil',
    'renderedLayouts/booking/StepNavigationLayout',
    'services/bookingService',
    'views/booking/rooms/RoomListView',
    'renderedLayouts/booking/steps/RoomsStepLayout',
    'renderedLayouts/booking/steps/TourDateStepLayout',
    'util/booking/bookingUtil',
    'renderedLayouts/booking/steps/SummaryStepLayout',
    'renderedLayouts/booking/steps/TourCustomizationsStepLayout',
    'renderedLayouts/booking/steps/TravelerStepLayout',
    'renderedLayouts/booking/steps/FlightStepLayout'
],
    function (domReady, App, $, Backbone, Marionette, EventAggregator, UriUtil, ObjectUtil, StepNavigationLayout, BookingService, RoomListView, RoomsStepLayout, TourDateStepLayout, BookingUtil, SummaryStepLayout, TourCustomizationsStepLayout, TravelerStepLayout, FlightStepLayout) {
        var bookingContext = (function () {

            var tourCustomizationsCall = 0;

            var constructor = function () {
            };

            /**
             * Sets the traveler booking step
             *
             * @method travelerStep
             * @type renderedLayouts.booking.steps.TravelerStepLayout
             */
            constructor.prototype.travelerStep = function () {
                return new TravelerStepLayout();
            };

            /**
             * Sets the tour customizations step layout
             *
             * @method tourCustomizationsStep
             * @type {renderedLayouts.booking.steps.TourCustomizationsStepLayout}
             */
            constructor.prototype.tourCustomizationsStep = function () {
                return new TourCustomizationsStepLayout();
            };

            /**
             * Sets the rooms step layout
             *
             * @method roomsStep
             * @type {renderedLayouts.booking.steps.RoomsStepLayout}
             */
            constructor.prototype.roomsStep = function () {
                return new RoomsStepLayout();
            };

            /**
             * Sets the tour date step layout
             *
             * @method tourDateStep
             * @type {renderedLayouts.booking.steps.TourDateStepLayout}
             */
            constructor.prototype.tourDateStep = function () {
                return new TourDateStepLayout();
            };

            /**
             * Sets the flight step layout
             *
             * @method flightStep
             * @type {renderedLayouts.booking.steps.FlightStepLayout}
             */
            constructor.prototype.flightStep = function () {
                return new FlightStepLayout();
            };

            /**
             * Sets the summary step layout
             *
             * @method summaryStep
             * @type {renderedLayouts.booking.steps.SummaryStepLayout}
             */
            constructor.prototype.summaryStep = function () {
                return new SummaryStepLayout();
            };

            /**
             * Sets the step navigation layout
             *
             * @property stepNavigation
             * @type {renderedLayouts.booking.StepNavigationLayout}
             */
            constructor.prototype.stepNavigation = function () {
                return new StepNavigationLayout();
            };

            /**
             * Sets up all of the step renderedLayouts that are rendered
             * server side by Sitecore
             *
             * @method onPageLoad
             * @returns void
             */
            constructor.prototype.onPageLoad = function () {
                var outerScope = this;
                domReady(function () {
                    //instantiate all renderedLayouts for server side rendered components
                    outerScope.stepNavigation();

                    //instantiate step renderedLayouts
                    App.Booking.Steps = {
                        travelerStep: outerScope.travelerStep(),
                        upgradesStep: outerScope.tourCustomizationsStep(),
                        roomsStep: outerScope.roomsStep(),
                        tourDateStep: outerScope.tourDateStep(),
                        flightStep: outerScope.flightStep(),
                        summaryStep: outerScope.summaryStep()
                    };

                });
            };

            /**
             * Sets booking overview and summary fields
             *
             * @method onGetBookingComplete
             */
            constructor.prototype.onGetBookingComplete = function () {
                var outerScope = this;
                EventAggregator.on('getBookingComplete', function (booking) {
                    outerScope.setTravelers(booking);
                    //set the global variables here
                    App.Booking.numberOfItineraryDays = booking.get('numberOfItineraryDays');
                    App.Booking.totalNumberOfItineraryDays = booking.get('totalNumberOfItineraryDays');
                    App.Booking.isFamilyTour = booking.get('isFamilyTour');
                    App.Booking.isAAAVacationsTour = booking.get('isAAAVacationsTour');
                    App.Booking.discount = booking.get('discount');
                    App.Booking.aaaDiscount = booking.get('aaaDiscount');
                    /*App.Booking.hotDeal = booking.get('hotDeal');
                    App.Booking.percentageOffer = booking.get('percentageOffer');
                    App.Booking.earlyBookingBonus = booking.get('earlyBookingBonus');
                    App.Booking.seasonalOffer = booking.get('seasonalOffer');*/
                    App.Booking.tourDateOffset = booking.get('tourDateOffset');
                    App.Booking.tourDateReturnOffset = booking.get('tourDateReturnOffset');
                    if (booking.passengerWasAutoInit)
                        App.Booking.passengerAutoInit = true;

                    var summaryFields = booking.get('summaryFields');
                    BookingUtil.setSummaryFields(summaryFields, booking.get('totalCommissionLocal'));
                    BookingUtil.adjustBookingOverview(booking.toJSON());
                });
            };

            /**
             * Sets the travelers collection
             *
             * @method setTravelers
             * @param booking
             */
            constructor.prototype.setTravelers = function (booking) {
                if (!(App.Booking.travelers.length > 0)) {
                    App.Booking.travelers.setTravelers(booking.get('travelers'));
                }
            };

            constructor.prototype.onSubmitTourCustomizationsClick = function () {
                EventAggregator.on('submitTourCustomizationsClick', function () {
                    tourCustomizationsCall++;
                    if (App.Booking.tourCustomizationsSaveIndex)

                    var i = 0;
                    while (i < App.Booking.assignedPackageUpgrades.length){
                        var currentUpgrade = App.Booking.assignedPackageUpgrades.at(i);
                        var parentTourLayoutId = currentUpgrade.get("parentTourLayoutId");
                        if (!ObjectUtil.isNullOrEmpty(parentTourLayoutId) && ObjectUtil.isNullOrEmpty(App.Booking.assignedPackageUpgrades.findWhere({tourLayoutId: parentTourLayoutId}))) {
                                App.Booking.assignedPackageUpgrades.remove(currentUpgrade);
                        }
                        else {
                            i++;
                        }
                    }
                    EventAggregator.trigger('tourCustomizationsPrepared', tourCustomizationsCall);
                    if (App.Booking.hideFlightSchedule) {
                    	$('#airfareOptionsRegion').hide();
                    	$('.searchAirMessagesRegion').hide();
                    }
						if (App.Booking.hideFlightSchedule) {
							var $selectedSchedule = $('input[name=flight]');
							if (App.Booking.hideFlightSchedule) {
								$selectedSchedule.prop('active', false);
							}
						}
	                EventAggregator.trigger('searchForAirChanged');
                });
            };

            /**
             * Subscribes to togglePackageUpgrades event
             *
             * @method onTogglePackageUpgrades
             */
            constructor.prototype.onTogglePackageUpgrades = function () {
                /**
                 * Handles all of the actions for when package upgrades are selected
                 *
                 * @event togglePackageUpgrades
                 */
            	EventAggregator.on('togglePackageUpgrades', function ($target, packageUpgradeModel) {
		            if (packageUpgradeModel.attributes!=null) {
			            var isPre = packageUpgradeModel.attributes.serviceOrder.id === App.taxonomy.getId('serviceOrders', 'Pre');
			            var isPost = packageUpgradeModel.attributes.serviceOrder.id === App.taxonomy.getId('serviceOrders', 'Post');
		            }

		            if (isPre || isPost) {
			            App.Booking.hideFlightSchedule = true;
		            }

		            if ($target.prop('type') == 'checkbox') {
                        if ($target.is(':checked')) {
                            App.Booking.assignedPackageUpgrades.add(packageUpgradeModel);
                        } else {
                            App.Booking.assignedPackageUpgrades.remove(packageUpgradeModel);
                        }
                    }

                    if ($target.prop('type') == 'radio') {
                        if ($target.is(':checked')) {
                            App.Booking.assignedPackageUpgrades.add(packageUpgradeModel);

                            //get all of the radio buttons with the same name
                            var $parentDiv = $target.closest('.section');
                            var $otherRadioButtons =
                                $parentDiv
                                    .find('.packageUpgrade_checkbox[name="' + $target.attr('name') + '"]');

                            //return only the radio buttons that aren't selected and are an assigned
                            //package
                            $otherRadioButtons = _.filter($otherRadioButtons, function (radioButton) {
                                var isAssignedPackage =
                                    App.Booking.assignedPackageUpgrades.find(function (upgrade) {
                                        return upgrade.get('id') == $(radioButton).data('id');
                                    });

                                var isNotClickedPackage = $(radioButton).data('id') != $target.data('id');
                                return isNotClickedPackage && isAssignedPackage != undefined;
                            });

                            //remove all of the package upgrades other than the one selected in the
                            //radio button group
                            _.each($otherRadioButtons, function (button) {
                                var $button = $(button);
                                var upgradeId = $button.data('id');
                                App.Booking.assignedPackageUpgrades.remove(upgradeId);
                            });
                        } else {
                            var inAssignedPackages = App.Booking.assignedPackageUpgrades.find(function (packageUpgrade) {
                                return packageUpgrade.get('id') === packageUpgradeModel.get('id');
                            });

                            if (inAssignedPackages) {
                                App.Booking.assignedPackageUpgrades.remove(packageUpgradeModel);
                            }
                        }
                    }

                    App.Booking.Steps['upgradesStep'].calculateStepPrice();
                    App.Booking.Steps['flightStep'].calculateStepPrice();
                });
            };

            return constructor;
        })();

        return bookingContext;
    });