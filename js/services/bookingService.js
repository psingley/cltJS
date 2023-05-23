define([
    'jquery',
    'underscore',
    'backbone',
    'app',
    'models/booking/BookingModel',
    'event.aggregator',
    'util/animationUtil',
    'util/dataLayerUtil'
], function ($, _, Backbone, App, BookingModel, EventAggregator, AnimationUtil ,DataLayerUtil) {
    var bookingService = {
        getBooking: function (cartId, packageDateId) {
        	//fetch the results
            var bookingModel = new BookingModel();
            //get the current item id for this page
            var currentItemId = App.siteSettings.currentItemId;
            
            var data = {packageDateId: packageDateId, cartId: cartId, currentItemId: currentItemId};
            bookingModel.fetch({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(data),
                error: function (errorResponse) {
                    console.log("Inside Failure");
                    console.log(errorResponse.responseText);
                    DataLayerUtil.ErrorMessages('getBooking', errorResponse.responseText);
                }
            })  //have to wait for the fetch to complete
                .complete(function () {
                    EventAggregator.trigger('getBookingComplete', bookingModel);
                });
        },
        getRoomType: function (adultsNum, childrenNum, packageDateId) {
            var data = {adults: adultsNum, children: childrenNum, packageDateId: packageDateId, roomsJson: JSON.stringify(App.Booking.roomsConfirmed)};
            var result = $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(data),
                url: '/Services/Booking/BookingService.asmx/GetRoom',
                error: function (errorResponse) {
                    console.log("Inside Failure");
                    console.log(errorResponse.responseText);
                    DataLayerUtil.ErrorMessages('getRoomType', errorResponse.responseText);
               
                }
            });

            return result;
        },
        getMaxNumberOfRooms: function (packageDateId) {
            var data = {packageDateId: packageDateId};
            var result = $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(data),
                url: '/Services/Booking/BookingService.asmx/GetMaxNumberOfRooms',
                error: function (errorResponse) {
                    console.log("Inside Failure");
                    console.log(errorResponse.responseText);
                    DataLayerUtil.ErrorMessages('getMaxNumberOfRooms', errorResponse.responseText);
                }
            });

            return result;
        },
        getSectionsContent: function () {
            var currentItemId = App.siteSettings.currentItemId;
            var data = {
                currentItemId: currentItemId
            };

            var result = $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(data),
                dataType: "json",
                url: '/Services/Booking/BookingService.asmx/GetSectionsContent',
                error: function (errorResponse) {
	                console.log("Inside Failure");
                    console.log(errorResponse.responseText);
                    DataLayerUtil.ErrorMessages('getSectionsContent', errorResponse.responseText);
                }
            });

            return result;
        },
        getAirports: function (value) {
        	var countryName = "";
			//
        	if ($("#searchByLocalAirports:checked").length > 0) {
        		countryName = $("#countryName").val();
	        }

	        var data = { autocompleteInput: value, countryName: countryName };

            var result = $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(data),
                url: '/Services/Booking/BookingService.asmx/GetAirports',
                error: function (errorResponse) {
	                console.log("Inside Failure");
                    console.log(errorResponse.responseText);
                    DataLayerUtil.ErrorMessages('getAirports', errorResponse.responseText);

                }
            });

            return result;
        },
        getAirlines: function (value) {
            var data = {autocompleteInput: value};
            var result = $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(data),
                url: '/Services/Booking/BookingService.asmx/GetAirlines',
                error: function (errorResponse) {
	                console.log("Inside Failure");
                    console.log(errorResponse.responseText);
                    DataLayerUtil.ErrorMessages('getAirlines', errorResponse.responseText);
                }
            });

            return result;
        },
        tourDateForm_Complete: function (selectedDateId, cartId) {          
            //get the current item id for this page
            var currentItemId = App.siteSettings.currentItemId;
            var siteName = App.siteSettings.siteName;

            var data = {packageDateId: selectedDateId, cartId: cartId, currentItemId: currentItemId};
            var result = $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(data),
                url: '/Services/Booking/BookingService.asmx/TourDateForm_Complete?site=' + siteName,
                error: function (errorResponse) {
	                console.log("Inside Failure");
                    console.log(errorResponse.responseText);
                    DataLayerUtil.ErrorMessages('tourDateForm_Complete', errorResponse.responseText);
                }
            });

            return result;
        },
        roomingAndTravelerInfoForm_Complete: function () {
	        AnimationUtil.showProgressBar();            
            var outerScope = this;
            //get the current item id for this page
	        var currentItemId = App.siteSettings.currentItemId;
            var data = {
                packageDateId: App.Booking.packageDateId,
                cartId: App.Booking.cartId,
                roomsJson: JSON.stringify(App.Booking.rooms),
                travelersJson: JSON.stringify(App.Booking.travelers),
                currentItemId: currentItemId
            };
            var result = $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(data),
                url: '/Services/Booking/BookingService.asmx/RoomingAndTravelerInfoForm_Complete',
                error: function (errorResponse) {
	                console.log("Inside Failure");
                    console.log(errorResponse.responseText);
                    DataLayerUtil.ErrorMessages('roomingAndTravelerInfoForm_Complete', errorResponse.responseText);
                }
            }).complete(function () {
            	AnimationUtil.hideProgressBar();
                EventAggregator.trigger('submitRoomingAndTravelersComplete');
            });

            return result;
        },
        tourCustomizationsForm_Complete: function () {
        	AnimationUtil.showProgressBar();
            //get the current item id for this page
            var currentItemId = App.siteSettings.currentItemId;
            var travelersCount = App.Booking.travelers.length;
            var data = {
                packageDateId: App.Booking.packageDateId,
                cartId: App.Booking.cartId,
                packageUpgradesJson: JSON.stringify(App.Booking.assignedPackageUpgrades),
                travelersCount: travelersCount,
                currentItemId: currentItemId
            };
            var result = $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(data),
                url: '/Services/Booking/BookingService.asmx/TourCustomizationsForm_Complete',
                error: function (errorResponse) {
                    console.log("Inside Failure");
                    console.log(errorResponse.responseText);
                    DataLayerUtil.ErrorMessages('tourCustomizationsForm_Complete', errorResponse.responseText);
                }
            }).complete(function () {
            	AnimationUtil.hideProgressBar();
            });

            return result;
        },

        flightsForm_AirSearch: function (searchParameters) {
            AnimationUtil.startAirSearchAnimation();

            var data = {
                parameters: JSON.stringify(searchParameters),
                packageDateId: App.Booking.packageDateId,
                cartId: App.Booking.cartId
            };
            console.log('Parameters in Json format' + data.parameters);
            var result = $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(data),
                url: '/Services/Booking/BookingService.asmx/FlightsForm_AirSearch',
                error: function (errorResponse) {
	                console.log("Inside Failure");
                    console.log(errorResponse.responseText);
                    DataLayerUtil.ErrorMessages('flightsForm_AirSearch', errorResponse.responseText);

                }
            }).complete(function () {
            	AnimationUtil.endAirSearchAnimation();
            });

            return result;
        },
        flightsForm_GetInTourFlights: function () {
        	AnimationUtil.showProgressBar();

            var data = { packageDateId: App.Booking.packageDateId, cartId: App.Booking.cartId };
            var result = $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(data),
                url: '/Services/Booking/BookingService.asmx/FlightsForm_GetInTourFlights',
                error: function (errorResponse) {
                    console.log("Inside Failure");
                    console.log(errorResponse.responseText);
                    DataLayerUtil.ErrorMessages('flightsForm_GetInTourFlights', errorResponse.responseText);
                }
            }).complete(function () {
               AnimationUtil.hideProgressBar();  
            });

            return result;
        },
        summaryAndPayment_RemoveCartDetail: function (cartDetailId) {
        	AnimationUtil.showProgressBar();
            var currentItemId = App.siteSettings.currentItemId;
            var data = {
                packageDateId: App.Booking.packageDateId,
                cartId: App.Booking.cartId,
                cartDetailId: cartDetailId,
                currentItemId: currentItemId
            };

            var result = $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(data),
                url: '/Services/Booking/BookingService.asmx/SummaryAndPayment_RemoveCartDetail',
                error: function (errorResponse) {
                    console.log("Inside Failure");
                    console.log(errorResponse.responseText);
                    DataLayerUtil.ErrorMessages('summaryAndPayment_RemoveCartDetail', errorResponse.responseText);
                }
            }).complete(function () {
            	AnimationUtil.hideProgressBar();
            });

            return result;
        },
        travelerInformationForm_Complete: function () {
        	AnimationUtil.showProgressBar();
            var currentItemId = App.siteSettings.currentItemId;
            var data = {
                travelersJson: JSON.stringify(App.Booking.travelers),
                packageDateId: App.Booking.packageDateId,
                cartId: App.Booking.cartId,
                currentItemId: currentItemId
            };

            var result = $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(data),
                url: '/Services/Booking/BookingService.asmx/TravelerInformationForm_Complete',
                error: function (errorResponse) {
                    console.log("Inside Failure");
                    console.log(errorResponse.responseText);
                    DataLayerUtil.ErrorMessages('travelerInformationForm_Complete', errorResponse.responseText);
                }
            }).complete(function () {
                AnimationUtil.hideProgressBar();
            });

            return result;
        },
        flightsForm_GetAirSearchDefaults: function () {
        	AnimationUtil.showProgressBar();
            var data = {packageDateId: App.Booking.packageDateId, cartId: App.Booking.cartId};
            var result = $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(data),
                url: '/Services/Booking/BookingService.asmx/FlightsForm_GetAirSearchDefaults',
                error: function (errorResponse) {
                    console.log("Inside Failure");
                    console.log(errorResponse.responseText);
                    DataLayerUtil.ErrorMessages('flightsForm_GetAirSearchDefaults', errorResponse.responseText);
                }
            }).complete(function () {
                AnimationUtil.hideProgressBar();
            });

            return result;
        },
        flightsForm_Complete: function (addAir, schedule, interAirOnly, insuranceAndTravelersPackageUpgrades, adultCount, sedanServiceSelection, sedanServiceAvailable, sedanServicePrice, internalAir) {
        	AnimationUtil.showProgressBar();

            var currentItemId = App.siteSettings.currentItemId;

            var flightLayout = App.Booking.Steps['flightStep'].flights;

            var $cabinChoice = flightLayout.$el.find('.cabinTypeOptions > option:selected');
            var cabinId = $cabinChoice.data('id');

            var defaultAirPlaceholder = {
                cabinTypeId: cabinId,
                airportId: App.Booking.Steps['flightStep'].getAirportId(),
                departureDate: flightLayout.getDepartDate(),
                returnDate: flightLayout.getReturnDate()
            };

            var travelersCount = App.Booking.travelers.length;
	     
            var data = {
                addAir: addAir,
                scheduleJson: JSON.stringify(schedule),
                adultsCount: adultCount,
                childrenCount: 0,
                interAirOnly: true,
                packageDateId: App.Booking.packageDateId,
                cartId: App.Booking.cartId,
                insuranceAndTransfersPackageUpgrades: JSON.stringify(insuranceAndTravelersPackageUpgrades),
                travelersCount: travelersCount,
                currentItemId: currentItemId,
                defaultPlaceholderJson: JSON.stringify(defaultAirPlaceholder),
                acceptSedanService: sedanServiceSelection,
                sedanServiceAvailable: sedanServiceAvailable,
                sedanServicePrice: sedanServicePrice,
                internalAir:internalAir
            };
            var self = this;
            var result = $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(data),
                url: '/Services/Booking/BookingService.asmx/FlightsForm_Complete',
                error: function (errorResponse) {
                    console.log("Inside Failure");
                    console.log(errorResponse.responseText);
                    DataLayerUtil.ErrorMessages('flightsForm_Complete', errorResponse.responseText);
                }
            }).complete(function () {
                AnimationUtil.hideProgressBar();
            });

            return result;
        },
        flightsForm_CalculateDTD: function(airportId, zipCode) {
        	AnimationUtil.showProgressBar();

            var currentItemId = App.siteSettings.currentItemId;

            var data = {
                airportId: airportId,
                zipCode: zipCode,
                packageDateId: App.Booking.packageDateId,
                cartId: App.Booking.cartId
            };
            var self = this;
            var result = $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(data),
                url: '/Services/Booking/BookingService.asmx/FlightsForm_CalculateDTD',
                error: function (errorResponse) {
                    console.log("Inside Failure");
                    console.log(errorResponse.responseText);
                    DataLayerUtil.ErrorMessages('flightsForm_CalculateDTD', errorResponse.responseText);
                }
            }).complete(function () {
                AnimationUtil.hideProgressBar();
                });

            return result;
        },
        summaryAndPayment_ApplyPromoCodeDiscount: function(offerCode,
            memberBenefitCode,
            aarpMembershipId,
            aarpMemberLastName) {
            var currentItemId = App.siteSettings.currentItemId;
            AnimationUtil.showProgressBar();
        	var data = {
        		packageDateId: App.Booking.packageDateId,
        		cartId: App.Booking.cartId,
        		currentItemId: currentItemId,
        		offerCode: offerCode,
        		memberBenefitCode: memberBenefitCode,
        		aarpMembershipId:aarpMembershipId,
        		aarpMemberLastName: aarpMemberLastName
        	};
        	var result = $.ajax({
        		type: "POST",
        		contentType: "application/json; charset=utf-8",
        		dataType: "json",
        		data: JSON.stringify(data),
        		url: '/Services/Booking/BookingService.asmx/SummaryAndPayment_ApplyPromoCodeDiscount',
        		error: function (errorResponse) {
        			console.log("Inside Failure");
                    console.log(errorResponse.responseText);
                    DataLayerUtil.ErrorMessages('summaryAndPayment_ApplyPromoCodeDiscount', errorResponse.responseText);
        		}
        	}).complete(function () {
                AnimationUtil.hideProgressBar();
        	});

        	return result;
        },
        summaryAndPayment_ApplyDiscount: function (offerCode) {
            var currentItemId = App.siteSettings.currentItemId;
            AnimationUtil.showProgressBar();
            var data = {
                packageDateId: App.Booking.packageDateId,
                cartId: App.Booking.cartId,
                offerCode: offerCode,
                currentItemId: currentItemId
            };
            var result = $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(data),
                url: '/Services/Booking/BookingService.asmx/SummaryAndPayment_ApplyDiscount',
                error: function (errorResponse) {
                    console.log("Inside Failure");
                    console.log(errorResponse.responseText);
                    DataLayerUtil.ErrorMessages('summaryAndPayment_ApplyDiscount', errorResponse.responseText);
                }
            }).complete(function () {
                AnimationUtil.hideProgressBar();
            });

            return result;
        },
        roomingAndTravelers_ApplyOffer: function (neoId) {
            var currentItemId = App.siteSettings.currentItemId;
            AnimationUtil.hideProgressBar();
            var data = {
                packageDateId: App.Booking.packageDateId,
                cartId: App.Booking.cartId,
                offerNeoId: neoId,
                currentItemId: currentItemId
            };

            var result = $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(data),
                url: '/Services/Booking/BookingService.asmx/RoomingAndTravelers_ApplyOffer',
                error: function (errorResponse) {
                    console.log("Inside Failure");
                    console.log(errorResponse.responseText);
                    DataLayerUtil.ErrorMessages('roomingAndTravelers_ApplyOffer', errorResponse.responseText);
                }
            }).complete(function () {
                AnimationUtil.hideProgressBar();
            });

            return result;
        }
    };

    return bookingService;
});