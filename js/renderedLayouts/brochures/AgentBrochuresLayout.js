define([
	'jquery',
	'underscore',
	'backbone',
	'app',
	'util/seoTaggingUtil',
	'goalsUtil',
	'util/taxonomy/taxonomyDomUtil',
	'util/objectUtil',
	'renderedLayouts/brochures/BaseBrochureOrderLayout',
	'util/validationUtil',
	'views/validation/ErrorView',
	'views/validation/SuccessView',
	'util/brochures/brochuresOrderFormUtil',
	'models/brochures/AgentBrochureOrderFormModel',
	'services/brochureService'
], function ($, _, Backbone, App, SeoTaggingUtil, goalsUtil, TaxonomyDomUtil, ObjectUtil, BaseBrochureOrderLayout, ValidationUtil, ErrorView, SuccessView, BrochuresOrderFormUtil, AgentBrochureOrderFormModel, brochureService) {
	var agentBrochuresLayout = BaseBrochureOrderLayout.extend({
		el: '#agent-brochure-page',
		events: {
			'change .countryId': 'updateFormLocations',
			'change .stateId': 'saveState',
			'click #btnBrochuresRequest': 'submitForm',
			'click .pdf-download': 'trackPdfDownload',
			'click .viewBrochureButton': 'trackViewBrochure',
			'click .stepper-btn .fa-minus-circle': 'decrementBrochureOrder',
			'click .stepper-btn .fa-plus-circle': 'incrementBrochureOrder',
			'click input[name=address]:checked': 'toggleAddresses',
			'change .stepper input': 'handleChangeForBrochureCount'
		},
		ui: _.extend({}, BaseBrochureOrderLayout.prototype.ui, {
			'$brochureButton': '#btnBrochuresRequest',
			'$addressOnFile': '#addressOnFile',
			'$alternateAddress': '#alternateAddress',
			'$maxBrochuresOrderCount': '#maxBrochuresOrderCount'
		}),
		regions: {
			messagesRegion: '.error_box',
			brochureListSection: "#brochure-list",
			brochureOrderFormSection: "#brochure-order-form",
			brochuresThankYouRegion: '#brochuresThankYouRegion'
		},
		alternateAddress: null,
		addressOnFile: null,
		autocompleteInitialized: false,
		initialize: function () {
			require(['bootstrap']);

			this.errorMessages = [];
			this.ui.$zip.css("text-transform", "uppercase");
			this.autocompleteModeIsOn = App.siteSettings.isAddressAutocompleteEnabled && !ObjectUtil.isNullOrEmpty(App.siteSettings.defaultCountryId);

			var viewContext = this;
			$.when(App.locationsOnAddresses.getLocations())
				.done(function () {
					viewContext.setUpAutoCompletion();

					if (viewContext.ui.$addressOnFile.length > 0) {
						viewContext.addressOnFile = new AgentBrochureOrderFormModel();
						viewContext.addressOnFile.set(viewContext.getAddressObject());
						viewContext.addressOnFile.set({ stateHidden: true });
						viewContext.alternateAddress = new AgentBrochureOrderFormModel();
						var defaultCountry = App.siteSettings.defaultCountryNameOnAddresses;
						var country = App.locationsOnAddresses.getLocationItem('countries', defaultCountry);
						if (country != null) {
							viewContext.alternateAddress.set({countryId: country.id , countryName: country.name});
						}
						viewContext.setEditableMode(false);
					}
					else {
						viewContext.setDefaultCountry();
						viewContext.alternateAddress = new AgentBrochureOrderFormModel(viewContext.getAddressObject());
                        viewContext.setExperianAutocomplete('brochureOrderAddressForm');
					}
				});
		},
		setUpAutoCompletion: function () {
			if (this.ui.$country.length > 0) {
				var countries = App.locationsOnAddresses.getAll('countries');
				if (countries != null) {
					TaxonomyDomUtil.setAutocomplete(countries, this.ui.$country, this.ui.$countryId);
					if (this.ui.$country.val().length > 0) {
                        var state;
                        if (!App.isUKSite) {
                            if (this.ui.$state.val().length > 0) {
                                state = { id: this.ui.$stateId.val(), name: this.ui.$stateName.val() };
                            }
                            this.updateFormLocations();
                            if (state != undefined) {
                                this.ui.$stateId.val(state.id);
                                this.ui.$stateName.val(state.name);
                                this.ui.$state.val(state.name);
                            }
                        }
					}
				}
			}
		},
		getAddressObject: function() {
			var viewContext = this;
			var object = {
				countryId: viewContext.ui.$countryId.val(),
				countryName: viewContext.ui.$countryName.val(),
				stateId: viewContext.ui.$stateId.val(),
				stateName: viewContext.ui.$stateName.val(),
				city: viewContext.ui.$city.val(),
				address: viewContext.ui.$address.val(),
				address2: viewContext.ui.$address2.val(),
				zipcode: viewContext.ui.$zip.val(),
				stateHidden: viewContext.ui.$state.is('[disabled=disabled]')
			};
			return object;
		},
		toggleAddresses: function(e) {
			var viewContext = this,
					value = e.currentTarget.value;
			if (value === "alternateAddress") {
				if(viewContext.autocompleteModeIsOn && !viewContext.autocompleteInitialized) {
                    viewContext.setExperianAutocomplete('brochureOrderAddressForm');
					viewContext.autocompleteInitialized = true;
				}

				//save existing addressOnFile
				viewContext.addressOnFile.set(viewContext.getAddressObject());
				viewContext.setEditableMode(true);
				viewContext.setNewAddressObject(viewContext.alternateAddress);

			}
			else if (value === "addressOnFile") {
				//save existing alternateAddress
				viewContext.alternateAddress.set(viewContext.getAddressObject());
				viewContext.setEditableMode(false);
				viewContext.setNewAddressObject(viewContext.addressOnFile);
			}
			viewContext.errorMessages = [];
			viewContext.messagesRegion.reset();
		},
		setNewAddressObject: function(addressObject) {
			var viewContext = this;
			if (addressObject != null) {
				viewContext.ui.$city.val(addressObject.attributes.city);
				viewContext.ui.$zip.val(addressObject.attributes.zipcode);
				viewContext.ui.$address.val(addressObject.attributes.address);
				viewContext.ui.$address2.val(addressObject.attributes.address2);
				viewContext.ui.$countryId.val(addressObject.attributes.countryId);
				viewContext.ui.$country.val(addressObject.attributes.countryName);
				viewContext.ui.$countryName.val(addressObject.attributes.countryName);
				viewContext.updateFormLocations();
				viewContext.ui.$stateId.val(addressObject.attributes.stateId);
				viewContext.ui.$stateName.val(addressObject.attributes.stateName);
				viewContext.ui.$state.val(addressObject.attributes.stateName);
				if (addressObject.attributes.stateHidden) {
					viewContext.ui.$state.attr('disabled', 'disabled');
				}
				else {
					viewContext.ui.$state.removeAttr('disabled');
				}
			}
		},
		setDefaultCountry: function () {
			var defaultCountry = App.siteSettings.defaultCountryNameOnAddresses;
			var country = App.locationsOnAddresses.getLocationItem('countries', defaultCountry);
			if (country != null) {
				this.ui.$country.val(country.name);
				this.ui.$countryId.val(country.id);
				this.updateFormLocations();
			}
		},
		setEditableMode: function(flag) {
			var viewContext = this;
			if (flag) {
				if(viewContext.autocompleteModeIsOn) {
					viewContext.ui.$experianDiv.show();
					viewContext.ui.$fullAddressForm.hide();
				} else{
					viewContext.ui.$city.removeAttr('disabled');
					viewContext.ui.$zip.removeAttr('disabled');
					viewContext.ui.$address.removeAttr('disabled');
					viewContext.ui.$address2.removeAttr('disabled');
					viewContext.ui.$country.removeAttr('disabled');
					viewContext.ui.$state.removeAttr('disabled');
				}
			} else {
				if(viewContext.autocompleteModeIsOn) {
					viewContext.ui.$experianDiv.hide();
					viewContext.ui.$fullAddressForm.show();
				}
				viewContext.ui.$city.attr('disabled', 'disabled');
				viewContext.ui.$zip.attr('disabled', 'disabled');
				viewContext.ui.$address.attr('disabled', 'disabled');
				viewContext.ui.$address2.attr('disabled', 'disabled');
				viewContext.ui.$country.attr('disabled', 'disabled');
				viewContext.ui.$state.attr('disabled', 'disabled');
			}
		},

		trackPdfDownload: function (e) {
			BrochuresOrderFormUtil.trackPdfDownload(e);
		},

		trackViewBrochure: function (e) {
			BrochuresOrderFormUtil.trackViewBrochure(e);
		},

		incrementBrochureOrder: function(e) {
			e.preventDefault();
			var stepperClass = $(e.currentTarget).parents().eq(2);
			var input = $(stepperClass).find('input')[0];
			if (parseInt(input.value) < parseInt(this.ui.$maxBrochuresOrderCount[0].value)) {
				input.value = parseInt(input.value) + 1;
			}
		},

		decrementBrochureOrder: function(e) {
			e.preventDefault();
			var stepperClass = $(e.currentTarget).parents().eq(2);
			var input = $(stepperClass).find('input')[0];
			if (parseInt(input.value) > 0) {
				input.value = parseInt(input.value) - 1;
			}
		},

		handleChangeForBrochureCount: function(e) {
			e.preventDefault();
			var input = $(e.currentTarget)[0];
			if (parseInt(input.value) < 0) {
				input.value = 0;
			}
			else if (parseInt(input.value) > parseInt(this.ui.$maxBrochuresOrderCount[0].value)) {
				input.value = parseInt(this.ui.$maxBrochuresOrderCount[0].value);
			}
		},

		updateFormLocations: function () {
			var countryText = this.ui.$country.val(),
				countryId = this.ui.$countryId.val(),
				viewContext = this;

			this.saveCountry(countryId);

			if (countryId == App.locationsOnAddresses.getLocationId('countries', countryText)) {
				App.locationsOnAddresses.getStatesForAddressesLocation(countryId)
					.complete(function (response) {
						viewContext.states = $.parseJSON(response.responseJSON.d);
						if (viewContext.states.length > 0) {
							TaxonomyDomUtil.setAutocomplete(viewContext.states, viewContext.ui.$state, viewContext.ui.$stateId);
							// if we are on alternate address thenonly have the edit mode for state 
							if (viewContext.addressOnFile == null || $('input[name=address]:checked').val() === "alternateAddress") {
								viewContext.ui.$state.removeAttr('disabled');
							} else {
								viewContext.ui.$state.attr('disabled', 'disabled');
							}
						}
						else {
							TaxonomyDomUtil.setAutocomplete([], viewContext.ui.$state, viewContext.ui.$stateId);
							viewContext.ui.$state.attr('disabled', 'disabled');
						}
					});
			} else {
				TaxonomyDomUtil.setAutocomplete([], this.ui.$state, this.ui.$stateId);
			}
		},
		saveState: function () {
			var stateId = this.ui.$stateId.val();
			var state = App.locationsOnAddresses.getLocationOnAddressesItemById(stateId);
			var name = state ? state.name : '';
			this.ui.$stateName.val(name);
		},
		saveCountry: function (countryId) {
			var country = App.locationsOnAddresses.getLocationOnAddressesItemById(countryId);
			var name = country ? country.name : '';
			this.ui.$countryName.val(name);
			this.ui.$stateId.val('');
			this.ui.$state.val('');
			this.ui.$stateName.val('');
		},

		submitForm: function(e) {
			e.preventDefault();

			$('#brochuresThankYouRegion').html('');
			this.brochuresThankYouRegion.close();

			var requiredAddress = App.dictionary.get('common.FormValidations.Address'),
			requiredCity = App.dictionary.get('common.FormValidations.City'),
			requiredCountry = App.dictionary.get('common.FormValidations.Country'),
			requiredBrochures = App.dictionary.get('common.FormValidations.SelectedBrochures'),

			txtCountryId = this.ui.$countryId.val(),
			txtAddress1 = this.ui.$address.val(),
            txtCity = this.ui.$city.val(),
            zip = this.ui.$zip.val(),
			viewContext = this;
			//reset the error messages
			this.errorMessages = [];

			var selectedBrochures = this.getSelectedBrochures();
			if (selectedBrochures.ids.length === 0) {
				this.errorMessages.push(requiredBrochures);
			}
            
            if (ObjectUtil.isNullOrEmpty(txtCountryId)) {
                this.errorMessages.push(requiredCountry);
            }

            this.validateAddress(txtAddress1, txtCity, zip);

            this.finalizeSubmission();
        },
        validateAddress: function (address, city, zip) {
            if (this.autocompleteModeIsOn) {
                var stateId = this.ui.$stateId.val();
                if (!App.isUKSite && !App.isThomasCookSite) {
                    if (ObjectUtil.isNullOrEmpty(address) ||
                        ObjectUtil.isNullOrEmpty(city) ||
                        ObjectUtil.isNullOrEmpty(zip) ||
                        ObjectUtil.isNullOrEmpty(stateId)) {
                        this.errorMessages.push(App.dictionary.get('common.FormValidations.SelectAddressRequired',
                            'Please select your address.'));
                    }
                } else {
                    if (ObjectUtil.isNullOrEmpty(address) ||
                        ObjectUtil.isNullOrEmpty(city) ||
                        ObjectUtil.isNullOrEmpty(zip)) {
                        this.errorMessages.push(App.dictionary.get('common.FormValidations.SelectAddressRequired',
                            'Please select your address.'));
                    }
                }

            } else {
                if (ObjectUtil.isNullOrEmpty(address)) {
                    this.errorMessages.push(App.dictionary.get('common.FormValidations.Address'));
                }

                if (ObjectUtil.isNullOrEmpty(city)) {
                    this.errorMessages.push(App.dictionary.get('common.FormValidations.City'));
                }

                if (ObjectUtil.isNullOrEmpty(zip)) {
                    this.errorMessages.push(App.dictionary.get('common.FormValidations.Zip'));
                }
                else if (!this.validateZip()) {
                    this.errorMessages.push(App.dictionary.get('common.FormValidations.ZipInvalid'));
                }

                this.validateState();
            }
        },
		validateZip: function () {
            //validate zip code only if it's entered
            var countryId = this.ui.$countryId.val(),
                zip = this.ui.$zip.val(),
                viewContext = this;
            switch (countryId) {
                case '{D45EE287-32AB-4565-90D3-39826573703B}': // uk CountryOnaddressesItem
                    {
                        viewContext.valid = ValidationUtil.validateUKPostCode(zip, false);
                        return viewContext.valid;
                    }
                case '{4996A5DC-164B-434C-8A61-6B42F71449AC}': //us CountryOnaddressesItem
                    {
                        viewContext.valid = ValidationUtil.validateUSPostCode(zip, false);
                        return viewContext.valid;
                    }
                case '{C83EEDB0-3CD6-4A63-96E0-2493806D39AE}': //canada CountryOnaddressesItem
                    {
                        viewContext.valid = ValidationUtil.validateCAPostCode(zip, false);
                        return viewContext.valid;
                    }
                case '{99699F11-61E5-44B1-A15D-7D88870F99CC}': //australia CountryOnaddressesItem
                    {
                        viewContext.valid = ValidationUtil.validateAUPostCode(zip, false);
                        return viewContext.valid;
                    }
                default:
                    {
                        if (ObjectUtil.isNullOrEmpty(zip)) {
                            viewContext.valid = false;
                            return viewContext.valid;
                        }
                        break;
                    }
            }
        },
        validateState: function () {
            var countryId = this.ui.$countryId.val(),
                requiredState = App.dictionary.get('common.FormValidations.State'),
                ddlStates = this.ui.$stateId.val(),
                viewContext = this;

            //validate state
            if (!App.isUKSite && !App.isThomasCookSite) {
                if (ObjectUtil.isNullOrEmpty(ddlStates)) {
                    return viewContext.errorMessages.push(requiredState);
                } else {
                    return ValidationUtil.validateState(countryId, true)
                        .done(function (response) {
                            if (response.d) {
                                viewContext.errorMessages.push(requiredState);
                            }
                        });
                }
            }
        },
		getSelectedBrochures: function() {
			var selectedBrochures = { ids: [], brCodes: [], quantity: [] },
				$allBrochures = $('.stepper :input');

			for (var i = 0, len = $allBrochures.length; i < len; i++) {
				if ($allBrochures[i].value > 0) {
					var obj = $allBrochures[i];
					var id = $(obj).data('id');
					var brCode = $(obj).data('brcode');
					var quantity = obj.value;

					selectedBrochures.ids[i] = id;
					selectedBrochures.brCodes[i] = brCode;
					selectedBrochures.quantity[i] = quantity;
				}
			}
			return selectedBrochures;
		},

		finalizeSubmission: function() {
			if (this.errorMessages.length === 0) {
				this.submit();
			}
			else {
				var errorView = new ErrorView(this.errorMessages);
				this.messagesRegion.show(errorView);
			}
		},

		submit: function () {
			var success = App.dictionary.get('brochures.SuccessMessage');
	
			this.messagesRegion.close();

			var formObject = new Object();
			formObject.address1 = this.ui.$address.val();
			formObject.address2 = this.ui.$address2.val();
			formObject.city = this.ui.$city.val();
			formObject.state = this.ui.$stateId.val();
			formObject.country = this.ui.$countryId.val();
			formObject.zip = this.ui.$zip.val().toUpperCase();
			formObject.iAmAgent = true;

			var successView = new SuccessView([success]);
			this.brochuresThankYouRegion.show(successView);

			var $tempArray = [],
					$selectedBrochures = $('.stepper :input[value!=0]');

			$selectedBrochures.each(function () {
				$tempArray.push($(this).closest('.brochure-detail').find('.detail .info h3').text() + ', ');
			});
			BrochuresOrderFormUtil.trackBrochuresRequested($tempArray);
			this.disableButton();

			this.requestBrochure(formObject);
			this.ui.$autoAddress.val('');
		},

		resetForm: function() {
			if ($('#brochuresThankYouRegion').html().length > 0) {

				var viewContext = this;

				// Resetting alternateaddress to default fields
				var object = new AgentBrochureOrderFormModel();
				var defaultCountry = App.siteSettings.defaultCountryNameOnAddresses;
				var country = App.locationsOnAddresses.getLocationItem('countries', defaultCountry);
				if (country != null) {
					object.set({ countryId: country.id, countryName: country.name });
				}
				viewContext.alternateAddress.set(object.attributes);

				if (viewContext.addressOnFile == null || $('input[name=address]:checked').val() === "alternateAddress") {
					viewContext.setNewAddressObject(object);
				}

				viewContext.messagesRegion.close();

				//reset selected brochures
				var $allBrochures = $('.stepper :input');
				for (var i = 0, len = $allBrochures.length; i < len; i++) {
					if ($allBrochures[i].value > 0) {
						$allBrochures[i].value = 0;
					}
				}

				//show the submit button
				var button = this.ui.$brochureButton;
				if (button != null) {
					this.ui.$brochureButton.prop("disabled", false);
					this.ui.$brochureButton.show();
				}
			}
		},
		scrollFunction: function (target, offset) {
			if (location.pathname.replace(/^\//, '') === window.location.pathname.replace(/^\//, '') && location.hostname === window.location.hostname) {
				if (target.length) {
					$('html,body').animate({
						scrollTop: $(target).offset().top - offset
					}, 750);
				}
			}
		},
		disableButton: function () {
			//disable button
			var button = this.ui.$brochureButton;
			if (button != null) {
				this.ui.$brochureButton.prop("disabled", true);
			}
		},
		requestBrochure: function (formObject) {
			var currentItemId = App.siteSettings.currentItemId,
				viewContext = this;
			viewContext.ui.$brochureButton.hide();

			var brochures = this.getSelectedBrochures();
			var i;
			var brochureCountPair = {};
			for (i = 0; i < brochures.ids.length; i++) {
				brochureCountPair[brochures.ids[i]] = brochures.quantity[i];
			}
			formObject.brochureCountPair = brochureCountPair;
			formObject.signupDataSourceId = $("#newsletter-modal").attr('data-datasourceid') || "";

			viewContext.resetForm();
			var params = JSON.stringify({ 'brochureObject': JSON.stringify(formObject), 'currentItemId': currentItemId });
			brochureService.requestBrochure(params, false);

			//submit goal for each brochure
			goalsUtil.requestOrDownloadBrochure('Brochure Form Submitted');
			goalsUtil.brochureFormComplete();
		}
	});
	// Our module now returns our view
	return agentBrochuresLayout;
});
