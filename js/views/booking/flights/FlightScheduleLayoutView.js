define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'event.aggregator',
    'app',
    'moment',
    'util/dateUtil',
    'util/objectUtil',
    'util/stringUtil',
    'text!templates/booking/flights/flightScheduleLayoutTemplate.html',
    'models/booking/flights/ScheduleModel',
    'collections/booking/flights/FlightCollection'
], function ($, _, Backbone, Marionette, EventAggregator, App, Moment, DateUtil, ObjectUtil, StringUtil, flightScheduleLayoutTemplate, ScheduleModel, FlightCollection) {
    var FlightScheduleLayout = Backbone.Marionette.Layout.extend({
    	template: Backbone.Marionette.TemplateCache.get(flightScheduleLayoutTemplate),
        className:'flight',
        model: ScheduleModel,
        regions: {
            flightDetailRegion: '#flightDetailRegion',
            outboundFlightOperatingCarriersRegion: '.depart_row2 .operatingCarriers',
            returnFlightOperatingCarriersRegion: '.arrive_row2 .operatingCarriers'
        },
        events: {
            'click .flight_details': 'showFlightDetails',
            'click  input[name=flight]': 'selectFlight',
        	'click .button-flightContinue': 'continueClick',
            'click': 'animateClick'
        },
        templateHelpers: function () {
            var ppText = '';
	        var flightPrice = this.model.get('price');
			
			//flight price + tax + room price (per passenger)
	        var totalPriceFormatted;
			
		    //room price per passenger
	        var roomPrice;

	        if (ObjectUtil.isNullOrEmpty(flightPrice)) {
	        	totalPriceFormatted = '';
            } else {
            	var tax = this.model.get('tax');
            	var priceAndTax = (flightPrice + tax);
            	//get rooming price and divide it by total passengers and add to price
	            roomPrice = App.Booking.Steps['roomsStep'].stepLandOnlyPrice;
	            var totalPassengers = App.Booking.travelers.length;
	            if (roomPrice > 0 && totalPassengers > 0) {
	            	roomPrice = roomPrice / totalPassengers;
	            	totalPriceFormatted = roomPrice + priceAndTax;
	            }
	            
	            if (totalPriceFormatted.toString().indexOf(".") > 0) {
	            	totalPriceFormatted = totalPriceFormatted.toFixed(2);
	            }
	            totalPriceFormatted = totalPriceFormatted.toLocaleString().formatPrice();
                ppText = App.dictionary.get('tourRelated.FreeFormText.PP');
            }

            var fareType = this.model.get('fareType');
            var fareTypeName = "";
            var fareTypeDescription = "";
            if (!ObjectUtil.isNullOrEmpty(fareType)) {
                fareTypeName = App.dictionary.get('tourRelated.Booking.RoomingTravelerInfo.LandPlus') + " " + fareType.name;
                fareTypeDescription = fareType.meaning;
            }
            
            if ($('#hideAirFareFilters').val().toLowerCase() == 'true') {
            	fareTypeName = '';
	            fareTypeDescription = "";
            }

            var departureDurationInMinutes = this.model.get('departureDurationInMinutes');
            var arrivalDurationInMinutes =  this.model.get('arrivalDurationInMinutes');

            var durationText = '';
            if(departureDurationInMinutes > 0 && arrivalDurationInMinutes > 0 ){
                durationText = App.dictionary.get('tourRelated.Booking.Duration');
            }

            var outerScope = this;
            return{
                flightGroups: this.model.get('flightGroups'),
                durationText: durationText,
                leaveText: App.dictionary.get('tourRelated.Booking.FlightsProtection.Leave'),
                arriveText:App.dictionary.get('tourRelated.Booking.FlightsProtection.Arrive'),
                continueText: App.dictionary.get('tourRelated.Booking.FlightsProtection.Continue'),
                flightDetailsText: App.dictionary.get('tourRelated.Booking.FlightsProtection.FlightDetails'),
                totalPriceFormatted: totalPriceFormatted, // flight price + tax + room price (per passenger)
                flightPrice: priceAndTax,
                rmPrice: roomPrice,
                ppText: ppText,
                fareTypeName: fareTypeName,
                fareTypeDescription: fareTypeDescription,
                scheduleCid: this.model.cid,
                baggageInformationText: App.dictionary.get('tourRelated.Booking.FlightsProtection.BaggageInformation'),
                getSummaryAirlineDisplayName: function(flight) {
                    var airlineName = flight.get('airline').name;
                    var operatedByAirline = flight.get('operatedByAirline');
                    var operatedBy = '';
                    if (!ObjectUtil.isNullOrEmpty(operatedByAirline.name)) {
                        operatedBy = App.dictionary.get('tourRelated.Booking.FlightsProtection.OperatedBy') + " " + operatedByAirline.name;
                    }

                    if (!ObjectUtil.isNullOrEmpty(operatedBy)) {
                        airlineName += " " + operatedBy;
                    }

                    return airlineName;
                },
                getOperatedByFlightDetailText: function(flight) {
                    var operatedByAirline = flight.get('operatedByAirline');
                    if (!ObjectUtil.isNullOrEmpty(operatedByAirline) && !ObjectUtil.isNullOrEmpty(operatedByAirline.name)) {
                        return App.dictionary.get('tourRelated.Booking.FlightsProtection.OperatedBy') + " " +
                            StringUtil.toTitleCase(operatedByAirline.name);
                    }

                    return '';
                },
                getAirline: function(flight) {
                    var airline = flight.get('airline');
                    if (!ObjectUtil.isNullOrEmpty(airline) &&
                        !ObjectUtil.isNullOrEmpty(airline.name) &&
                        !ObjectUtil.isNullOrEmpty(airline.url)) {

                        return airline;
                    }
                    return null;
                },
                getAirlineDisplayName: function(flight) {
                    var airlineName = flight.get('airline').name;
                    return ObjectUtil.isNullOrEmpty(airlineName) ? '' : airlineName;
                },
                getClassOfService: function(flight) {
                    var classOfService = flight.get('classOfService');
                    return ObjectUtil.isNullOrEmpty(classOfService) ? '' : classOfService;
                },
                getEquipment: function(flight) {
                    var equipment = flight.get('equipment');
                    if (!ObjectUtil.isNullOrEmpty(equipment)) {
                        return equipment;
                    }

                    return '';
                },
                getOperatedByAirline: function(flight) {
                    var operatedByAirline = flight.get('operatedByAirline');

                    if (!ObjectUtil.isNullOrEmpty(operatedByAirline) &&
                        !ObjectUtil.isNullOrEmpty(operatedByAirline.name) &&
                        !ObjectUtil.isNullOrEmpty(operatedByAirline.url)) {
                        return operatedByAirline;
                    }

                    return null;
                },
                getFlightNumberText: function(flight) {
                    var flightText = App.dictionary.get('tourRelated.Booking.FlightsProtection.Flight');
                    var flightNumber = flight.get('flightNumber');
                    if (!ObjectUtil.isNullOrEmpty(flightNumber) && flightNumber > 0) {
                        return  flightText + " # " + flightNumber;
                    }

                    return '';
                },
                getDepartureDateFormatted: function(flight){
                    var departureDate = new  Moment(flight.get('departureDateTime'));
                    var departureDateFormatted= departureDate.format('MMM DD, YYYY');
                    return departureDateFormatted;
                },
                getDepartureTimeFormatted: function(flight){
                    var departureDate = new  Moment(flight.get('departureDateTime'));
                    return departureDate.format('hh:mm') + " " +  DateUtil.getAMOrPM(departureDate);
                },
                getArrivalDateFormatted: function(flight){
                    var arrivalDate = new  Moment(flight.get('arrivalDateTime'));
                    return arrivalDate.format('MMM DD, YYYY');
                },
                getArrivalTimeFormatted: function(flight){
                    var arrivalDate = new  Moment(flight.get('arrivalDateTime'));
                    return arrivalDate.format('hh:mm') + " " + DateUtil.getAMOrPM(arrivalDate);
                },
                getBaggageInformationText: function(flight){
                    return ObjectUtil.isNullOrEmpty(flight.get('airline')) ? ''
                        : App.dictionary.get('tourRelated.Booking.FlightsProtection.BaggageInformation');
                },
                getDurationTimeFormatted: function(flightGroup) {
                    switch(flightGroup.serviceOrderId) {
                        case App.taxonomy.getTaxonomyItem('serviceOrders', 'Pre').neoId:
                            return outerScope.getFlightDurationFormatted(departureDurationInMinutes);
                        case App.taxonomy.getTaxonomyItem('serviceOrders', 'Post').neoId:
                            return outerScope.getFlightDurationFormatted(arrivalDurationInMinutes);
                        default :
                            return '';
                    }
                },
                getTotalStops: function(flightGroup) {
                    switch(flightGroup.serviceOrderId) {
                        case App.taxonomy.getTaxonomyItem('serviceOrders', 'Pre').neoId:
                            return outerScope.getFlightStopsFormatted(outerScope.model.get('departureStops'));
                        case App.taxonomy.getTaxonomyItem('serviceOrders', 'Post').neoId:
                            return outerScope.getFlightStopsFormatted(outerScope.model.get('arrivalStops'));
                        default :
                            return '';
                    }
                }
            }
        },
        continueClick: function (e) {
        	var section = $('#FlightsandProtection div.section.flights_to_from:visible');
        	if (section.length > 0) {
        		$('html, body').animate({ scrollTop: section.height() }, 2000);
			}
        },
        animateClick: function (e) {
        	var activeFlight, flightInput;
    			var flight = $(this.el);
    			activeFlight = $(".flight.active");
    			flightInput = flight.find("input[name='flight']");
    			if (e.target.nodeName !== "BUTTON" && e.target.nodeName !== "A") {
    				flightInput.prop("checked", true);
    				if (!flight.hasClass("active")) {
    					activeFlight.removeClass("active");
    					flight.addClass("active");

    					$(".flightContinueSection").hide();
    					flight.find(".flightContinueSection").show();
    				}
    			}
    		},

        showFlightDetails: function (e) {
            e.preventDefault();
            var target = $(e.target);

            target.parents(".option").next('.option_details').toggleClass("open").slideToggle();
            target.toggleClass("close");
        },
        selectFlight: function (e) {
            var target = $(e.target);
            $(".option").removeClass("active");
            $(".flightContinueSection").hide();

            target.parents(".option").addClass("active");
            target.parents(".option").find(".flightContinueSection").show();
        },

        getFlightDurationFormatted: function (durationInMinutes) {
            if (durationInMinutes < 1) {
                return '';
            }
            var hours = Math.floor((durationInMinutes / 60));
            var minutes = durationInMinutes % 60;
            var durationFormatted = (hours > 0 ? hours + "h" : "") + " " + (minutes > 0 ? minutes + "m" : "");
            return durationFormatted;
        },
        getFlightStopsFormatted: function (stops) {
            var stopsText = '';

            if (stops == 1) {
                stopsText = stops + " " + App.dictionary.get('tourRelated.Booking.FlightsProtection.Stop').toLowerCase();
            } else if (stops > 1) {
                stopsText = stops + " " + App.dictionary.get('tourRelated.Booking.FlightsProtection.Stops').toLowerCase();
            }else if (stops === 0) {
               stopsText = App.dictionary.get('tourRelated.Booking.FlightsProtection.NonStop');
            }
            return stopsText;
        }
    });

    return FlightScheduleLayout;
});