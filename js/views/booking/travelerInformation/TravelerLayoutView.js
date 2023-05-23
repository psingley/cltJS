define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'util/seoTaggingUtil',
    'models/booking/travelerInformation/TravelerModel',
    'text!templates/booking/travelerInformation/travelerLayoutTemplate.html',
    'views/booking/travelerInformation/AdditionalInfoView',
    'views/booking/travelerInformation/ContactInfoView',
    'util/taxonomy/taxonomyDomUtil',
    'event.aggregator',
    'views/booking/travelerInformation/BaseTravelerInfoView',
    'util/objectUtil',
    'util/booking/travelerFormUtil',
    'util/travelerUtil',
    'util/paymentFormUtil',
    'views/validation/ErrorView'
], function ($, _, Backbone, Marionette, App, SeoTaggingUtil, TravelerModel, travelerLayoutTemplate, AdditionalInfoView, ContactInfoView, TaxonomyDomUtil, EventAggregator, BaseTravelerInfoView, ObjectUtil, TravelerFormUtil, TravelerUtil, PaymentFormUtil, ErrorView) {
    var TravelerLayoutView = BaseTravelerInfoView.extend({
        template: Backbone.Marionette.TemplateCache.get(travelerLayoutTemplate),
        model: TravelerModel,
        className: 'section',
        tagName: 'div',
        regions: {
            'contactInfoRegion': '#contactInfoRegion',
            'additionalInfoRegion': '#additionalInfoRegion',
            'travelerMessagesRegion': '.travelerErrorMessages'
        },
        events: function () {
            var events = {
                'click .header': 'toggleTravelerTab',
                'click .next_traveler': 'jumpToNextTraveler',
                'blur input.travelerInput': 'saveTravelerInfo',
                'change select.travelerInput': 'saveTravelerInfo',
                'change #chkDontUseCurrent': 'useCurrentChange',
                'keypress input[data-position=1]': 'onMonthKey',
                'keypress input[data-position=2]': 'onDayKey',
                'keypress input[data-position=3]': 'onYearKey',
                'keyup input[data-position=1]': 'onMonthChange',
                'keyup input[data-position=2]': 'onDayChange',
                'keyup input[data-position=3]': 'onYearChange',
                'keyup .form-control': 'toggleBorderColor',
                'keydown .form-control': 'toggleBorderColor',
                'change select[name=gender]': 'toggleBorderColor',
                'change .nonreq': 'toggleNonReq'

            };

            return _.extend(events, BaseTravelerInfoView.prototype.events);
        },
        initialize: function () {
            //add to traveler child view container
            App.Booking.travelerListView.add(this);
        },
        onRender: function () {
            var $suffixSelector = this.$el.find('.suffixDropDown');
            TaxonomyDomUtil.setOptions('suffixes', $suffixSelector);

            var suffix = this.model.get('suffix');
            if (!ObjectUtil.isNullOrEmpty(suffix)) {
                $suffixSelector.val(suffix.name);
            }

            var $salutationSelector = this.$el.find('.salutationDropDown');
            if ($salutationSelector) {
                TaxonomyDomUtil.setOptions('salutations', $salutationSelector);

                var salutation = this.model.get('salutation');
                if (!ObjectUtil.isNullOrEmpty(salutation)) {
                    $salutationSelector.val(salutation.name);
                }
            }

            var $genderSelector = this.$el.find('.genderDropDown');
            TaxonomyDomUtil.setOptions('genders', $genderSelector);

            var gender = this.model.get('gender');
            if (!ObjectUtil.isNullOrEmpty(gender) && !ObjectUtil.isNullOrEmpty(gender.name)) {
                $genderSelector.val(gender.name);
            }

            this.setContactInfoRegion();
            this.hideSubsequentTravelers();

            var $dropDownLists = this.$el.find('select.travelerInput');
            $dropDownLists.prettySelect();

            var requiredFields = App.Booking.Steps['travelerStep'].requiredFields;
            for (var k in requiredFields) {
                // use hasOwnProperty to filter out keys from the Object.prototype
                if (requiredFields.hasOwnProperty(k)) {
                    var label = this.$el.find(requiredFields[k]);
                    if (!ObjectUtil.isNullOrEmpty(label)) {
                        label.append('<span style="float:left; color:#B92E45">*</span>');
                    }
                }
            } 

        },
        onlyNumberKey: function(evt) {
            // Only ASCII character in that range allowed
            var ASCIICode = (evt.which) ? evt.which : evt.keyCode
            if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))
                return false;
            return true;
        },
        onMonthKey: function (e) {
            if (this.onlyNumberKey(e)) {
                if (e.key === "/") {
                    if (e.target.value.length > 0) {
                        var $nextInput = this.$el.find('input[data-position=2]');
                        $nextInput.focus();
                    }
                    e.preventDefault()
                }
            }
            else {
                return false;
            }
        },
        onDayKey: function (e) {
            if (this.onlyNumberKey(e)) {
                if (e.key === "/") {
                    if (e.target.value.length > 0) {
                        var $nextInput = this.$el.find('input[data-position=3]');
                        $nextInput.focus();
                    }
                    e.preventDefault()
                }
            }
            else {
                return false;
            }
        },
        onYearKey: function (e) {
            if (this.onlyNumberKey(e)) {
                if (e.key === "/") {
                    e.preventDefault()
                }
            } else {
                return false;
            }
        },
        onMonthChange: function (e) {
            if (e.target.value.length === 2) {
                var $nextInput = this.$el.find('input[data-position=2]');
                $nextInput.focus();
            }
        },
        onDayChange: function (e) {
            if (e.target.value.length === 2) {
                var $nextInput = this.$el.find('input[data-position=3]');
                $nextInput.focus();
            }
        },
        onYearChange: function (e) {
            if (e.target.value.length === 4) {
                var $nextInput = this.$el.find('input[name=phone]');
                $nextInput.focus();
            }
        },
        hideSubsequentTravelers: function () {
            //hide all of the travelers that aren't the first traveler in the list
            if (this.options.travelerNumber !== 1) {
                var travelerInfoElement = this.$el.find('.traveler_info');
                travelerInfoElement.hide();
            }
        },
        setContactInfoRegion: function () {
            var contactInfo = this.model.get('contactInfo');
            this.contactInfoRegion.show(new ContactInfoView(
                {
                    model: contactInfo,
                    travelerNumber: this.options.travelerNumber,
                    numberOfTravelers: this.options.numberOfTravelers
                }
            ));
        },
        setAdditionalInfoRegion: function () {
            //This region will not be ready for launch.
            var additionalInfo = this.model.get('additionalInfo');
            this.additionalInfoRegion.show(new AdditionalInfoView(
                {
                    model: additionalInfo,
                    travelerNumber: this.options.travelerNumber,
                    numberOfTravelers: this.options.numberOfTravelers
                }
            ));
        },
        templateHelpers: function () {
            var outerScope = this;
            return {
                loyaltyNumberText: App.dictionary.get('common.FormLabels.ColletteLoyaltyNumber'),
                personalInfoText: App.Booking.sections.travelerInfo.personalInfoTitle,
                noticeText: App.Booking.sections.travelerInfo.notice,
                firstNameText: App.dictionary.get('common.FormLabels.FirstName'),
                firstNameMessage: App.dictionary.get('common.FormValidations.FirstName'),
                lastNameText: App.dictionary.get('common.FormLabels.LastName'),
                lastNameMessage: App.dictionary.get('common.FormValidations.LastName'),
                requiredFieldsText: App.dictionary.get('tourRelated.Booking.TravelerInfo.RequiredFields'),
                genderText: App.dictionary.get('common.FormLabels.Gender'),
                genderMessage: App.dictionary.get('common.FormValidations.Gender'),
                dateOfBirthText: App.dictionary.get('common.FormLabels.DateOfBirth'),
                suffixText: App.dictionary.get('common.FormLabels.Suffix'),
                salutationText: App.dictionary.get('common.FormLabels.Salutation'),
                middleInitialText: App.dictionary.get('common.FormLabels.MiddleName'),
                yourPersonalText: App.dictionary.get('tourRelated.Booking.TravelerInfo.YourPersonal'),
                requiredText: App.dictionary.get('tourRelated.Booking.RequiredField'),
                travelerText: App.dictionary.get('tourRelated.Booking.TravelerInfo.Traveler'),
                nextTraveler: App.dictionary.get('tourRelated.Booking.TravelerInfo.NextTraveler'),
                dayText: App.dictionary.get('common.Calendar.Day'),
                monthText: App.dictionary.get('common.Calendar.Month'),
                yearText: App.dictionary.get('common.Calendar.Year'),
                phoneMessage: App.dictionary.get('common.FormValidations.Phone'),
                showSalutationField: App.Booking.sections.travelerInfo.showSalutationField,
                travelerNumber: function () {
                    var indexOfTraveler = App.Booking.travelers.indexOf(outerScope.model);
                    return indexOfTraveler;
                },
                wasInitialized: function () {
                    return App.Booking.passengerAutoInit && this.travelerNumber() == 0;
                },
                getLoyaltyNumber: function () {
                    if (outerScope.model.attributes.loyaltyNumber != undefined) {
                        return outerScope.model.attributes.loyaltyNumber;
                    }
                },
                dontUseChecked: function () {
                    if (this.wasInitialized() && outerScope.model.attributes.loyaltyNumber == "")
                        return "checked";
                },
                UKDateFormat: function () {
                    var dateFormat = App.siteSettings.dateFormat;
                    if (!dateFormat) {
                        return false;
                    }
                    return dateFormat.toLowerCase().indexOf('dd') == 0;
                },
                dateHelperText: App.Booking.sections.travelerInfo.dateHelperText,
                numberOfTravelers: App.Booking.travelers.length,
                dontUseCurrent: App.dictionary.get('tourRelated.Booking.TravelerInfo.DontUseCurrent'),
                closedClass: function () {
                    if (this.travelerNumber() == 1) {
                        //return nothing because there is no open class
                        return '';
                    } else {
                        return 'close';
                    }
                }
            }
        },
        jumpToNextTraveler: function (e) {
            e.preventDefault(); 
            var messages = [];
            let mobileErrorText = document.querySelector(".mobile.errorText");
            if (App.Booking.Steps['travelerStep'].validateForAgent === true) {
                messages = this.model.validateForAgent();
            } else {
                messages = this.model.validate();
            }
            if (messages.length > 0 || mobileErrorText.textContent !== "") {
                let inputs = document.getElementById('travelerInformationContent').querySelectorAll('.req');
                inputs.forEach((c, i) => {
                    let target = c.name ? c.name : "";
                    let classname = c.className ? c.className : "";
                    TravelerUtil.ValidationStation(target, classname);
                });
            } else {
                    var nextTraveler = $(e.target).data("next");
                    var $header = $(".header." + nextTraveler);
                    this.activateTravelerAccordion($header);
            }
            $('html').animate({
                scrollTop: 700
            }, 600);
        },
        // Booking Engine Step #5 - show/hide Traveler Info on header click
        toggleTravelerTab: function (e) {
            e.preventDefault();

            if (this.options.travelerNumber > 1) {
                var prevTraveler = App.Booking.travelers.at(this.options.travelerNumber - 2);

                //wire model validation here
                var messages = [];
                if (App.Booking.Steps['travelerStep'].validateForAgent == true) {
                    messages = prevTraveler.validateForAgent();
                } else {
                    messages = prevTraveler.validate();
                }

                if (messages.length > 0) {
                    var prevTravelerView = App.Booking.travelerListView.findByModel(prevTraveler);
                   //var errorView = new ErrorView(messages);
                   //prevTravelerView.travelerMessagesRegion.show(errorView);
                } else {
                    var $header = $(e.target).parent();
                    this.activateTravelerAccordion($header);
                }
            } else {
                var $header = $(e.target).parent();
                this.activateTravelerAccordion($header);
            }
        },
        activateTravelerAccordion: function ($header) {
            var outerScope = this;
            var $header_link = $header.find("a.arrow_down"),
                $expanded = $header.closest(".section").find(".traveler_info");

            if ($expanded.is(":visible")) {
                $('html, body').animate({ scrollTop: $header.offset().top }, function () {
                    $expanded.slideUp();
                    $header_link.addClass("close");
                });
            } else {
                var position;
                if (this.options.travelerNumber == 1 && !$header.hasClass('t2')) {
                    position = $header.closest('.section').offset().top
                } else {
                    position = $header.closest('.section').prev('.section').offset().top
                }

                $('body, html').animate({ 'scrollTop': position },
                    function () {
                        var travelers = $('.traveler_info');

                        if (travelers.length > 1) {
                            travelers
                                .not($expanded).slideUp(function () {
                                    $expanded.slideDown();
                                    $header_link.removeClass("close");
                                }
                                ).closest('.section').find('a.arrow_down').addClass('close');
                        } else {
                            $expanded.slideDown();
                            $header_link.removeClass('close');
                        }
                    });
            }
        },
        useCurrentChange: function (e) {
            var item = e.target;
            if (item.checked) {
                var oldTraveler = App.Booking.travelers.first().clone();
                var newTraveler = new TravelerModel();
                newTraveler.cid = oldTraveler.cid;
                newTraveler.id = oldTraveler.id;
                newTraveler.attributes.loyaltyNumber = '';
                newTraveler.attributes.passengerType = oldTraveler.attributes.passengerType;
                App.Booking.oldPassengerData = oldTraveler;
                App.Booking.travelers.add(newTraveler, { at: 0, merge: true });
                App.Booking.travelers.first().set('id', newTraveler.id);
                this.render();
            }
            else {
                App.Booking.travelers.add(App.Booking.oldPassengerData, { at: 0, merge: true });
                App.Booking.travelers.first().set('id', App.Booking.oldPassengerData.id);
                this.render();
            }
        },
        toggleBorderColor: function (e) {
            if (e.which === 32 || e.which === 8) {
                TravelerUtil.ValidationStation(e.currentTarget.name, e.currentTarget.className);
            }
            if (e.which === undefined) {
                TravelerUtil.ValidationStation(e.currentTarget.name, e.currentTarget.className);
            }
            if (e.which >= 48 || e.which >= 96 && e.which <= 105) {
                TravelerUtil.ValidationStation(e.currentTarget.name, e.currentTarget.className);
            }
        },
        toggleNonReq: function (e) {
                TravelerUtil.ValidationStation(e.currentTarget.name, e.currentTarget.className);
        }
    });

    return TravelerLayoutView;
});