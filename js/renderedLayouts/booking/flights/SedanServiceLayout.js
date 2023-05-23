define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'event.aggregator',
    'app',
    'util/objectUtil',
    'util/stringUtil',
    'util/validationUtil',
    'util/booking/bookingUtil',
    'services/bookingService',
    'views/booking/travelerInformation/TravelerSmallListView',
    'views/validation/ErrorView'

], function ($, _, Backbone, Marionette, EventAggregator, App, ObjectUtil, StringUtil, ValidationUtil, BookingUtil, BookingService, TravelerSmallListView, ErrorView) {
    var SedanServiceLayout = Backbone.Marionette.Layout.extend({
        el: '#sedanService',
        regions: {
            travelersRegion: '.travelers',
            'sedanServiceMessagesRegion': '#sedanServiceMessagesRegion'
        },
        events: {
            'click #searchSedanServiceButton': 'searchClick',
            'click input[name=sedanService]': 'toggleSedanService',
            'keyup #ZipCode': 'triggerSearchClick'
        },
        ui: {
            '$includeRow': '#sedanServiceInclude',
            '$declineRow': '#sedanServiceDecline',
            '$includeText': '#sedanServiceIncludeText',
            '$tooFar':'#sedanServiceTooFar'
        },
        initialize: function () {
            var outerScope = this;
            this.shopSedanService = false;
            this.decline = false;

            EventAggregator.on('showSedanService', function (showSedanService) {
                outerScope.shopSedanService = showSedanService;
                outerScope.searchAirToggle();
            });

            EventAggregator.on('searchForAirChanged', function () {
                outerScope.searchAirToggle();
            });

            this.hideSection();
            $(this.ui.$includeRow).hide();
            $(this.ui.$tooFar).hide();
        },
        triggerSearchClick: function(e) {
	        if (e.which === 13) {
	        	$('#searchSedanServiceButton').trigger('click');
	        }
        },
        hideSection: function () {
            this.$el.closest('.section').hide();
        },
        searchAirToggle: function () {
            if (App.Booking.Steps['flightStep'].getAddAir() && this.shopSedanService) {
                this.$el.closest('.section').show();
            } else {
                this.$el.closest('.section').hide();
                this.closeTravelerCheckBoxes();

                //make sure the true check box is unchecked
                var $acceptSedanService = this.$el.find('input[name=sedanService][value=true]');
                if ($acceptSedanService.is(':checked')) {
                    $acceptSedanService.prop('checked', false);
                    var $declineSedanService = this.$el.find('input[name=sedanService][value=false]');
                    $declineSedanService.prop('checked', true);
                }

                //make sure all traveler check boxes are unchecked
                var $travelerCheckBoxes = this.$el.find('input[name=traveler]');
                _.each($travelerCheckBoxes, function (checkbox) {
                    $(checkbox).prop('checked', false);
                });
            }
            BookingUtil.renderStepButtons();
        },
        sedanServiceSelectionDone: function () {
            // if nothing shown - don't need to choose
            var $shownOptions = this.$el.find('input[name=sedanService]:visible');
            if ($shownOptions.length == 0) {
                return true;
            }

            // if something is shown, there should be selection
            var $sedanServiceSelection = $shownOptions.parent().find(':checked');
            if ($sedanServiceSelection.length == 0) {
                return false;
            }

            return true;
        },
        getSedanServiceSelection: function () {
            var $sedanServiceSelection = this.$el.find('input[name=sedanService]:checked');
            return $sedanServiceSelection;
        },
        isActive: function () {
            if (this.$el.length > 0 && this.shopSedanService) {
                return true;
            }

            return false;
        },
        doorToDoorAvailable: function() {
            return $("#searchSedanServiceButton").length > 0;
        },
        toggleSedanService: function (e) {
            var $target = $(e.target);

            if (!this.doorToDoorAvailable) {
                if ($target.val() === 'true') {
                    this.showTravelerCheckBoxes();
                } else {
                    this.closeTravelerCheckBoxes();
                }
            }
            else {
                //remove selection from 'No, I decline' if it's the only checkbox.
                if ($target.val() === 'false') {
                    if (this.$el.find('input[name=sedanService]:visible').length == 1 && this.decline) {
                        e.target.checked = false;
                        this.decline = false;
                    }
                    else {
                        this.decline = true;
                    }
                }
                else {
                    this.decline = false;
                }
                App.Booking.Steps['flightStep'].calculateStepPrice();
            }

            App.Booking.Steps['flightStep'].updateSubmissionStatus();
        },
        searchClick: function (e){
            e.preventDefault();
            var outerScope = this;
            var zip = $('#ZipCode').val();
            // if blank - show error and return
            if (ObjectUtil.isNullOrEmpty(zip)) {
                this.showError(App.dictionary.get('common.FormValidations.Zip'));
                return;
            }

            var defaultCountry = App.siteSettings.defaultCountryName;
            var country = App.locations.getLocationItem('countries', defaultCountry);

            //if country is unknown don't validate
            if (country == null || ObjectUtil.isNullOrEmpty(country.id)) {
                this.hideError();
                return;
            }

            //validate zip code
            var countryId = country.id;
            ValidationUtil.validatePostalCode(countryId, false)
                .done(function(data) {
                	var valid = ValidationUtil.isPostalCodeValidForCountry(data, countryId, zip);
                    if (valid)
                    {
                        outerScope.hideError();
                        outerScope.searchSedanService(zip);
                    }
                    else
                    {
                        outerScope.showError(App.dictionary.get('common.FormValidations.ZipInvalid'));
                        return;
                    }
                });
        },
        searchSedanService: function (zip) {
            var outerScope = this;
            BookingService.flightsForm_CalculateDTD(App.Booking.Steps['flightStep'].getAirportId(),zip)
                .done(function (response) {
                    if (!ObjectUtil.isNullOrEmpty(response) && !ObjectUtil.isNullOrEmpty(response.d)) {
                        var result = JSON.parse(response.d);
                        if (!ObjectUtil.isNullOrEmpty(result) ){
                            outerScope.showAppropriateText(result);
                            return;
                        }
                    }
                    outerScope.showError([App.dictionary.get('tourRelated.Booking.FlightsProtection.SedanService.SearchFailMessage')]);
                    $(outerScope.ui.$declineRow).show();
                    $(outerScope.ui.$includeRow).hide();
                    $(outerScope.ui.$tooFar).hide();
                })
                .fail(function (response) {
                    console.log(response.responseText);
                    $(this.ui.$declineRow).show();
                    $(this.ui.$includeRow).hide();
                    $(this.ui.$tooFar).hide();
                    outerScope.showError([App.dictionary.get('tourRelated.Booking.FlightsProtection.SedanService.SearchFailMessage')]);
                });
        },
        showAppropriateText: function(priceInfo) {
            if (priceInfo.transferAvailable) {
                App.Booking.transferPrice = priceInfo.price;
                var str;
                if (priceInfo.price > 0) {
                    str = StringUtil.format(App.dictionary.get('tourRelated.Booking.FlightsProtection.SedanService.AddWithPrice'),priceInfo.distanceMin, priceInfo.distanceMax, priceInfo.price);
                }
                else {
                    str = App.dictionary.get('tourRelated.Booking.FlightsProtection.SedanService.AddIncluded');
                }
                $(this.ui.$includeText).text(str);
                $(this.ui.$includeRow).show();
                $(this.ui.$declineRow).show();
                $(this.ui.$tooFar).hide();
            }
            else {
                App.Booking.transferPrice = 0;
                $(this.ui.$declineRow).hide();
                $(this.ui.$includeRow).hide();
                $(this.ui.$tooFar).show();
            }

        },
        showError: function(errorMessage) {
            var errorsArray = [];
            errorsArray.push(errorMessage);

            var errorView = new ErrorView(errorsArray);
            this.sedanServiceMessagesRegion.show(errorView);
        },
        hideError: function() {
            //remove error view and continue with default behavior
            this.sedanServiceMessagesRegion.close();
        },
        showTravelerCheckBoxes: function () {
            this.travelersRegion.show(new TravelerSmallListView({collection: App.Booking.travelers, type: 'checkbox'}));
        },
        closeTravelerCheckBoxes: function () {
            this.travelersRegion.close();
        }
    });

    return SedanServiceLayout;
});