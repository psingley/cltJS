define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'app',
		'extensions/marionette/views/RenderedLayout',
        'util/newsletterUtil',
        'cookie',
		'util/objectUtil',
		'util/dataLayerUtil',
        'event.aggregator'
], function ($, _, Backbone, Marionette, App, RenderedLayout, NewsletterUtil, cookie, ObjectUtil, DataLayerUtil, EventAggregator) {
	/**
	* @class hubspotFormLayout
	* @extends RenderedLayout
	*
    */
     
	var famFormLayout = RenderedLayout.extend({
		initialize: function () {
			this.setBrochureSignUpForm();
			this.setShareItineraryForm();
			this.prosessHubspotForms();
		},
		setBrochureSignUpForm: function () {
			if ($('#brochure-signup-modal').length) {

				$('.disableOnPageLoad').fadeOut();
				var brochureSignUpModalForm = document.getElementById('brochure-signup-modal');
				$('.enableViewOrPdfButton').fadeIn();

				$(".viewBrochureButton, .pdf-download").on("click", function (e) {
					if (!NewsletterUtil.isAnyModalOrPopupOpened()) {
						var cookieString = cookie.get('brochureSignUpModalShown');
						var cookieJsonValue;
						if (cookieString) {
							cookieJsonValue = JSON.parse(cookieString);
						}
						if (ObjectUtil.isNullOrEmpty(cookieJsonValue) || !cookieJsonValue.value) {
							$('#brochure-signup-modal').modal('show');
							brochureSignUpModalForm.getElementsByClassName('hubspot-form-container')[0].brochureurl = e.currentTarget.href;
							e.preventDefault();
						}
					}
				});

				EventAggregator.on('brochureOnSuccess', function (form) {
					if (brochureSignUpModalForm && (form.offsetParent()[0].id == brochureSignUpModalForm.getElementsByClassName('hubspot-form-container')[0].id)) {
						NewsletterUtil.setModalShownCookie('brochureSignUpModalShown');
						//setTimeout(function () {
						window.location.href = brochureSignUpModalForm.getElementsByClassName('hubspot-form-container')[0].brochureurl;
						//}, 5);
					}
					//$('#brochure-signup-modal').on('hide.bs.modal', function () {
					// window.location.href = brochureSignUpModalForm.getElementsByClassName('hubspot-form-container')[0].brochureurl;
					//});
				});
			}
		},

		setShareItineraryForm: function () {
			if ($('#share-itinerary-modal').length) {
				// populate hidden inputs with tour data on modal open
				$('#share-itinerary-modal').on('show.bs.modal', function () {
					$(this).find('input[name="tour_pdf"]').val($(this).data('baseurl') + $('#pdfLink').attr('href'));
					$(this).find('input[name="website_language"]').val($(this).data('language'));
					$(this).find('input[name="shared_tour_name"]').val($('.sub-nav-content > h1 > span.large').text());
					$(this).find('input[name="shared_tour_date"]').val($($('.tour-banner.is-active').find('.date')[0]).text());
				});
				// clear hidden inputs on modal close
				$('#share-itinerary-modal').on('hide.bs.modal', function () {
					$(this)
						.find('input[name="tour_pdf"], input[name="website_language"], input[name="shared_tour_name"], input[name="shared_tour_date"]')
						.val('');
				});
			} else {
				return;
			}
		},

		prosessHubspotForms: function () {
			var outerScope = this;

			var hubspotForms = $(".hubspot-form-container");
			_.each(hubspotForms, function (form) {
				try {
					var formOptions = outerScope.getFormOptions(form);

					if ($(form).hasClass("need-more-info-form")) {
						outerScope.createNeedMoreInfoForm(formOptions);
					} else if ($(form).hasClass("partner-broshure")) {
						var partnerOptions = outerScope.getPartnerOptions(form);
						outerScope.createPartnerBrosureForm(formOptions, partnerOptions);
					}
					else if ($(form).hasClass("hubspot-raqm")) {
						outerScope.createHubsporRaQMForm(formOptions);
					}
					else {
						outerScope.createForm(formOptions);
					}
				} catch (err) {
					console.log("Error: " + err + ".");
				}
			});
		},

		getValidation: function () {
			var emailConfirmationValidaitonText = App.dictionary.get('common.FormValidations.EmailsNotMatch');
			if (!emailConfirmationValidaitonText) {
				throw "Validation text is not set in dictionary";
			}

			var validation = {};
			validation.failed = this.getValidationHtml(emailConfirmationValidaitonText);
			validation.passed = this.getValidationHtml("");

			return validation;
		},

		getPartnerOptions: function (form) {
			var partnerOptions = {
				partner: $(form).data('partner'),
				partnerId: $(form).data('partnerid')
			};

			return partnerOptions;
		},

		getFormOptions: function (form) {
			var portalId = $(form).data('portalid');
			if (!portalId) {
				console.log("Form# " + $(form).data('formid') + " is missing PortalId");
				throw "portalId was not set";
			}

			var formId = $(form).data('formid');
			if (!formId) {
				console.log("formId was not set");
				throw "formId was not set";
			}

			var targetId = $(form).data('targetid');
			if (!targetId) {
				targetId = "[data-formid='" + formId + "']";
			}

			var options = {
				formId: formId,
				targetId: targetId,
				portalId: portalId,
				css: ''
			};

			return options;
		},

		getValidationHtml: function (messageBody) {
			// selector  .find(".hs_email > ul.hs-error-msgs > li > label").text();
			var confirmationHtml = '<ul class="hs-error-msgs inputs-list" style="display:block;" role="alert" data-reactid=".hbspt-forms-1.0:$0.1:$email.3">' +
				'<li data-reactid=".hbspt-forms-1.0:$0.1:$email.3.$0">' +
				'<label data-reactid=".hbspt-forms-1.0:$0.1:$email.3.$0.0">' +
				messageBody +
				'</label></li></ul>';

			return confirmationHtml;
		},

		createForm: function (formOptions) {
			formOptions.submitButtonClass = '';
			formOptions.onFormSubmit = function ($form) {
				DataLayerUtil.HubSpotFormPush(document.getElementById("hsForm_" + formOptions.formId).closest("form"));
			}
			this.genericFormFactory(formOptions);
			console.log("Create Form");
		},

		createNeedMoreInfoForm: function (formOptions) {
			formOptions.submitButtonClass = 'btn btn-primary';
			formOptions.onFormSubmit = function ($form) {
				var pageTitle = $('h1 .large').html() + ' ' + $('h1 .small').html();
				$('.hs_tour_title input').val(pageTitle);
				console.log("createNeedMoreInfoForm Submitted");
				DataLayerUtil.HubSpotFormPush(document.getElementById("hsForm_" + formOptions.formId).closest("form"))
			}
			this.genericFormFactory(formOptions);
	
		},

		createPartnerBrosureForm: function (formOptions, partnerOptions) {
			var outerScope = this;
			formOptions.submitButtonClass = 'btn btn-primary';
			formOptions.onFormSubmit = function ($form) {
				var partnerOptions = outerScope.getPartnerOptions($('.hubspot-form-container.partner-broshure'));
				$('input[name="partner_code"]').val('Partner-' + partnerOptions.partner + '-' + partnerOptions.partnerId);
				console.log('createPartnerBrosureForm');
				DataLayerUtil.HubSpotFormPush(document.getElementById("hsForm_" + formOptions.formId).closest("form"))
			};
			this.genericFormFactory(formOptions);
		},

		createHubsporRaQMForm: function (formOptions) {
			formOptions.submitButtonClass = "btn-default";
			formOptions.onFormSubmit = function ($form) {
				var tourTitle = $("#request-quote-tour-title").html();
				$('input[name="raq_tour_title"]').val(tourTitle);

				var tourUrl = "";
				if ($('.tour-details-2017').length > 0) {
					tourUrl = window.location.href;
					$('input[name="url"]').val(tourUrl);
					console.log("createHubsporRaQMForm submit");
				} else {
					var imgSrc = $('#request-quote-tour-img').attr('src');
					tourUrl = $('.request_quote_button[data-tourimage="' + imgSrc + '"]').prev().attr('href');
					console.log("createHubsporRaQMForm submit");
				}
			};

			this.genericFormFactory(formOptions);
		},

		_getElementBySelector: function ($form, selector) {
			var element = $form.find(selector)[0];
			return element;
		},

		toggleErrorMessage: function ($form, messageHtml) {
			var outerScope = this;
			//line with confirm email
			var confirmEmailDiv = outerScope._getElementBySelector($form, ".hs_confirm_email ");

			var errorDiv = outerScope._getElementBySelector($(confirmEmailDiv), ".hs-error-msgs");
			if (!errorDiv) {
				$(confirmEmailDiv).append(messageHtml); //if message was not yet shown, create it
			} else {
				$(errorDiv).replaceWith(messageHtml);  //if it was other messages before, replace with our
			}
		},

		validateInputs: function (submitButton, email, confirmEmail, validation, $form, e) {
			//if one of fields is not set, use default hubspot validation
			if (!$(confirmEmail).val() || !$(email).val()) {
				return false;
			}

			var outerScope = this;
			//disable submit button until email and its confirmation are equal
			if ($(email).val() === $(confirmEmail).val()) {
				$(submitButton).removeClass('disabled');
                outerScope.toggleErrorMessage($form, validation.passed);
                return true;
			} else {
				e.preventDefault();
				$(submitButton).addClass('disabled');
                outerScope.toggleErrorMessage($form, validation.failed);
                return false;
			}
		},
		genericFormFactory: function (formOptions) {
			if (!formOptions) {
				throw "Form parameters was not set!";
			}

			var outerScope = this;
			var validation = outerScope.getValidation();

			hbspt.forms.create({
				css: formOptions.css,
				portalId: formOptions.portalId,
				formId: formOptions.formId,
				target: formOptions.targetId,
				onFormReady: function ($form, ctx) {
					var email = outerScope._getElementBySelector($form, 'input[name="email"]');
					var confirmEmail = outerScope._getElementBySelector($form, 'input[name="confirm_email"]');
					var submitButton = outerScope._getElementBySelector($form, 'input[type="submit"]');
					$(confirmEmail).on('keyup', (function (e) {
						outerScope.validateInputs(submitButton, email, confirmEmail, validation, $form, e);

					}));
					$(email).on('keyup', (function (e) {
						outerScope.validateInputs(submitButton, email, confirmEmail, validation, $form, e);

					}));
					$(submitButton).on('click', (function (e) {
						
						if (!confirmEmail) {
							confirmEmail = email;
						}

						var isValid = outerScope.validateInputs(submitButton, email, confirmEmail, validation, $form, e); 
                        if (isValid && ($('#brochure-signup-modal').length)) {
                            EventAggregator.trigger('brochureOnSuccess',$form);
                        }
					}));
				},
				submitButtonClass: formOptions.submitButtonClass,
				onFormSubmit: formOptions.onFormSubmit
			});
		}
	});
	return famFormLayout;
});