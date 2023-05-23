define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'app',
		'util/objectUtil',
		'views/validation/ErrorView',
		'event.aggregator'
	],
	function($, _, Backbone, Marionette, App, ObjectUtil,  ErrorView, EventAggregator) {
		/**
		 * All of the generic validation for the the completed step
		 * buttons live in this class. The class can be inherited
		 * and methods overwritten
		 *
		 * It can be inherited by other step validation classes.
		 *
		 * @class baseStepValidation
		 * @constructor
		 */
		var baseStepValidation = (function() {
			var constructor = function() {

				this.validateTourDate = function() {
					this.sections.tourDate.messages = [];

					var $tourDates = $('#section-dates-content');
					if ($tourDates.attr('class').indexOf("loading") >= 0) {
						return true;
					}
					var $selectedDate = $tourDates.find('input[name=date]:checked');

					if ($selectedDate.length == 0) {
						console.log('tour date step validation was false');
						var dateSelectText = App.dictionary.get('tourRelated.Booking.Pleaseselectadate');
						this.sections.tourDate.messages.push(dateSelectText);
						return false;
					}

					return true;
				};

				this.validateRooms = function() {
					this.sections.roomingAndTravelers.messages = [];

					if (App.Booking.orphanedTravelers.length > 0) {
						console.log('there are still orphaned travelers');
						var orphanedTravelersText = App.dictionary.get('tourRelated.Booking.RoomingTravelerInfo.OrphanedTravelers');
						this.sections.roomingAndTravelers.messages.push(orphanedTravelersText);
						return false;
					}
					//if we have no rooms this step is not valid
					if (App.Booking.rooms.length == 0) {
						var noRoomsText = App.dictionary.get('tourRelated.Booking.RoomingTravelerInfo.NoRooms');
						this.sections.roomingAndTravelers.messages.push(noRoomsText);
						return false;
					}

					var roomsWithNoTravelers = _.filter(App.Booking.rooms.models, function(room) {
						return room.get('travelerCids') == 0;
					});

					if (roomsWithNoTravelers.length != 0) {
						var noTravelersAssignedText = App.dictionary.get('tourRelated.Booking.RoomingTravelerInfo.NoTravelersAssigned');
						this.sections.roomingAndTravelers.messages.push(noTravelersAssignedText);
						_.each(roomsWithNoTravelers, function (room) {
							EventAggregator.trigger('noTravelersAssignedNotificationTriggered', room);
						});
						return false;
					}

					//make sure we have a guest config
					var invalidRoom = App.Booking.rooms.find(function(room) {
						return ObjectUtil.isNullOrEmpty(room.get('guestConfig'));
					});

					if (invalidRoom != undefined) {
						console.log('rooming and travelers validation was false');
						//var noGuestConfigText = App.dictionary.get('tourRelated.Booking.RoomingTravelerInfo.NoGuestConfig');
						//this.sections.roomingAndTravelers.messages.push(noGuestConfigText);
						return false;
					}

					return true;
				};

				this.validateTourCustomizations = function() {
					return true;
				};

				this.validateAllTravelersInfo = function() {

					var outerScope = this;
					var invalidTravelers = '';
					this.sections.travelerInfo.messages = [];
					this.sections.travelerInfo.travelerViews = [];

					App.Booking.travelers.each(
						function(traveler) {
							var messages = traveler.validate();
							if (messages.length > 0) {
								var prevTravelerView = App.Booking.travelerListView.findByModel(traveler);
								if (prevTravelerView != null) {
									outerScope.sections.travelerInfo.travelerViews.push(prevTravelerView);
								}

								if (invalidTravelers != '') {
									invalidTravelers += ", ";
								}

								if (traveler.get('firstName') === '') {
									invalidTravelers += traveler.get('placeholderText');
								} else {
									invalidTravelers += traveler.get('firstName');
								}
							}
						});

					if (invalidTravelers.length > 0) {
						var requiredFieldsText = App.dictionary.get('tourRelated.Booking.TravelerInfo.RequiredFields');
						this.sections.travelerInfo.messages.push(requiredFieldsText + " " + invalidTravelers);
						return false;
					}

					return true;
				};

				this.validateFlightsAndProtections = function() {
					this.sections.flightsAndProtection.messages = [];

					var flightStepLayout = App.Booking.Steps['flightStep'];
					if (flightStepLayout.getAddAir()) {
						//if add air is selected make sure that there was a selection made for sedan service
						if (flightStepLayout.sedanService.isActive() && !flightStepLayout.sedanService.sedanServiceSelectionDone()) {
							var sedanSelectionText = App.dictionary
								.get('tourRelated.Booking.FlightsProtection.SedanService.SelectionForSedanService');
							this.sections.flightsAndProtection.messages.push(sedanSelectionText);
						}

						var flightSelectionText = App.dictionary.get('tourRelated.Booking.FlightsProtection.SelectaFlight');
						//make sure that a flight was selected
						if (!App.Booking.scheduleDefault) {
							var schedule = flightStepLayout.getSchedule();
							if (schedule === null) {
								this.sections.flightsAndProtection.messages.push(flightSelectionText);
							}
						}

						if (App.Booking.hideFlightSchedule && App.Booking.scheduleDefault) {
							this.sections.flightsAndProtection.messages.push(flightSelectionText);
						}
					}


					//var allowInterAirWithoutSearch = $('#interAirWithoutSearch').val().toLowerCase();
					//if (App.siteSettings.includeInterAirPrice &&
					//	App.Booking.inTourFlightsExist &&
					//	!App.Booking.airSearchDone && allowInterAirWithoutSearch == 'false') {
					//		var interAirFlightSelectionText = App.dictionary
					//		.get('tourRelated.Booking.FlightsProtection.SelectaFlight');
					//		this.sections.flightsAndProtection.messages.push(interAirFlightSelectionText);
					//}

					if (flightStepLayout.travelProtection.$el.length > 0) {
						//make sure that there was a selection made for insurance and if there is that travelers are selected
						var $insuranceSelection = flightStepLayout.travelProtection.getCheckedInsurance();
						if ($insuranceSelection.length === 0) {
							var insuranceSelectionText = App.dictionary.get('tourRelated.Booking.SelectInsurance');
							this.sections.flightsAndProtection.messages.push(insuranceSelectionText);
						} else if ($insuranceSelection.val() === 'true') {
							var quantity = flightStepLayout.travelProtection.getInsuranceQuantity();
							if (quantity === 0) {
								var travelersSelectionText = App.dictionary.get('tourRelated.Booking.FlightsProtection.TravelerSelection');
								this.sections.flightsAndProtection.messages.push(travelersSelectionText);
							}
						}
					}

					if (this.sections.flightsAndProtection.messages.length > 0) {
						return false;
					}

					return true;
				};

				this.getLastValidStep = function() {
					var validSteps = [];
					var $stepNavListElement = $('#step_navigation');
					for (var section in this.sections) {
						if (this.sections[section].validateStep()) {
							var id = this.sections[section].id;
							var $stepListElement = $stepNavListElement.find('li a[data-sectionid="' + id + '"]');
							validSteps.push($stepListElement);
						}
					}

					//sort the steps in ascending order
					validSteps = validSteps.sort(function(a, b) {
						return parseInt(b.parent().data('step')) - parseInt(a.parent().data('step'));
					});

					var lastValidStep = validSteps[0].parent();
			
					return lastValidStep.data('step');
				};
			};

			return constructor;
		})();
		return baseStepValidation;
	});