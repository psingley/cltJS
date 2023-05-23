define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'app',
	'event.aggregator',
	'util/objectUtil',
	'models/customerLead/CustomerLeadRequestModel',
	'views/validation/SuccessView',
	'views/validation/ErrorView',
	'services/customerLeadService',
	'extensions/marionette/views/RenderedLayout',
	'util/seoTaggingUtil',
	'util/bingTrackingUtils',
	'util/dataLayerUtil'
], function ($, _, Backbone, Marionette, App, EventAggregator, ObjectUtil, CustomerLeadRequestModel, SuccessView, ErrorView, CustomerLeadService, RenderedLayout, SeoTaggingUtil, BingTrackingUtils, DataLayerUtil) {
	var TalkToAnExpertModalLayout = RenderedLayout.extend({
		el: '#talk-expert-modal',
		defaults: {
			formType: 'TTAE',
			floodlightCategory: 'talkt0',
			floodlightType: 'talkt0'
		},
		events: {
			'click .submitCustomerLeadBtn': 'submitLead'
		},
		ui: {
			'$firstName': '#first-name-TTAE',
			'$lastName': '#last-name-TTAE',
			'$email': '#email-TTAE',
			'$phone': '#phone-TTAE',
			'$isTravelAgent': '#is-travel-agent-TTAE',
			'$workingWithTravelAgent': '#is-with-travel-agent-TTAE',
			'$agentWithMoreTravelers': '#is-traveling-with-more-travelers-TTAE',
			'$optInEmail': '#opt-in-email-TTAE'
		},
		initialize: function(options) {
			if (!ObjectUtil.isNullOrEmpty(options.formType)) {
				this.formType = options.formType;
			} else {
				this.formType = "TTAE";
			}
			if (!ObjectUtil.isNullOrEmpty(options.floodlightType)) {
				this.floodlightType = options.floodlightType;
			} else {
				this.floodlightType = "TTAE";
			}
			if (!ObjectUtil.isNullOrEmpty(options.floodlightCategory)) {
				this.floodlightCategory = options.floodlightCategory;
			} else {
				this.floodlightCategory = "talkt0";
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

			if (!App.siteSettings.showIsAgentCheckboxesOnTTAE) {
				$('#talk-expert-modal #travel-agent-checkboxes').hide();
			}

			$('#talk-expert-modal .customerLeadFormMessage').html('');
			$('#talk-expert-modal .customerLeadForm').show();
			$("#formTitle").show();
			$('#talk-expert-modal img').unveil();

			//define where the error box will live
			App.addRegions({
				messagesRegion: '#talk-expert-modal .customerLeadFormMessage'
			});

			App.addRegions({
				formRegion: '#talk-expert-modal .customerLeadForm'
			});

			EventAggregator.on('customerLeadSubmitSuccess', function() {
				$('#talk-expert-modal .customerLeadForm').hide();
				var successView = new SuccessView(["Thank you !!!"]);
				App.messagesRegion.show(successView);
			});

			App.messagesRegion.close();

		},
		sendToDataLayer: function (customerdata) {
			console.log(this.formType);
			customerLeadObj = new Object();
			if (document.getElementById('pkg_title')) {
				customerLeadObj.tourName = document.getElementById('pkg_title').textContent;

			}
			customerLeadObj.firstName = customerdata.attributes.firstName;
			customerLeadObj.lastName = customerdata.attributes.lastName;
			customerLeadObj.email = customerdata.attributes.email;
			customerLeadObj.phone = customerdata.attributes.phone;
			switch (this.formType) {
				case "TTAE":
					customerLeadObj.formName = "Talk to an Expert";
					break;
				case "RAC":
					customerLeadObj.formName = "Request A Callback";
					break;
			}
			
			customerLeadObj.formType = "Customer Lead - Avoya";
			customerLeadObj.location = customerdata.attributes.sourceUrl;
			customerLeadObj.workingWithTravelAgent = customerdata.attributes.workingWithTravelAgent;
			customerLeadObj.isTravelAgent = customerdata.attributes.isTravelAgent;
			DataLayerUtil.SitecoreFormPush(customerLeadObj);
		},
		submitLead: function () {
		

			var customerLeadRequestModel = new CustomerLeadRequestModel();
			customerLeadRequestModel.set('currentItemId', App.siteSettings.currentItemId);
			customerLeadRequestModel.set('formType', this.formType);
			customerLeadRequestModel.set('firstName', this.ui.$firstName.val());
			customerLeadRequestModel.set('lastName', this.ui.$lastName.val());
			customerLeadRequestModel.set('email', this.ui.$email.val());
			customerLeadRequestModel.set('phone', this.ui.$phone.val());
			if (App.isUKSite || App.isThomasCookSite) {
				customerLeadRequestModel.set('optInEmail', this.ui.$optInEmail.is(":checked"));
			} else {
				customerLeadRequestModel.set('optInEmail', false);
			}

			if (App.siteSettings.showIsAgentCheckboxesOnTTAE) {
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

			var errorMessages = customerLeadRequestModel.validate();

			this.sendToDataLayer(customerLeadRequestModel);

			if (errorMessages.length == 0) {
				//remove error view and continue with default behavior
				App.messagesRegion.close();

				if (!ObjectUtil.isNullOrEmpty(customerLeadRequestModel.get('currentItemId'))) {
					CustomerLeadService.SubmitLead(customerLeadRequestModel);
					BingTrackingUtils.trackBingViewJson({ 'ec': 'Call', 'ea': 'Request', 'el': 'PhoneCall', 'ev': '1' });
					$('#talk-expert-modal .customerLeadForm').hide();
					$("#formTitle").hide();
					var successView = new SuccessView([App.dictionary.get('common.Misc.ThankYou')]);
					App.messagesRegion.show(successView);
					
				} else {
					console.log("currentItemId is null");
				}
			} else {

				var errorView = new ErrorView(errorMessages);
				App.messagesRegion.show(errorView);

			}
		}
	});
	return TalkToAnExpertModalLayout;
});