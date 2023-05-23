define([
    'jquery',
    'underscore',
    'backbone',
    'models/booking/travelerInformation/ContactInfoModel',
    'text!templates/booking/travelerInformation/contactInfoTemplate.html',
    'app',
    'util/taxonomy/taxonomyDomUtil',
    'views/booking/travelerInformation/BaseTravelerInfoView',
    'util/validationUtil',
    'util/objectUtil',
    'util/travelerUtil'
], function ($, _, Backbone, ContactInfoModel, contactInfoTemplate, App, TaxonomyDomUtil, BaseTravelerInfoView, ValidationUtil, ObjectUtil, TravelerUtil) {
    var ContactInfoView = BaseTravelerInfoView.extend({
        model: ContactInfoModel,
        template: Backbone.Marionette.TemplateCache.get(contactInfoTemplate),
        events: function () {
            var baseViewEvents = BaseTravelerInfoView.__super__.events;
            var events = {
                'change .countryId': 'updateFormLocations',
                'click .copyInfo': 'copyInfoFromPreviousTraveler',
                'blur input': 'saveTravelerInfo',
                //'change input': 'saveEmailInfo',
                'change .stateId': 'saveState',
                'keyup  .req': 'toggleBorderColor',
                'keydown .req': 'toggleBorderColor',
                'change  input[name=email]': 'toggleBorderColor',
                'change  input[name=confirmEmail]': 'toggleBorderColor',
                'change .divIATA' : 'validateIATA'
            };

            return _.extend(events, baseViewEvents);
        },
        validateIATA: function (e) {
            let mobilehtml = '<label>Mobile</label>';
            let mobilefield = e.currentTarget.parentElement.querySelector('input[name=mobile]');
            let mobiletext = e.currentTarget.parentElement.querySelector('.mobiletext');
            let ddl = e.currentTarget.parentElement.querySelector('.ddIATA');


            let mobilerequired = '<label>Mobile<span style="float:left; color:#B92E45">*</span></label>';
            if (ddl.value === "1" || ddl.value === "3") {
                mobiletext.innerHTML = mobilerequired;
                if (mobilefield.value === "") {
                    mobilefield.value = "xxxxxxxxxxxxxx";
                }
                TravelerUtil.ValidationStation('mobile', 'mobile');
                this.saveTravelerInfo(e);
            }
            else
            {
                mobiletext.innerHTML = mobilehtml;
                mobilefield.value  = "";
                TravelerUtil.ValidationStation('mobile', 'mobile');
                this.saveTravelerInfo(e);
            }
        },
        copyInfoFromPreviousTraveler: function () {
            var $copyInfoCheckBox = this.$el.find('.copyInfo');

            if ($copyInfoCheckBox.is(':checked')) {
                //we subtract two here because the index starts at 0 and travelerNumber is for display in the front end
                var previousTraveler = App.Booking.travelers.at(this.options.travelerNumber - 2);
                var currentTraveler = App.Booking.travelers.at(this.options.travelerNumber - 1);

                this.model = previousTraveler.get('contactInfo').clone();
                this.model.set({ travelerInfoCopied: true });

                //update selected country
                var country = this.model.get('country');
                if (country !== null) {
                    this.$el.find('.countryId').val(country.id);
                    this.updateFormLocations();
                }

                this.render();
                currentTraveler.set('contactInfo', this.model);
                TravelerUtil.showIATA();
           
            } else {
                //this.model = new ContactInfoModel();
                //this.render();
                console.log("NEW: " + JSON.stringify(this.model));
            }
        
        },
        onRender: function () {
            var countries = App.locations.getAll('countries');
            var $country = $(this.$el.find('.country'));
            var $countryId = $(this.$el.find('.countryId'));

            TaxonomyDomUtil.setAutocomplete(countries, $country, $countryId);
            if(App.siteSettings.setDefaultCountry && !ObjectUtil.isNullOrEmpty(App.siteSettings.defaultCountryName)){
                this.setDefaultCountry();
            }
        },
        setDefaultCountry: function () {
            //don't set the country if we already have country selected
            //update selected country
            var country = this.model.get('country');
            if (!ObjectUtil.isNullOrEmpty(country)) {
                this.$el.find('.countryId').val(country.id);
                this.updateFormLocations();
            } else {
                var unitedStates = App.locations.getLocationItem('countries', App.siteSettings.defaultCountryName);
                this.$el.find('.countryId').val(unitedStates.id);
                this.updateFormLocations();
            }
        },
        templateHelpers: function () {
            var outerScope = this;

            return {
                emailAddress: outerScope.model.get('email'),
                address1Text: App.dictionary.get('common.FormLabels.Address1'),
                address2Text: App.dictionary.get('common.FormLabels.Address2'),
                cityText: App.dictionary.get('common.FormLabels.City'),
                confirmEmailText: App.dictionary.get('common.FormLabels.ConfirmEmail'),
                countryText: App.dictionary.get('common.FormLabels.Country'),
                emailText: App.dictionary.get('common.FormLabels.Email'),
                mobileText: App.dictionary.get('common.FormLabels.Mobile'),
                phoneText: App.dictionary.get('common.FormLabels.Phone'),
                phoneMessage: App.dictionary.get('common.FormValidations.Phone'),
                stateText: App.dictionary.get('common.FormLabels.State'),
                zipCodeText: App.dictionary.get('common.FormLabels.ZipCode'),
                copyInfoText: App.dictionary.get('common.FormLabels.CopyInfo'),
                contactInfoText: App.Booking.sections.travelerInfo.contactInfoTitle,
                numberOfTravelers: this.options.numberOfTravelers,
                travelerNumber: this.options.travelerNumber,
                getCountryName: function () {
                    var country = outerScope.model.get('country');
                    if (country !== null && !ObjectUtil.isNullOrEmpty(country.name)) {
                        return country.name;
                    }

                    return '';
                },
                getCountryId: function () {
                    var country = outerScope.model.get('country');
                    if (country !== null && !ObjectUtil.isNullOrEmpty(country.id)) {
                        return country.id;
                    }

                    return '';
                },
                getStateName: function () {
                    var state = outerScope.model.get('state');
                    if (state !== null && !ObjectUtil.isNullOrEmpty(state.name)) {
                        return state.name;
                    }
                    return '';
                },
                getStateId: function () {
                    var state = outerScope.model.get('state');
                    if (state !== null && !ObjectUtil.isNullOrEmpty(state.id)) {
                        return state.id;
                    }

                    return '';
                },
                travelerInfoCopied: function () {
                    var travelerInfoCopied = outerScope.model.get('travelerInfoCopied');
                    if (travelerInfoCopied) {
                        return "checked";
                    }
                }
            }
        },
        onShow: function () {
            this.updateFormLocations();
        },
        updateFormLocations: function (e) {

            var outerScope = this;
            var countryText = this.$el.find('.country').val();
            var countryId = this.$el.find('.countryId').val();
            this.saveCountry(countryId);

            var $stateSelector = outerScope.$el.find('.state');
            var $stateIdSelector = outerScope.$el.find('.stateId');

            if (countryId === App.locations.getLocationId('countries', countryText)) {
                App.locations.getCountryStates(countryId, function (countryStates) {
                    var states = $.parseJSON(JSON.stringify(countryStates));
                    TaxonomyDomUtil.setAutocomplete(states, $stateSelector, $stateIdSelector);
                });
              
            } else {
                TaxonomyDomUtil.setAutocomplete([], $stateSelector, $stateIdSelector);
                 
            }
            TravelerUtil.ValidationStation('country', 'country');
        },
        saveState: function (e) {
            var $target = $(e.target);
            var $state = this.$el.find('.stateId');
            var stateId = $state.val();
            var state = App.locations.getLocationItemById(stateId);
            this.model.set({ state: state });
            TravelerUtil.ValidationStation('state', 'state');

        },
        saveCountry: function (countryId) {
            var country = App.locations.getLocationItemById(countryId);
            this.model.set({country: country});
        },
        toggleBorderColor: function (e) {
            if (e.currentTarget.name === "ignore"  ||e.which === 32 || e.which === 8) {
                TravelerUtil.ValidationStation(e.currentTarget.name, e.currentTarget.className);
            }
            if (e.which === undefined) {
                TravelerUtil.ValidationStation(e.currentTarget.name, e.currentTarget.className);
            }
            if (e.which >= 48 || e.which >= 96 && e.which <= 105) {
                    TravelerUtil.ValidationStation(e.currentTarget.name, e.currentTarget.className);
            }
        },
    });

    return ContactInfoView;
});