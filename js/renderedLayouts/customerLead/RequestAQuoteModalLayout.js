define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'app',
	'event.aggregator',
	'util/objectUtil',
	'util/seoTaggingUtil',
	'models/customerLead/CustomerLeadRequestModel',
	'views/validation/SuccessView',
	'views/validation/ErrorView',
	'services/customerLeadService',
	'extensions/marionette/views/RenderedLayout',
	'util/bingTrackingUtils',
	'util/criteoTrackingUtils',
	'util/dataLayerUtil'
], function ($, _, Backbone, Marionette, App, EventAggregator, ObjectUtil, SeoTaggingUtil, CustomerLeadRequestModel, SuccessView, ErrorView, CustomerLeadService, RenderedLayout, BingTrackingUtils, CriteoTrackingUtils, DataLayerUtil) {
	var RequestAQuoteModalLayout = RenderedLayout.extend({
		el: '#request-quote-modal',
		defaults: {
			tourId: ''
		},
		events: {
			'click .submitCustomerLeadBtn': 'submitLead'
		},
		ui: {
			'$firstName': '#first-name-RAQ',
			'$lastName': '#last-name-RAQ',
			'$email': '#email-RAQ',
			'$phone': '#phone-RAQ',
			'$isTravelAgent': '#is-travel-agent-RAQ',
			'$workingWithTravelAgent': '#is-with-travel-agent-RAQ',
			'$agentWithMoreTravelers': '#is-traveling-with-more-travelers-RAQ',
			'$tourImage': '#request-quote-tour-img',
			'$tourTitle': '#request-quote-tour-title',
			'$tourSummary': '#request-quote-tour-summary',
			'$optInEmail': '#opt-in-email-RAQ',
			'$nextAvailableDate': '.date-raq'
		},
		initialize: function (options) {
			this.tourId = options.tourId;

			if (ObjectUtil.isNullOrEmpty(options.tourId)) {
				$('#request-quote-tour-section').hide();
			} else {
				$('#request-quote-tour-section').show();
			}


			//clear modal
			this.ui.$firstName.val('');
			this.ui.$lastName.val('');
			this.ui.$email.val('');
			this.ui.$phone.val('');
			this.ui.$isTravelAgent.attr('checked', false);
			this.ui.$workingWithTravelAgent.attr('checked', false);
			this.ui.$agentWithMoreTravelers.attr('checked', false);
			this.ui.$optInEmail.attr('checked', false);
			this.ui.$tourImage.attr('src', options.tourImage);
			this.ui.$tourTitle.html(options.tourTitle);
			this.ui.$tourSummary.html(options.tourSummary);

			// Use the ID on itinerary date to fetch selected tour date
			var newTourDate = $('#pdp-itinerary-date').text();
			this.ui.$nextAvailableDate.html(newTourDate);

			if (!App.siteSettings.showIsAgentCheckboxesOnRequestAQuote) {
				$('#request-quote-modal #travel-agent-checkboxes').hide();
			}

			$('#request-quote-modal .customerLeadFormMessage').html('');
			$('#request-quote-modal .customerLeadForm').show();
			$("#formTitle").hide();
			//define where the error box will live
			App.addRegions({
				messagesRegion: '#request-quote-modal .customerLeadFormMessage'
			});

			App.addRegions({
				formRegion: '#request-quote-modal .customerLeadForm'
			});

			EventAggregator.on('customerLeadSubmitSuccess', function () {
				$('#request-quote-modal .customerLeadForm').hide();
				$("#formTitle").hide();
				var successView = new SuccessView(["Thank you !!!"]);
				App.messagesRegion.show(successView);
			});

			App.messagesRegion.close();


		},
		sendToDataLayer: function (customerdata) {
			customerLeadObj = new Object();
			if (this.ui.$tourTitle[0]) {
				customerLeadObj.tourName = this.ui.$tourTitle[0].textContent;
			}
			customerLeadObj.firstName = customerdata.attributes.firstName;
			customerLeadObj.lastName = customerdata.attributes.lastName;
			customerLeadObj.email = customerdata.attributes.email;
			customerLeadObj.phone = customerdata.attributes.phone;
			customerLeadObj.formName = "Request a Quote";
			customerLeadObj.formType = "Customer Lead - Avoya";
			customerLeadObj.location = customerdata.attributes.sourceUrl;
			customerLeadObj.workingWithTravelAgent = customerdata.attributes.workingWithTravelAgent;
			customerLeadObj.isTravelAgent = customerdata.attributes.isTravelAgent;
			DataLayerUtil.SitecoreFormPush(customerLeadObj);
		},

		submitLead: function () {
		
		
			var customerLeadRequestModel = new CustomerLeadRequestModel();
			customerLeadRequestModel.set('currentItemId', App.siteSettings.currentItemId);
			customerLeadRequestModel.set('formType', "RAQ");
			customerLeadRequestModel.set('firstName', this.ui.$firstName.val());
			customerLeadRequestModel.set('lastName', this.ui.$lastName.val());
			customerLeadRequestModel.set('email', this.ui.$email.val());
			customerLeadRequestModel.set('phone', this.ui.$phone.val());
			if (App.isUKSite || App.isThomasCookSite) {
				customerLeadRequestModel.set('optInEmail', this.ui.$optInEmail.is(":checked"));
			} else {
				customerLeadRequestModel.set('optInEmail', false);
			}
			
			if (App.siteSettings.showIsAgentCheckboxesOnRequestAQuote) {
				customerLeadRequestModel.set('isTravelAgent', this.ui.$isTravelAgent.is(":checked"));
				customerLeadRequestModel.set('workingWithTravelAgent', this.ui.$workingWithTravelAgent.is(":checked"));
				customerLeadRequestModel.set('agentWithMoreTravelers', this.ui.$agentWithMoreTravelers.is(":checked"));
			} else {
				customerLeadRequestModel.set('isTravelAgent', false);
				customerLeadRequestModel.set('workingWithTravelAgent', false);
				customerLeadRequestModel.set('agentWithMoreTravelers', false);
			}

			customerLeadRequestModel.set('sourceUrl', document.location.href);
			customerLeadRequestModel.set('requestSource', '');
			customerLeadRequestModel.set('promoName', '');
			customerLeadRequestModel.set('tourId', this.tourId);

			//get selected tour date on tour detail page
			//Pete note - this functionality relies on that #dates_section radio button and seems entirely missing.
			//Leaving it in case of unintended consequences. 
			var selectedPackageDate = $('#dates_section input:radio[name="date"]:checked');
			if (!ObjectUtil.isNullOrEmpty(selectedPackageDate)
				&& !ObjectUtil.isNullOrEmpty(selectedPackageDate.attr("startdate"))
				&& selectedPackageDate.attr("startdate").split(' ').length > 0) {

				var dateStr = selectedPackageDate.attr("startdate").split(' ')[0];
				customerLeadRequestModel.set('tourDepartureDate', dateStr);
			}

			

			var errorMessages = customerLeadRequestModel.validate();
			if (errorMessages.length == 0) {
				//remove error view and continue with default behavior
				App.messagesRegion.close();

				if (!ObjectUtil.isNullOrEmpty(customerLeadRequestModel.get('currentItemId'))) {
					CustomerLeadService.SubmitLead(customerLeadRequestModel);
					BingTrackingUtils.trackBingViewJson({ 'ec': 'Quote', 'ea': 'Request', 'el': 'GetQuote', 'ev': '1' });

					if (App.siteSettings.templateId == "{6308F77F-B718-42EF-B7B7-79B4A1AC9144}") {
						if (App.siteSettings.siteLanguage == "en" || App.siteSettings.siteLanguage == "en-CA") {
							CriteoTrackingUtils.trackCriteoPixel(App.siteSettings.criteoPixelId, customerLeadRequestModel.get('email'));
						}
					}
					$('#request-quote-modal .customerLeadForm').hide();
					$("#formTitle").hide();
					var successView = new SuccessView([App.dictionary.get('common.Misc.ThankYou')]);
					App.messagesRegion.show(successView);
					try {
						this.sendToDataLayer(customerLeadRequestModel);
					} catch (e) { console.log(e);}

				} else {
					console.log("currentItemId is null");
				}
			} else {
				var errorView = new ErrorView(errorMessages);
				App.messagesRegion.show(errorView);
			}
		}
	});
	return RequestAQuoteModalLayout;
});