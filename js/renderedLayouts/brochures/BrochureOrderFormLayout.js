define([
	'jquery',
	'underscore',
	'backbone',
	'app',
	'event.aggregator',
	'util/taxonomy/taxonomyDomUtil',
	'util/objectUtil',
	'views/validation/ErrorView',
	'views/validation/WarningView',
	'views/validation/SuccessView',	
	'util/validationUtil',
	'util/seoTaggingUtil',
	'renderedLayouts/brochures/BaseBrochureOrderLayout',
	'goalsUtil',
	'util/uriUtil',
	'util/prettySelectUtil',
	'util/newsletterUtil',
	'models/customerLead/CustomerLeadRequestModel',
	'models/customerLead/CustomerLeadBrochureModel',
	'collections/customerLead/CustomerLeadBrochureCollection',
	'services/customerLeadService',
	'util/brochures/brochuresOrderFormUtil',
	'phoneUtil',
	'util/dataLayerUtil',
	'services/brochureService',
	'services/subscriptionService'
], function ($, _, Backbone, App, EventAggregator, TaxonomyDomUtil, ObjectUtil, ErrorView, WarningView, SuccessView, ValidationUtil, SeoTaggingUtil, BaseBrochureOrderLayout, goalsUtil, UriUtil, PrettySelectUtil, NewsletterUtil, CustomerLeadRequestModel, CustomerLeadBrochureModel, CustomerLeadBrochureCollection, CustomerLeadService, BrochuresOrderFormUtil, PhoneUtil, DataLayerUtil, brochureService, subscriptionService) {
	var BrochureOrderFormLayout = BaseBrochureOrderLayout.extend({
		el: '#brochure-order-form',
		events: {
			'change .countryId': 'updateFormLocations',
			'change .stateId': 'saveState',
			'change #ddlPhoneCountry': 'formatPhoneNumber',
			'blur #txtPromotionCode': 'formatPromoCode',
			'blur #txtPhone': 'formatPhoneNumber',
			'blur #txtEmail': 'enableConfirmEmail',
			'submit #brochureRequestForm': 'submitForm',
			'click .brochure-checkbox': 'toggleBrochure',
			'click .pdf-download': 'trackPdfDownload',
			'click .viewBrochureButton': 'trackViewBrochure'
		},
		ui: _.extend({}, BaseBrochureOrderLayout.prototype.ui, {
			'$howDidYouHear': '#ddlHowDidYouHear',
			'$phoneCountry': '#ddlPhoneCountry',
			'$title': '#ddlTitle',
			'$firstName': '#txtFirstName',
			'$phone': '#txtPhone',
			'$lastName': '#txtLastName',
			'$email': '#txtEmail',
			'$emailConfirm': '#txtConfirmEmail',
			'$promoCode': '#txtPromotionCode',
			'$brochureButton': '#btnBrochureRequest',
			'$optInEmail': '.optInEmailCheckBox',
			'$agentWithMoreTravelers': '#is-traveling-with-more-travelers',
			'$optInMail': '.optInMailCheckBox',
			'$optInPhone': '.optInPhoneCheckBox',
			'$brochureModalPopup': '.brochurePopupModal',
			'$brochureModalCheckBox': '.modalOptInCheckBox',
			'$brochureMessageContainer': '.brochure-message',
			'$brochureOrderButton': '.primary-brochure-button',
			'$checkedBrochures': '.brochure-checkbox.checked',
			'$brochureModal': '#brochure-order-form',
			'$brochureCheckboxes': '.brochure-checkboxes',
			'$iAmAgent': '#is-travel-agent',
			'$workingWithAgent': '#is-with-travel-agent',
			'$appendTo': '#brochureRequestForm',
			'$brochurePixel': '#brochurePixel',
			'$brochurePixelDiv': '#brochurePixelDiv',
			'$adFormBrochurePixel': '#adFormBrochurePixel',
			'$adFormBrochurePixelId': '#adFormBrochurePixelId',
			'$adFormBrochureNamingConvention': '#adFormBrochureNamingConvention'
		}),
		regions: {
			messagesRegion: '.brochure.error_box',
			brochureSelectionMessagesRegion: '.brochure_selection.warning_box',
			brochuresThankYouRegion: '#brochuresThankYouRegion'
		},
		autocompleteModeIsOn: false,
		initialize: function () {
			require(['bootstrap']);
			phoneUtil = i18n.phonenumbers.PhoneNumberUtil.getInstance();
			this.ui.$zip.css("text-transform", "uppercase");
			var viewContext = this;
			this.errorMessages = [];

			this.setExperianAutocomplete('brochureRequestForm');

			var offercode = this.getParameterByName('offercode');
			if (!ObjectUtil.isNullOrEmpty(offercode)) {
				this.ui.$promoCode.val(offercode);
				this.formatPromoCode();
			}

			//clear checkbox
			this.ui.$agentWithMoreTravelers.attr('checked', false);

			$.when(App.locationsOnAddresses.getLocations())
				.done(function () {
					viewContext.setUpForm();
				});

			//if it is the US site check off opt in for email
			if (App.siteIds.Collette === App.siteSettings.siteId && App.siteSettings.siteLanguage === "en") {
				this.ui.$optInEmail.prop('checked', true);
			}

			this.countBrochures();

			var promo = UriUtil.getParameterByName('AffId');
			if (!ObjectUtil.isNullOrEmpty(promo)) {
				this.ui.$promoCode.val(promo.replace(/-/g, "").substr(0, 10));
				this.formatPromoCode();
			}

			//listens to modal close event
			$('#brochure-order-form').on('hide.bs.modal', function (e) {
				viewContext.resetFormOnSubmit();
			});
			$('#ddlPhoneCountry option').each(function (i, obj) {
				var isoCode = $(obj).val();
				var countryCode = phoneUtil.getCountryCodeForRegion(isoCode);
				var countryLabel = $(obj).text();
				$(obj).text("+" + countryCode + " " + countryLabel);
			});
			EventAggregator.on('requestBrochureComplete', function (data) {
				App.Brochures.cookieValue = data;
				App.Brochures.stop();
				viewContext.submitLead(data);
			});
		},
		getParameterByName: function (name) {
			name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
			var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
				results = regex.exec(location.search);
			return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
		},
		setUpForm: function () {
			if (this.ui.$country.length > 0) {
				var countries = App.locationsOnAddresses.getAll('countries');
				if (!App.isUSSite && countries != null) {
					TaxonomyDomUtil.setAutocomplete(countries, this.ui.$country, this.ui.$countryId, this.ui.$appendTo);
					if (!ObjectUtil.isNullOrEmpty(App.siteSettings.defaultCountryNameOnAddresses)) {
						this.setDefaultCountry();
					}
				}
				if (App.isUSSite && !ObjectUtil.isNullOrEmpty(App.siteSettings.defaultCountryNameOnAddresses)) {
					this.setDefaultCountry();
					$('#country').attr('readonly', true);
				}
				$('#txtConfirmEmail').attr('readonly', true);
			}
		},
		submitForm: function (e) {
			e.preventDefault();
			var requiredFirstname = App.dictionary.get('common.FormValidations.FirstName'),
				requiredLastname = App.dictionary.get('common.FormValidations.LastName'),
				requiredCountry = App.dictionary.get('common.FormValidations.Country'),
				requiredBrochures = App.dictionary.get('common.FormValidations.SelectedBrochures'),
				emailOptInValidation = App.dictionary.get('common.FormValidations.EmailOptIn'),
				phoneOptInValidation = App.dictionary.get('common.FormValidations.OptInPhone'),
				requiredEmail = App.dictionary.get('common.FormValidations.Email-Required'),
				requiredConfirmEmail = App.dictionary.get('common.FormValidations.Email-ConfirmRequired'),
				requiredTitleField = App.dictionary.get('common.FormValidations.Title'),
				requiredPhoneField = App.dictionary.get('common.FormValidations.Phone'),
				emailCheckBoxValidation = App.dictionary.get('common.FormValidations.OptInNotCheckedEmail'),
				txtFirstName = this.ui.$firstName.val(),
				txtLastName = this.ui.$lastName.val(),
				txtAddress1 = this.ui.$address.val(),
				txtCity = this.ui.$city.val(),
				ddlCountries = this.ui.$countryId.val(),
				emailEntered = this.ui.$email.val(),
				confirmedEmailEntered = this.ui.$emailConfirm.val(),
				title = this.ui.$title.val(),
				zip = this.ui.$zip.val(),
				optInEmail = this.ui.$optInEmail.is(':checked'),
				iAmAgent = this.ui.$iAmAgent.is(':checked'),
				WorkingWithAgent = this.ui.$workingWithAgent.is(':checked'),
				phone = this.ui.$phone.val(),
				optInPhone = this.ui.$optInPhone.is(':checked'),
				viewContext = this;

			//reset the error messages
			this.errorMessages = [];

			this.validateBrochureSelection();

			if (!App.isUSSite && ObjectUtil.isNullOrEmpty(title)) {
				this.errorMessages.push(requiredTitleField);
			}

			if (ObjectUtil.isNullOrEmpty(txtFirstName.trim())) {
				this.errorMessages.push(requiredFirstname);
			}

			if (ObjectUtil.isNullOrEmpty(txtLastName.trim())) {
				this.errorMessages.push(requiredLastname);
			}

			if (!App.isUKSite && !App.isThomasCookSite && ObjectUtil.isNullOrEmpty(emailEntered)) {
				this.errorMessages.push(requiredEmail);
			}

			if (!App.isUKSite && !App.isThomasCookSite && ObjectUtil.isNullOrEmpty(phone)) {
				this.errorMessages.push(requiredPhoneField);
			}

			if (ObjectUtil.isNullOrEmpty(ddlCountries)) {
				this.errorMessages.push(requiredCountry);
			}
			this.validateAddress(txtAddress1, txtCity, zip);

			if (!ObjectUtil.isNullOrEmpty(phone)) {
				var phoneErrors = ValidationUtil.validatePhoneNumber(phone);
				if (phoneErrors.length > 0) {
					this.errorMessages.push(phoneErrors);
				}
				if (App.isUKSite || App.isThomasCookSite) {
					if (!optInPhone) {
						this.errorMessages.push(phoneOptInValidation);
					}
				}
			}

			if (optInPhone && ObjectUtil.isNullOrEmpty(phone)) {
				this.errorMessages.push(requiredPhoneField);
			}

			if (!ObjectUtil.isNullOrEmpty(emailEntered)) {
				if (!ObjectUtil.isNullOrEmpty(confirmedEmailEntered)) {
					var emailErrorMessages = ValidationUtil.validateEmailConfirmEmail(emailEntered, confirmedEmailEntered);
					this.errorMessages = this.errorMessages.concat(emailErrorMessages);
				} else {
					this.errorMessages.push(requiredConfirmEmail);
				}

				if (App.isUKSite || App.isThomasCookSite) {
					if (!optInEmail) {
						this.errorMessages.push(emailCheckBoxValidation);
					}
				}
			}

			if (optInEmail && ObjectUtil.isNullOrEmpty(emailEntered)) {
				this.errorMessages.push(emailOptInValidation);
			}

			//validate promo code if it's not empty
			var promotionCode = this.ui.$promoCode.val();
			if (!ObjectUtil.isNullOrEmpty(promotionCode) && !ValidationUtil.validatePromoCode(promotionCode)) {
				var enterValidPromoCode = App.dictionary.get('tourRelated.Booking.Referral.Validations.PromoCodeInvalid');
				this.errorMessages.push(enterValidPromoCode);
			}

			var selectedBrochures = this.getSelectedBrochures();
			if (selectedBrochures.ids.length === 0) {
				this.errorMessages.push(requiredBrochures);
			}

			this.finalizeSubmission();
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
		requestBrochure: function () {
			var currentItemId = App.siteSettings.currentItemId;

			var formObject = new Object();
			formObject.firstName = this.ui.$firstName.val();
			formObject.lastName = this.ui.$lastName.val();
			formObject.email = this.ui.$email.val();
			formObject.confirmEmail = this.ui.$emailConfirm.val();
			formObject.address1 = this.ui.$address.val();
			formObject.address2 = this.ui.$address2.val();
			formObject.city = this.ui.$city.val();
			formObject.state = this.ui.$stateId.val();
			formObject.country = this.ui.$countryId.val();
			formObject.zip = this.ui.$zip.val().toUpperCase();
			formObject.phone = this.ui.$phone.data('value');
			formObject.title = this.ui.$title.find(':selected').data('title');
			formObject.titleId = this.ui.$title.val();
			var promotionCode = this.ui.$promoCode.val();
			formObject.promotionCode = (promotionCode.length > 5) ? promotionCode.substring(0, 4) : promotionCode;
			formObject.howDidYouHear = this.ui.$howDidYouHear.val();
			formObject.optInEmail = this.ui.$optInEmail.is(':checked');
			formObject.optInMail = this.ui.$optInMail.is(':checked');
			formObject.optInPhone = this.ui.$optInPhone.is(':checked');
			formObject.iAmAgent = this.ui.$iAmAgent.is(':checked');
			formObject.workingWithAgent = this.ui.$workingWithAgent.is(':checked');
			formObject.signupDataSourceId = $("#newsLetterSingupId").val();

			this.ui.$brochureButton.hide();

			var brochures = this.getSelectedBrochures();
			var i;
			var brochureCountPair = {};
			for (i = 0; i < brochures.ids.length; i++) {
				brochureCountPair[brochures.ids[i]] = 1;
			}
			formObject.brochureCountPair = brochureCountPair;

			var submitBrochureFunc = function (mailSignUp) {
				var paramsObj = { 'brochureObject': JSON.stringify(formObject), 'currentItemId': currentItemId };

				if (mailSignUp) {
					paramsObj.newsletterCodes = "[\"" + $("#newsLetterCode").val() + "\"]";
				}

				var params = JSON.stringify(paramsObj);
				brochureService.requestBrochure(params, mailSignUp);
			};

			if (formObject.optInEmail) {
				subscriptionService.ifUserSubscribed(formObject.email, [$("#NewsLetterCode").val()])
					.done(function (response) {
						var emailExists = (response.d.toLowerCase() === 'true'.toLowerCase());
						submitBrochureFunc(!emailExists);

						if (emailExists) {
							$(".successMessages .validationMessages ul")
								.append("<li>" + App.dictionary.get('brochures.AlreadySubscribedMessage') + "</li>");
						}
					});
			} else {
				submitBrochureFunc(false);
			}

			if (!App.isUKSite) {
				var data = {
					"fields": [
						{
							name: "title",
							value: formObject.title == undefined ? "" : formObject.title
						},
						{
							name: "firstname",
							value: formObject.firstName
						},
						{
							name: "lastname",
							value: formObject.lastName
						},
						{
							name: "email",
							value: formObject.email
						},
						{
							name: "confirm_email",
							value: formObject.email
						},
						{
							name: "phone_country_code",
							value: formObject.country
						},
						{
							name: "phone",
							value: formObject.phone
						},
						{
							name: "address",
							value: formObject.address1
						},
						{
							name: "city",
							value: formObject.city
						},
						{
							name: "state",
							value: formObject.state
						},
						{
							name: "zip",
							value: formObject.zip
						},
						{
							name: "please_tell_us_how_you_heard_about_collette",
							value: formObject.howDidYouHear
						},
						{
							name: "yes_i_would_like_to_receive_email_offers_travel_tips_and_destination_information_",
							value: formObject.optInEmail
						},
						{
							name: "yes_i_m_a_travel_professional",
							value: formObject.iAmAgent
						}]
				}

				var final_data = JSON.stringify(data);
				var hubspot_id = App.dictionary.get('brochures.NewsletterSignUpHubspot');

				var hubspot_url = 'https://api.hsforms.com/submissions/v3/integration/submit/2641890/' + hubspot_id;

				$.ajax({
					url: hubspot_url,
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					data: final_data,
					type: 'POST',
					success: function (data) {
						//dataModel = data.d;
						console.log("Hubspot submission successful");
					},
					error: function (errorResponse) {
						console.log('Hubspot NewsletterService call failed: RequestBrochure');
						//console.log(errorResponse.responseText);
					}
				})
			}

			//submit goal for each brochure
			goalsUtil.requestOrDownloadBrochure('Brochure Form Submitted');
			goalsUtil.brochureFormComplete();
		},
		getSelectedBrochures: function () {
			var selectedBrochures = { ids: [], brCodes: [], brTitles: [] },
				$selectedBrochures = $('.brochureCheckboxes input[type=\'checkbox\']:checked');

			for (var i = 0, len = $selectedBrochures.length; i < len; i++) {
				var obj = $selectedBrochures[i];
				var id = $(obj).data('id');
				var brCode = $(obj).data('brcode');
				var beTitle = $(obj).data('brtitle');

				selectedBrochures.ids[i] = id;
				selectedBrochures.brCodes[i] = brCode;
				selectedBrochures.brTitles[i] = beTitle;
			}
			return selectedBrochures;
		},
		finalizeSubmission: function () {
			if (this.errorMessages.length === 0) {
				this.submit();
				try {
					this.sendToDataLayer();
				}
				catch (e) { console.log(e); }
			} else {
				var errorView = new ErrorView(this.errorMessages);
				this.messagesRegion.show(errorView);
			}
		},
		bingConversion: function () {
			window.uetq = window.uetq || [];
			window.uetq.push({ 'ec': 'Brochure', 'ea': 'Request', 'el': 'Info. Offer', 'ev': '1' });
		},
		submit: function () {
			var success = App.dictionary.get('brochures.SuccessMessage');
			this.messagesRegion.close();
			this.bingConversion();
			//close section
			$("#primary.online_brochures .subheader.order a.arrow_down").click();

			var successView = new SuccessView([success]);
			this.brochuresThankYouRegion.show(successView);

			// On sucess of submission fire mediaMath Pixel script
			if (!ObjectUtil.isNullOrEmpty(this.ui.$brochurePixel.val())) {
				var mediaMathScript =
					"<script language='JavaScript1.1'src='//pixel.mathtag.com/event/js?mt_id=@pixelId&mt_adid=178979&v1=&v2=&v3=&s1=&s2=&s3='></script>";
				mediaMathScript = mediaMathScript.replace("@pixelId", this.ui.$brochurePixel.val());
				this.ui.$brochurePixelDiv.append(mediaMathScript);
			}

			if (SeoTaggingUtil.useExternalScripts()) {
				// On sucess of submission fire AdForm Pixel script
				if (!ObjectUtil.isNullOrEmpty(this.ui.$adFormBrochurePixelId.val())) {
					var brochures = this.getSelectedBrochures();
					var brochureCollection = [];

					for (var i = 0; i < brochures.brTitles.length; i++) {
						var selectedBrochures = { productid: '', productname: '', step: 3 };
						selectedBrochures.productid = (!ObjectUtil.isNullOrEmpty(brochures.brCodes[i]) ? brochures.brCodes[i] : '');
						selectedBrochures.productname = brochures.brTitles[i];
						selectedBrochures.step = 3;
						brochureCollection.push(selectedBrochures);
					}
					var adFormScript = " <script type='text/javascript'> window._adftrack = Array.isArray(window._adftrack) ? window._adftrack : (window._adftrack ? [window._adftrack] : []); window._adftrack.push({pm: AdFormPixelId, pagename: encodeURIComponent('tourNamingConvention'), divider: encodeURIComponent('|'), order: { sales: '', orderid: '', sv5: 'Submit', svn1: '', svn2: '', sv6: '', sv7: '', sv8: '', sv9: '',itms: InsertArrayHere} }); (function () { var s = document.createElement('script'); s.type = 'text/javascript'; s.async = true; s.src = 'https://a2.adform.net/serving/scripts/trackpoint/async/'; var x = document.getElementsByTagName('script')[0]; x.parentNode.insertBefore(s, x); })(); </script >";
					adFormScript = adFormScript.replace("AdFormPixelId", this.ui.$adFormBrochurePixelId.val());
					adFormScript = adFormScript.replace("tourNamingConvention", this.ui.$adFormBrochureNamingConvention.val().replace("Bookings1", "Brochure"));
					adFormScript = adFormScript.replace("InsertArrayHere", JSON.stringify(brochureCollection));
					this.ui.$adFormBrochurePixel.append(adFormScript);
				}
			}

			var $tempArray = [],
				$selectedBrochures = $('.brochureCheckboxes input[type=\'checkbox\']:checked');

			$selectedBrochures.each(function () {
				$tempArray.push($(this).parent().prev('td').text() + ', ');
			});
			BrochuresOrderFormUtil.trackBrochuresRequested($tempArray);
			this.disableButton();
			this.requestBrochure();
		},
		disableButton: function () {
			//disable button
			var button = this.ui.$brochureButton;
			if (button != null) {
				this.ui.$brochureButton.prop("disabled", true);
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
		updateBrochureMessage: function (numBrochures) {
			var messageHtml,
				btnHtml;

			if (numBrochures == 0) {
				messageHtml = App.dictionary.get('brochures.ClickToOrder', 'Click below to begin your order.');
				btnHtml = App.dictionary.get('brochures.OrderYourBrochures', 'Order Your Brochures');
			} else {
				messageHtml = this.tokenizeSelectionCount(numBrochures);
				btnHtml = App.dictionary.get('brochures.CompleteOrder');
			}

			$('.brochure-message').html(messageHtml);
			$('.primary-brochure-button').html(btnHtml);
		},
		countBrochures: function (btn) {
			var numBrochures = this.ui.$brochureCheckboxes.find('.checked').length;
			this.updateBrochureMessage(numBrochures);
		},
		tokenizeSelectionCount: function (numBrochures) {
			switch (numBrochures) {
				case (0):
					return App.dictionary.get('brochures.ClickToOrder', 'Click below to begin your order.');
				case (1):
					return App.dictionary.get('brochures.SelectedOneBrochures').replace('1', "<br><strong>1</strong>");
				default:
					return App.dictionary.get('brochures.SelectedXBrochures').replace("{x}", "<br><strong>" + numBrochures + "</strong>");
			}
		},
		toggleBrochure: function (e) {
			var btn = $(e.currentTarget);
			var brID = $(btn).attr("data-select");
			var cb = $(brID).find("input[type='checkbox']");

			$(brID).toggleClass("checked");

			if ($(brID).hasClass("checked")) {
				$(cb).prop("checked", true);
			} else {
				$(cb).prop("checked", false);
			}

			this.countBrochures(btn);
			this.validateBrochureSelection();
		},
		validateBrochureSelection: function () {
			this.brochureSelectionMessagesRegion.close();
			this.errorMessages = [];

			var maxBrochures = parseInt($('#brochure_maxBrochuresOrderedConsumer').val());
			var maxBrochuresSelectedMsg = App.dictionary.get('common.FormValidations.MaxBrochuresSelected');
			maxBrochuresSelectedMsg = maxBrochuresSelectedMsg.replace("$$maxbrochures$$", maxBrochures);

			var numBrochures = this.ui.$brochureCheckboxes.find('.checked').length;
			var exclusiveBrochures = this.ui.$brochureCheckboxes.find('.checked[data-oneperorder="true"]');
			var exclusiveBrochureName = $(exclusiveBrochures).find('input.hidden').data('brtitle');
			var numExclusiveBrochures = this.ui.$brochureCheckboxes.find('.checked[data-oneperorder="true"]').length;

			var exclusiveBrochureOrderedMsg = App.dictionary.get('common.FormValidations.ExclusiveBrochureOrdered');
			exclusiveBrochureOrderedMsg = exclusiveBrochureOrderedMsg.replace("$$brochurename$$", exclusiveBrochureName);

			if (numExclusiveBrochures > 0 && numBrochures > 1) {
				this.errorMessages.push(exclusiveBrochureOrderedMsg);
			} else if (numBrochures > maxBrochures) {
				this.errorMessages.push(maxBrochuresSelectedMsg);
			}

			if (this.errorMessages.length > 0) {
				var warningView = new WarningView(this.errorMessages);
				this.brochureSelectionMessagesRegion.show(warningView);
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
						if (ObjectUtil.isNullOrEmpty(response) || ObjectUtil.isNullOrEmpty(response.responseJSON)
							|| ObjectUtil.isNullOrEmpty(response.responseJSON.d)) {
							viewContext.ui.$state.attr('disabled', 'disabled');
						}

						viewContext.states = $.parseJSON(response.responseJSON.d);

						if (!ObjectUtil.isNullOrEmpty(viewContext.states) && viewContext.states.length > 0) {
							TaxonomyDomUtil.setAutocomplete(viewContext.states, viewContext.ui.$state, viewContext.ui.$stateId, viewContext.ui.$appendTo);
							viewContext.ui.$state.removeAttr('disabled');
						}
						else {
							viewContext.ui.$state.attr('disabled', 'disabled');
						}
					});
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
			if (country != null) {
				this.ui.$countryName.val(country.name);
			}

			this.ui.$stateId.val('');
			this.ui.$state.val('');
		},
		trackPdfDownload: function (e) {
			var el = e.target.closest('a').closest('div').firstChild.nextSibling;
			if (el) {
				DataLayerUtil.GetBrochureData(el, "Pdf Download", e.target.href);
			}
			BrochuresOrderFormUtil.trackPdfDownload(e);
		},
		trackViewBrochure: function (e) {
			var el = e.target.closest('a').closest('div').firstChild.nextSibling;
			if (el) {
				DataLayerUtil.GetBrochureData(el, "View Brochure", e.target.href);
			}
			BrochuresOrderFormUtil.trackViewBrochure(e);
		},
		formatPromoCode: function () {
			var $target = this.ui.$promoCode;
			var promoCode = $target.val();
			var formattedCode = promoCode.replace(/(\w{4})(\w{3})(\w{3})/, "$1-$2-$3");
			this.ui.$promoCode.val(formattedCode);

			if (ObjectUtil.isNullOrEmpty(promoCode)) {
				this.ui.$howDidYouHear.prop("disabled", false);
			} else {
				this.ui.$howDidYouHear.prop("disabled", true);
			}
		},
		formatPhoneNumber: function () {
			var $target = this.ui.$phone;
			var phone = $target.val();
			var phoneCountry = this.ui.$phoneCountry.val();
			try {
				if (ObjectUtil.isNullOrEmpty(phone)) {
					$(this.ui.$phone).data('value', "");
				} else {
				    if (phoneCountry == "AU" && phone.toString()[0] == 0)
				    { phone = "0" + phone;}
					var phoneNumber = phoneUtil.parse(phone, phoneCountry);
					var formattedPhone = phoneUtil.format(phoneNumber);
					var outOfCountryPhone = phoneUtil.formatOutOfCountryCallingNumber(phoneNumber);
					this.ui.$phone.val(formattedPhone);
					$(this.ui.$phone).data('value', outOfCountryPhone);
				}
			} catch (e) {
                $(this.ui.$phone).data('value', phone);
				console.log("Format phone number error.");
			}
		},
		enableConfirmEmail: function() {
			if (!ObjectUtil.isNullOrEmpty(this.ui.$email.val())) {
				$('#txtConfirmEmail').attr('readonly', false);
			} else {
				$('#txtConfirmEmail').attr('readonly', true);
			}
		},
		getCustomerLeadSelectedBrochures: function (brochureSignupId) {

			var customerLeadBrochures = new CustomerLeadBrochureCollection(),
				$selectedBrochures = $('.brochureCheckboxes input[type=\'checkbox\']:checked');

			for (var i = 0, len = $selectedBrochures.length; i < len; i++) {
				var obj = $selectedBrochures[i];
				var id = $(obj).data('id');
				var brCode = $(obj).data('brcode');
				var brTitle = $(obj).data('brtitle');

				var customerLeadBrochure = new CustomerLeadBrochureModel();
				customerLeadBrochure.set({ BrochureCode: brCode, BrochureTitle: brTitle, BrochureId: id, BrochureSignupId: brochureSignupId });
				customerLeadBrochures.push(customerLeadBrochure);
			}
			return customerLeadBrochures;
		},
		submitLead: function (brochureSignupId) {
			var customerLeadRequestModel = new CustomerLeadRequestModel();
			customerLeadRequestModel.set('currentItemId', App.siteSettings.currentItemId);
			customerLeadRequestModel.set('formType', "RAB");
			customerLeadRequestModel.set('firstName', this.ui.$firstName.val());
			customerLeadRequestModel.set('lastName', this.ui.$lastName.val());
			customerLeadRequestModel.set('email', this.ui.$email.val());
			customerLeadRequestModel.set('phone', this.ui.$phone.val());
			customerLeadRequestModel.set('isTravelAgent', this.ui.$iAmAgent.is(':checked'));
			customerLeadRequestModel.set('workingWithTravelAgent', this.ui.$workingWithAgent.is(':checked'));
			customerLeadRequestModel.set('sourceUrl', document.location.href);
			customerLeadRequestModel.set('requestSource', '');
			customerLeadRequestModel.set('promoName', '');
			customerLeadRequestModel.set('validatePhoneNumber', false);
			customerLeadRequestModel.set('customerLeadBrochures', this.getCustomerLeadSelectedBrochures(brochureSignupId));
			customerLeadRequestModel.set('optInEmail', this.ui.$optInEmail.is(":checked"));
			customerLeadRequestModel.set('agentWithMoreTravelers', this.ui.$agentWithMoreTravelers.is(":checked"));
			customerLeadRequestModel.set('brochurePageType', this.$el.data("brochuretype"));

			var errorMessages = customerLeadRequestModel.validate();
			if (errorMessages.length == 0) {
				if (!ObjectUtil.isNullOrEmpty(customerLeadRequestModel.get('currentItemId'))) {
					CustomerLeadService.SubmitLead(customerLeadRequestModel);
					console.log("Brochure customerLeadRequestModel sent");
				} else{
					console.log("currentItemId is null");
				}
			} else {
				console.log("error sending lead");
				console.log(errorMessages);
			}
		},
		resetFormOnSubmit: function () {
			if ($('#brochuresThankYouRegion').html().length > 0) {

				//clear the form text fields
				$('#brochureRequestForm input:text').val('');

				this.setDefaultCountry();

				//reset how you heard about Collette
				var $ddlHowDidYouHear = this.$el.find('#ddlHowDidYouHear');
				PrettySelectUtil.setValue('', $ddlHowDidYouHear);

				//reset select brochure message and complete your order button message
				this.updateBrochureMessage(0);

				this.messagesRegion.close();
				$('#brochuresThankYouRegion').html('');
				this.brochuresThankYouRegion.close();

				//reset selected brochures
				$('.brochure-checkbox.select.checked').removeClass('checked');
				$('.brochureCheckboxes input[type=\'checkbox\']:checked').removeAttr('checked');

				//reset checked boxes
				$('#brochureRequestForm .checkbox-list input[type="checkbox"]').prop('checked', false);

				//if it is the US site check off opt in for email
				if (App.siteIds.Collette === App.siteSettings.siteId && App.siteSettings.siteLanguage === "en") {
					this.ui.$optInEmail.prop('checked', true);
				}

				//show the submit button
				var button = this.ui.$brochureButton;
				if (button != null) {
					this.ui.$brochureButton.prop("disabled", false);
					this.ui.$brochureButton.show();
				}
			}
		},

		sendToDataLayer() {

			let formData = new Object();

			formData.location = window.location.href;
			formData.formname = 'Newsletter Promotion - Order Brochures Page';
			formData.firstName = this.ui.$firstName.val();
			formData.lastName = this.ui.$lastName.val();
			formData.email = this.ui.$email.val();
			formData.address1 = this.ui.$address.val();
			formData.city = this.ui.$city.val();
			formData.state = this.ui.$state.val();
			formData.country = this.ui.$country.val();
			formData.zip = this.ui.$zip.val().toUpperCase();
			formData.phone = this.ui.$phone.data('value');
			if (this.ui.$title.find(':selected')) {
				formData.title = this.ui.$title.find(':selected').data('title');
			}
			var promotionCode = this.ui.$promoCode.val();
			if (promotionCode !== "") {
				formData.promotionCode = (promotionCode.length > 5) ? promotionCode.substring(0, 4) : promotionCode;
			}
			let hdHear = document.getElementById('ddlHowDidYouHear') ?
				document.getElementById('ddlHowDidYouHear').nextSibling.children[0].firstElementChild.textContent : "";
			if (hdHear !== "" && hdHear !== "Select one of the following") {
				formData.howDidYouHear = hdHear;
			}

			if (this.ui.$optInEmail.is(':checked'))formData.optInEmail = this.ui.$optInEmail.is(':checked');
			if (this.ui.$optInMail.is(':checked'))formData.optInMail = this.ui.$optInMail.is(':checked');
			if (this.ui.$optInPhone.is(':checked'))formData.optInPhone = this.ui.$optInPhone.is(':checked');
			if (this.ui.$iAmAgent.is(':checked'))formData.iAmAgent = this.ui.$iAmAgent.is(':checked');
			if (this.ui.$workingWithAgent.is(':checked'))formData.workingWithAgent = this.ui.$workingWithAgent.is(':checked');
			if (document.querySelector('.brochure-details p')) {
				formData.brochuresname = document.querySelector('.brochure-details p').innerText;
			}
			console.log(JSON.stringify(formData));
			formData.referrerUrl = document.referrer;
			DataLayerUtil.SitecoreFormPush(formData);
        }
	});
	return BrochureOrderFormLayout;
});