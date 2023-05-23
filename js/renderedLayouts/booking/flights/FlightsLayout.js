define([
    'jquery',
    'underscore',
    'backbone',
    'app',
    'event.aggregator',
    'moment',
    'util/objectUtil',
    'util/dateUtil',
    'util/prettySelectUtil',
    'services/bookingService',
    'util/taxonomy/taxonomyDomUtil',
    'views/booking/travelerInformation/TravelerSmallListView',
    'collections/booking/flights/InTourFlightCollection',
    'views/booking/flights/InTourFlightsListView',
    'views/booking/flights/AirfairOptionsLayoutView',
    'collections/booking/flights/ScheduleCollection',
    'views/validation/ErrorView',
    'views/validation/InfoView',
    'util/booking/bookingUtil',
    'util/dataLayerUtil',
    'util/paymentFormUtil'
], function ($, _, Backbone, App, EventAggregator, Moment, ObjectUtil, DateUtil, PrettySelectUtil, BookingService, TaxonomyDomUtil, TravelerSmallListView, InTourFlightCollection, InTourFlightsListView, AirfairOptionsLayoutView, ScheduleCollection, ErrorView, InfoView, BookingUtil, DataLayerUtil, PaymentFormUtil) {
    var FlightsLayout = Backbone.Marionette.Layout.extend({
        canShopContractedAir: null,
        canShopInstantPurchasedAir: null,
        el: '#tourFlightsRegion',
        events: {
            'click #searchForAirButton': 'searchAir',
            'click #showAllAirfareOptions': 'searchAir',
            'click .search_for_air': 'toggleAirParams',
            'click input[name=inTour]': 'toggleInTourFlights',
            'keyup #departure_city': 'toggleAirport',
            'keydown #departure_city': 'toggleAirport',
            'blur #departure_city': 'toggleAirport',
            'change .hasDatepicker': 'toggleDatePicker',
            'blur .hasDatepicker': 'toggleDatePicker'
        },
        regions: {
            'inTourFlightRegion1': '#inTourFlightsRegion .left_col',
            'inTourFlightRegion2': '#inTourFlightsRegion .right_col',
            'airfareOptionsRegion': '#airfareOptionsRegion',
            'searchAirMessagesRegion': '.searchAirMessagesRegion',
            'airDisclaimerRegion': '#air-disclaimer-region'
        },
        ui: {
            '$travelerCount': '#flightTravelerCount',
        },
        initialize: function () {
            var outerScope = this;
            var dateFormat = App.siteSettings.dateFormat;
            var datePickerDateFormat = App.siteSettings.datePickerDateFormat;
            var searchForRoundTripEnabled = $('#roundTripSearchOption').length === 1;

            $.datepicker.setDefaults(
                $.extend(
                    { 'dateFormat': datePickerDateFormat }
                )
            );

            if (!Modernizr.input.placeholder) {
                $('.flights_to_from [placeholder]').focus(function () {
                    var input = $(this);
                    if (input.val() == input.attr('placeholder')) {
                        input.val('');
                        input.removeClass('ieplaceholder');
                    }
                }).blur(function () {
                    var input = $(this);
                    if (input.val() == '' || input.val() == input.attr('placeholder')) {
                        input.addClass('ieplaceholder');
                        input.val(input.attr('placeholder'));
                    }
                }).blur();
            }

            EventAggregator.on('flights.showAirMessages', function (view) {
                outerScope.searchAirMessagesRegion.show(view);
                outerScope.searchAirMessagesRegion.$el.show();
            });

            EventAggregator.on('getBookingComplete submitRoomingAndTravelersComplete', function () {
                if (App.Booking.travelers !== null) {
                    $(outerScope.ui.$travelerCount).val(App.Booking.travelers.length);
                }
            });

            EventAggregator.on('getInTourFlightsComplete', function (inTourFlights) {
                var $inTourFlights = $('.during_the_tour_flights');
                var inTourFlights = new InTourFlightCollection(inTourFlights);
                App.Booking.inTourFlightsExist = inTourFlights.length > 0;
                if (App.Booking.inTourFlightsExist) {
                    $inTourFlights.show();
                    var colNumberToShow = Math.round(inTourFlights.length / 2);
                    var leftColInTourFlights = new InTourFlightCollection(inTourFlights.first(colNumberToShow));
                    var rightColInTourFlights = new InTourFlightCollection(inTourFlights.rest(colNumberToShow));
                    if (leftColInTourFlights.length > 0) {
                        outerScope.inTourFlightRegion1.show(new InTourFlightsListView({ collection: leftColInTourFlights }));
                    }
                    if (rightColInTourFlights.length > 0) {
                        outerScope.inTourFlightRegion2.show(new InTourFlightsListView({ collection: rightColInTourFlights }));
                    }
                } else {
                    $inTourFlights.hide();

                    //set the inter air only to false
                    var $interAirOnly = outerScope.$el.find('input[name=inTour][value=false]');
                    $interAirOnly.prop('checked', true);
                }
            });

            EventAggregator.on('getFlightDefaultsComplete', function (flightDefaults) {
                outerScope.canShopContractedAir = flightDefaults.canShopContractedAir;
                outerScope.canShopInstantPurchasedAir = flightDefaults.canShopInstantPurchasedAir;

                if (!flightDefaults.canShopContractedAir && !flightDefaults.canShopInstantPurchasedAir) {
                    outerScope.disableSearch();
                }

                var arrivalDate;
                if (!ObjectUtil.isNullOrEmpty(flightDefaults.arrivalDateAndTime)) {
                    arrivalDate = new Moment(flightDefaults.arrivalDateAndTime);
                }

                var departureDate;
                if (!ObjectUtil.isNullOrEmpty(flightDefaults.departureDateAndTime)) {
                    departureDate = new Moment(flightDefaults.departureDateAndTime);
                }

                var departureAirport = flightDefaults.departureAirport;
                var passengerCount = flightDefaults.passengerCount;

                var $departureCity = outerScope.$el.find('#departure_city');
                var $departureDate = outerScope.$el.find('.depart');
                var $arrivalDate = outerScope.$el.find('.return');


                if ($departureCity.length > 0 && !ObjectUtil.isNullOrEmpty(departureAirport)) {
                    $departureCity.val(departureAirport.name);
                    var $departCityId = outerScope.$el.find('#airportId');
                    $departCityId.val(departureAirport.id);
                }

                if ($departureDate.length > 0 && !ObjectUtil.isNullOrEmpty(departureDate)) {
                    var formattedDepartDate = departureDate.format(dateFormat);
                    if (App.Booking.hideFlightSchedule) {
                        $departureDate.datepicker('destroy');
                    }
                    $departureDate.datepicker();
                    $departureDate.datepicker('setDate', formattedDepartDate);
                    $departureDate.datepicker('option', 'maxDate', formattedDepartDate);


                    var departureDate = new Moment(departureDate);
                    var hour = departureDate.format('h');
                    var AMPM = DateUtil.getAMOrPM(departureDate);

                    var $hour = outerScope.$el.find('.departHour');
                    var $AMPM = outerScope.$el.find('.departAMPM');

                    PrettySelectUtil.setValue(hour, $hour);
                    PrettySelectUtil.setValue(AMPM, $AMPM);
                }

                if ($arrivalDate.length > 0 && !ObjectUtil.isNullOrEmpty(arrivalDate)) {
                    var formattedArriveDate = arrivalDate.format(dateFormat);
                    if (App.Booking.hideFlightSchedule) {
                        $arrivalDate.datepicker('destroy');
                    }
                    $arrivalDate.datepicker();
                    $arrivalDate.datepicker('setDate', formattedArriveDate);
                    $arrivalDate.datepicker('option', 'minDate', formattedArriveDate);

                    var arrivalDate = new Moment(arrivalDate);
                    var hour = arrivalDate.format('h');
                    var AMPM = DateUtil.getAMOrPM(arrivalDate);

                    var $hour = outerScope.$el.find('.returnHour');
                    var $AMPM = outerScope.$el.find('.returnAMPM');

                    PrettySelectUtil.setValue(hour, $hour);
                    PrettySelectUtil.setValue(AMPM, $AMPM);
                }
            });

            EventAggregator.on('submitTourDateComplete', function ($selectedDate) {

                var startDate =
                    new Moment($selectedDate.attr('startdate'))
                        .subtract(1, 'months')
                        .format(dateFormat);
                var endDate =
                    new Moment(new Date($selectedDate.attr('enddate')))
                        .format(dateFormat);

                var $departDatePicker = outerScope.$el.find('.depart');
                var $returnDatePicker = outerScope.$el.find('.return');

                $departDatePicker.datepicker(
                    {
                        defaultDate: startDate,
                        numberOfMonths: 2
                    });

                $returnDatePicker.datepicker({
                    defaultDate: endDate,
                    numberOfMonths: 2
                });

                //clear search results
                outerScope.airfareOptionsRegion.close();
            });

            //set up the airport autocomplete
            var $airportsSelector = outerScope.$el.find('#departure_city');
            var $airportsIdSelector = outerScope.$el.find('#airportId');
            TaxonomyDomUtil.setAutocompleteAjax(BookingService.getAirports, $airportsSelector, $airportsIdSelector, 2, true);

            //set up the airlines autocomplete
            var $airlinesSelector = outerScope.$el.find('#airlines');
            var $airlineIdSelector = outerScope.$el.find('#airlineId');
            TaxonomyDomUtil.setAutocompleteAjax(BookingService.getAirlines, $airlinesSelector, $airlineIdSelector, 2, false);

            if (!searchForRoundTripEnabled) {
                this.hideSearchParams((App.Booking.inTourFlightsExist != undefined && !App.Booking.inTourFlightsExist));
            }
        },

        toggleAirParams: function (e) {
            var $target = e.target == undefined ? e : $(e.target);
            if ($target.val() === 'true') {
                //if (App.Booking.inTourFlightsExist && this.$el.find("input[name=inTour][value=false]").prop("checked")) {
                //	var $inTourAir = this.$el.find("input[name=inTour][value=true]");
                //	$inTourAir.prop("checked", true);
                //	this.showSearchParams(true);
                //	BookingUtil.adjustBookingOverviewOffsetInfo(true);
                //}
                //else {
                this.showSearchParams(true);
                BookingUtil.adjustBookingOverviewOffsetInfo(true);
                //}
            } else {
                this.hideSearchParams(true);
                BookingUtil.adjustBookingOverviewOffsetInfo(false);
            }

            if ((App.Booking.requestAirCallback == undefined && $target.val() === 'callback')
                || (App.Booking.requestAirCallback != undefined && App.Booking.requestAirCallback != ($target.val() === 'callback'))) {
                App.Booking.requestAirCallback = $target.val() === 'callback';
                EventAggregator.trigger('requestAirCallbackChanged', App.Booking.requestAirCallback);
            }
            EventAggregator.trigger('searchForAirChanged');
        },

        disableSearch: function () {
            this.hideSearchParams(true);
            $('#airSearch').remove();
            $('.searchForAirSection').show();
            this.$el.find(".search_for_air[value=false]").prop("checked", true);
        },

        toggleInTourFlights: function (e) {
            var $target = e.target == undefined ? e : $(e.target);
            if ($target.val() === 'true') {
                var $ownAir = this.$el.find(".search_for_air[value=true]");
                $ownAir.prop("checked", true);
                this.toggleAirParams($ownAir);
                $('.searchForAirSection').show();
            } else {
                if (this.$el.find(".search_for_air[value=true]").prop("checked")) {
                    var $ownAir = this.$el.find(".search_for_air[value=false]");
                    $ownAir.prop("checked", true);
                    this.toggleAirParams($ownAir);
                }
                $('.searchForAirSection').hide();
            }

            EventAggregator.trigger('searchForAirChanged');
        },

        hideSearchParams: function (disable) {
            var $toggleSection = this.$el.find(".toggle_section");
            $toggleSection.slideUp();
            this.airfareOptionsRegion.close();
            if (disable) {
                $('.searchForAirSection').hide();
            }

            var disclaimer = App.Booking.sections.flightsAndProtection.ownAirDisclaimer;
            this.airDisclaimerRegion.show(new InfoView([disclaimer]));
            this.airDisclaimerRegion.$el.show();

            this.searchAirMessagesRegion.close();
        },

        showSearchParams: function (enable) {
            var $toggleSection = this.$el.find(".toggle_section");
            $toggleSection.slideDown();
            this.airfareOptionsRegion.close();
            if (enable) {
                $('.searchForAirSection').show();
            }
            this.airDisclaimerRegion.close();
        },

        validateAirData: function (messages) {
            if (App.Booking.inTourFlightsExist) {
                var inAirFalse = $('input[name=inTour][value=false]');
                var inAirTrue = $('input[name=inTour][value=true]');

                if (inAirFalse.length > 0 && inAirFalse.prop("checked")) {
                    messages.push(App.dictionary.get('tourRelated.Booking.FlightsProtection.InterAirRequired'));
                } else if (inAirTrue.length > 0 && !inAirTrue.prop("checked")) {
                    messages.push(App.dictionary.get('tourRelated.Booking.FlightsProtection.InterAirRequired'));
                }
            }

            //we need to get the dates and airport only if we provide air
            if ($('input[name=air]:checked').val() === 'true') {

                var departDate = this.getDepartDate();
                if (ObjectUtil.isNullOrEmpty(departDate)) {
                    messages.push('You need to choose a depart date');
                    PaymentFormUtil.ToggleVisual("#b2b8bd", "red", "depart", "border-color", 'You need to choose a depart date');
                }

                var returnDate = this.getReturnDate();
                if (ObjectUtil.isNullOrEmpty(returnDate)) {
                    messages.push(App.dictionary.get('tourRelated.Booking.FlightsProtection.ChooseReturnDate'));
                    PaymentFormUtil.ToggleVisual("#b2b8bd", "red", "return", "border-color", App.dictionary.get('tourRelated.Booking.FlightsProtection.ChooseReturnDate'));
                }

                if (returnDate !== null && departDate !== null) {
                    if (returnDate.diff(departDate, 'hours') > 24) {
                        departDate = departDate.format('M/D/YYYY HH:mm:ss');
                        returnDate = returnDate.format('M/D/YYYY HH:mm:ss');
                    } else {
                        let m = App.dictionary.get('tourRelated.Booking.FlightsProtection.ChooseALaterReturnDate');
                        messages.push(m);
                        PaymentFormUtil.ToggleVisual("#b2b8bd", "red", "return", "border-color", m);
                    }
                }

                if (!App.Booking.Steps['flightStep'].getInterAirOnly()) {
                    var airportId = App.Booking.Steps['flightStep'].getAirportId();
                    if (ObjectUtil.isNullOrEmpty(airportId)) {
                        messages.push(App.dictionary.get('tourRelated.Booking.FlightsProtection.ChooseAnAirport'));
                        PaymentFormUtil.ToggleVisual("#b2b8bd", "red", "departure_city", "border-color", App.dictionary.get('tourRelated.Booking.FlightsProtection.ChooseAnAirport'));
                    }
                }

                var $cabinChoice = this.$el.find('.cabinTypeOptions > option:selected');
                var cabinName = $cabinChoice.text();
                var cabinChoice = App.taxonomy.getTaxonomyItem('cabinTypes', cabinName);
                if (ObjectUtil.isNullOrEmpty(cabinChoice)) {
                    console.log('cabin choice is null');
                }
            }

            return messages;
        },

        searchAir: function (e) {
            //indicates if we should do a max or min search
            var maxSearch = false;
            if (e.currentTarget != null && e.currentTarget.id == 'showAllAirfareOptions') {
                maxSearch = true;
                console.log('performing a max search');
            }
            e.preventDefault();
            var outerScope = this;
            var messages = [];

            messages = this.validateAirData(messages);
         
            var $airline = this.$el.find('#airlineId');
            var airlineId = $airline.val();
            var $cabinChoice = this.$el.find('.cabinTypeOptions > option:selected');
            var cabinName = $cabinChoice.text();
            var cabinChoice = App.taxonomy.getTaxonomyItem('cabinTypes', cabinName);
            var nonStopFlag = (this.$el.find('#nonstop_checkbox:checked').length === 1 ? 'Y' : 'N');

            if (messages.length > 0) {
                this.searchAirMessagesRegion.show(new ErrorView(messages));
                this.searchAirMessagesRegion.$el.show();
                document.querySelector('.searchAirMessagesRegion.pad div.errorMessages').style.display = 'none';
             
            } else {
                var searchParameters =
                {
                    passengerCount: this.getPassengerCount(),
                    interAirOnly: App.Booking.Steps['flightStep'].getInterAirOnly(),
                    departureAirportId: App.Booking.Steps['flightStep'].getAirportId(),
                    airlineId: airlineId,
                    cabin: cabinChoice,
                    arrivalDateAndTime: this.getReturnDate(),
                    departureDateAndTime: this.getDepartDate(),
                    maxSearch: maxSearch,
                    nonStopField: nonStopFlag
                };

                localStorage.airsearch = true;
                DataLayerUtil.SearchForFlights(cabinName);
                console.log('Arrival Date and Time: ' + searchParameters.arrivalDateAndTime.toLocaleString());
                console.log('Departure Date and Time: ' + searchParameters.departureDateAndTime.toLocaleString());
                BookingService.flightsForm_AirSearch(searchParameters)
                    .done(function (response) {
                        App.Booking.airSearchDone = true;
                        var airSearchResponse = JSON.parse(response.d);
                        var schedulesObject = airSearchResponse.schedules;
                        App.Booking.transferPrice = 0;

                        $('#airfareOptionsRegion').show();
                        App.Booking.hideFlightSchedule = false;

                        //we need to pass this back to the flights form complete method
                        App.Booking.showSedanService = airSearchResponse.shopSedanService;

                        EventAggregator.trigger('showSedanService', App.Booking.showSedanService);
                        //var roomsStep = App.Booking.Steps['roomsStep'];
                        //roomsStep.stepPrice = roomsStep.stepLandOnlyPrice;

                        if (!ObjectUtil.isNullOrEmpty(schedulesObject) && schedulesObject.length > 0) {
                            outerScope.searchAirMessagesRegion.close();
                            outerScope.airfareOptionsRegion.close();

                            var airfairOptionsLayout = new AirfairOptionsLayoutView({ FlightSchedulesPerPage: airSearchResponse.flightSchedulesPerPage });
                            outerScope.airfareOptionsRegion.show(airfairOptionsLayout);

                            if (outerScope.canShopContractedAir && !outerScope.canShopInstantPurchasedAir) {
                                App.Booking.flightSchedules.setFlightSchedules(_.where(schedulesObject, { isFlexibleAir: true }));

                                //remove Airfare Type dropdowns
                                $('#airfareTypesRegion').remove();
                            } else {
                                App.Booking.flightSchedules.setFlightSchedules(schedulesObject);
                            }

                            if (App.Booking.flightSchedules.length > 0) {
                                App.Booking.scheduleDefault = false;

                                var resultsTitle = App.dictionary.get('tourRelated.Booking.FlightsProtection.BestAirfareOptions');
                                resultsTitle = resultsTitle.replace("{0}", App.Booking.flightSchedules.length);
                                //let's hide the search all option region if maxsearch was performed
                                if (maxSearch == true) {
                                    $('#showAllAirfareOptions').hide();
                                    var hereIsYourTopText = App.dictionary.get('tourRelated.Booking.FlightsProtection.HereIsYourTop'),
                                        hereAreYourTopText = App.dictionary.get('tourRelated.Booking.FlightsProtection.HereAreYourTop'),
                                        optionsText = App.dictionary.get('tourRelated.Booking.FlightsProtection.Options');

                                    resultsTitle = App.Booking.flightSchedules.length == 1 ? hereIsYourTopText + " " : hereAreYourTopText + " " + App.Booking.flightSchedules.length + " " + optionsText;
                                }

                                outerScope.$el.find('#bestAirfareOptionsInfo').html(resultsTitle);
                                $('html, body').animate({ scrollTop: outerScope.airfareOptionsRegion.$el.offset().top }, 2000);
                                EventAggregator.trigger('flightsFormAirSearchComplete');
                            } else {
                                outerScope.airfareOptionsRegion.close();
                                var noFlightsAvailableText = App.dictionary.get('tourRelated.Booking.FlightsProtection.NoFlightsAvailable');
                                outerScope.searchAirMessagesRegion.show(new InfoView([noFlightsAvailableText]));
                                outerScope.searchAirMessagesRegion.$el.show();

                                //if(App.siteSettings.includeInterAirPrice) EventAggregator.trigger('airSearch-noFlightsAvailable');
                            }

                        } else {
                            App.Booking.scheduleDefault = true;
                            //clear search results
                            outerScope.airfareOptionsRegion.close();
                            var noFlightsAvailableText = App.dictionary.get('tourRelated.Booking.FlightsProtection.NoFlightsAvailable');
                            outerScope.searchAirMessagesRegion.show(new InfoView([noFlightsAvailableText]));
                            outerScope.searchAirMessagesRegion.$el.show();

                            //if(App.siteSettings.includeInterAirPrice) EventAggregator.trigger('airSearch-noFlightsAvailable');
                        }
                    })
                    .fail(function () {
                        console.log('there was an issue getting the flights');
                        var issueSearchingForAirText = App.dictionary.get('tourRelated.Booking.FlightsProtection.IssueSearchingForAir');
                        outerScope.searchAirMessagesRegion.show(new ErrorView([issueSearchingForAirText]));
                        outerScope.searchAirMessagesRegion.$el.show();
                    });
            }
        },

        getDepartDate: function () {
            var $depart = this.$el.find('.depart');
            var $departHour = this.$el.find('.departHour');
            var $departAMPM = this.$el.find('.departAMPM');
            var departDate = $depart.datepicker('getDate');
            if ($depart.isNullOrEmpty() || $departHour.isNullOrEmpty() || $departAMPM.isNullOrEmpty()) {
                return null;
            } else {

                departDate = DateUtil.getDateTime($depart.datepicker('getDate'), $departHour.val(), $departAMPM.val());
            }

            return departDate;
        },

        getReturnDate: function () {
            var $return = this.$el.find('.return');
            var $returnHour = this.$el.find('.returnHour');
            var $returnAMPM = this.$el.find('.returnAMPM');

            var returnDate = null;
            if ($return.isNullOrEmpty() || $returnHour.isNullOrEmpty() || $returnAMPM.isNullOrEmpty()) {
                return null;
            } else {
                returnDate = DateUtil.getDateTime($return.datepicker('getDate'), $returnHour.val(), $returnAMPM.val());
            }

            return returnDate;
        },

        getPassengerCount: function () {
            return App.Booking.travelers !== null ? App.Booking.travelers.length : 0;
        },
        toggleDatePicker: function (e) {
            selector = e.currentTarget.className.includes('depart') ? 'depart' : 'return';
            if (selector === 'depart') {
                message = 'You need to choose a depart date';
            }
            else {
                message = document.querySelector('.return').value === "" ? App.dictionary.get('tourRelated.Booking.FlightsProtection.ChooseReturnDate') :
                    App.dictionary.get('tourRelated.Booking.FlightsProtection.ChooseALaterReturnDate');
            }

            PaymentFormUtil.ToggleVisual("#b2b8bd", "red", selector, "border-color",message);
        },
        toggleAirport: function (e) {
            let message;
            let airportId = App.Booking.Steps['flightStep'].getAirportId();
            message = ObjectUtil.isNullOrEmpty(airportId) ? App.dictionary.get('tourRelated.Booking.FlightsProtection.ChooseAnAirport') : "solid";
                 
            //if (e.which >= 48 || e.which >= 96 && e.which <= 105 || e.which === undefined) {
                PaymentFormUtil.ToggleVisual("#b2b8bd", "red", e.currentTarget.id, "border-color", message);
            //}
        },
    });

    return FlightsLayout;
});