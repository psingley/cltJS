define([
    'jquery',
    'underscore',
    'backbone',
    'models/booking/travelerInformation/AdditionalInfoModel',
    'text!templates/booking/travelerInformation/additionalInfoTemplate.html',
    'app',
    'util/taxonomy/taxonomyDomUtil',
    'services/bookingService',
    'util/objectUtil',
    'views/booking/travelerInformation/BaseTravelerInfoView'
], function ($, _, Backbone, AdditionalInfoModel, additionalInfoTemplate, App, TaxonomyDomUtil, BookingService, ObjectUtil, BaseTravelerInfoView) {
    var AdditionalInfoView = BaseTravelerInfoView.extend({
        model: AdditionalInfoModel,
        template: Backbone.Marionette.TemplateCache.get(additionalInfoTemplate),
        events: function () {
            var baseViewEvents = BaseTravelerInfoView.__super__.events;
            var events = {
                'click a.arrow_down': 'toggleAdditionalInfo',
                'blur input': 'saveTravelerInfo'
            }

            return _.extend(events, baseViewEvents);
        },
        templateHelpers: function () {
            return{
                numberOfTravelers: this.options.numberOfTravelers,
                travelerNumber: this.options.travelerNumber,
                passportInfoText: App.dictionary.get("common.FormLabels.PassportInfo"),
                countryOfIssueText: App.dictionary.get('common.FormLabels.CountryOfIssue'),
                expirationDateText: App.dictionary.get('common.FormLabels.ExpirationDate'),
                countryOfCitText: App.dictionary.get('common.FormLabels.CountryOfCitizenship'),
                issueDateText: App.dictionary.get('common.FormLabels.IssueDate'),
                authorityText: App.dictionary.get('common.FormLabels.Authority'),
                emergencyContactNameText: App.dictionary.get('common.FormLabels.EmergencyContactName'),
                emergencyContactPhoneText: App.dictionary.get('common.FormLabels.EmergencyContactPhone'),
                membershipTypeText: App.dictionary.get('common.FormLabels.MembershipType'),
                numberText: App.dictionary.get("common.FormLabels.Number"),
                airPreferencesText: App.Booking.sections.travelerInfo.airPreferencesTitle,
                airlineText: App.dictionary.get('common.FormLabels.Airline'),
                mealText: App.dictionary.get('common.FormLabels.Meal'),
                seatText: App.dictionary.get('common.FormLabels.Seat'),
                roomRequestsText: App.Booking.sections.travelerInfo.roomRequestsTitle,
                medicationInfoText: App.dictionary.get('common.FormLabels.MedicationsMedicalInfo'),
                dietaryRestrictionsText: App.dictionary.get('common.FormLabels.DietaryRestrictions'),
                frequentFlyerNumberText: App.dictionary.get('common.FormLabels.FrequentFlyerNumber'),
                additionalInfoText: App.Booking.sections.travelerInfo.additionalInfoTitle,
                additionalInfoAbstractText: App.Booking.sections.travelerInfo.additionalInfoText,
                wheelChairAssistanceText: App.dictionary.get('common.FormLabels.WheelchairAssistance')
            }
        },
        onShow: function () {
            var countries = App.locations.getAll('countries');

            var $country = $(this.$el.find('.country'));
            var $countryId = $(this.$el.find('.countryId'));
            TaxonomyDomUtil.setAutocomplete(countries, $country, $countryId);

            var $countryCitizenship = $(this.$el.find('.country_of_citizenship'));
            var $countryCitizenshipId = $(this.$el.find('.country_of_citizenshipId'));
            TaxonomyDomUtil.setAutocomplete(countries, $countryCitizenship, $countryCitizenshipId);

            //set up autocomplete for the airlines
            var $airline = $(this.$el.find('.airline'));
            var $airlineId = $(this.$el.find('.airlineId'));
            BookingService.getAirlines().complete(function (response) {
                var airlines = JSON.parse(response.responseJSON.d);
                TaxonomyDomUtil.setAutocomplete(airlines, $airline, $airlineId);
            });

            var $roomRequestDiv = $(this.$el.find('.roomRequestOptions'));
            TaxonomyDomUtil.setOptions('roomRequests', $roomRequestDiv);

            var $membershipTypesDiv = $(this.$el.find('.membership_type'));
            TaxonomyDomUtil.setOptions('membershipTypes', $membershipTypesDiv);

            var $seatTypesDiv = $(this.$el.find('.seat'));
            TaxonomyDomUtil.setOptions('seats', $seatTypesDiv);

            var $mealTypesDiv = $(this.$el.find('.meal'));
            TaxonomyDomUtil.setOptions('mealPreferences', $mealTypesDiv);
        },
        toggleAdditionalInfo: function (e) {
            e.preventDefault();
            var $this = $(e.target),
                $subheader = $this.closest(".subheader"),
                $expanded = $this.closest(".subheader").next().find(".expanded");

            if ($expanded.is(":visible")) {
                $('html, body').animate({scrollTop: $subheader.offset().top}, function () {
                    $expanded.slideUp();
                    $this.addClass("close");
                    $this.text("More Details");
                });
            } else {
                $('html, body').animate({scrollTop: $subheader.offset().top}, function () {
                    $expanded.slideDown();
                    $this.removeClass("close");
                    $this.text("Hide Details");
                });
            }
        }
    });

    return AdditionalInfoView;
});