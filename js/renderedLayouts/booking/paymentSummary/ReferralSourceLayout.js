define([
'jquery',
'underscore',
'backbone',
'marionette',
'app',
'event.aggregator',
'util/objectUtil',
'util/timeoutUtil',
'util/validationUtil',
'util/taxonomy/taxonomyDomUtil',
'util/dataLayerUtil',
'services/bookingService',
'views/validation/SuccessView',
'views/validation/ErrorView'
], function ($, _, Backbone, Marionette, App, EventAggregator, ObjectUtil, TimeoutUtil, ValidationUtil, TaxonomyDomUtil, DataLayerUtil, BookingService, SuccessView, ErrorView) {
	var ReferralSourceLayout = Backbone.Marionette.Layout.extend({
		el: '.referral_info',
		events: {
			'blur #txtPromotionCode': 'promotionCodeTextChange',
			'keyup #txtMemberBenefitCode': 'txtMemberBenefitCodeChange',
			'click #btnSubmitPromoCode': 'savePromotionCode'
		},
	
		regions: {
			
			'offersThankYouMessagesRegion': '.offersThankYouMessagesRegion',
			'offersErrorMessagesRegion': '.offersErrorMessagesRegion'
		},
		ui: {
			'$txtPromotionCode': '#txtPromotionCode',
			'$txtMemberBenefitCode': '#txtMemberBenefitCode'
		},
		initialize: function () {
			var outerScope = this;
			EventAggregator.on('submitRoomingAndTravelersComplete', function () {
				outerScope.offersErrorMessagesRegion.close();
				$(outerScope.ui.$txtPromotionCode).val("");
				outerScope.promotionCodeTextChange();
				outerScope.setTravelersDropDown();
			});

			EventAggregator.on('PaymentFormValidateComplete', function() {
				outerScope.saveReferralSource();
			});

			outerScope.memberBenefitCodeText = App.dictionary.get('tourRelated.Booking.Referral.MemberBenefitCode');
			outerScope.sourceOfferCodeText = App.dictionary.get('tourRelated.Booking.Referral.SourceOfferCode');
			outerScope.thankYouAllCodesAcceptedText = App.dictionary.get('tourRelated.Booking.Referral.ThankYouAllCodesAccepted');
			outerScope.enterACodeText = App.dictionary.get('tourRelated.Booking.Referral.Validations.EnterACode');

			outerScope.thankYouText = App.dictionary.get('tourRelated.Booking.Referral.ThankYou');//tt
			outerScope.promoCodeAlreadyEnteredText = App.dictionary.get('tourRelated.Booking.Referral.Validations.PromoCodeAlreadyEntered');//tt
			outerScope.promoCodeAppliedText = App.dictionary.get('tourRelated.Booking.Referral.Validations.PromoCodeApplied');//tt
			outerScope.promoCodeGreaterOrLessText = App.dictionary.get('tourRelated.Booking.Referral.Validations.PromoCodeGreaterOrLess');//tt
			outerScope.promoCodeInvalidText = App.dictionary.get('tourRelated.Booking.Referral.Validations.PromoCodeInvalid');//tt
			outerScope.promoCodeNoTourOffersText = App.dictionary.get('tourRelated.Booking.Referral.Validations.PromoCodeNoTourOffers');//tt
			outerScope.systemErrorText = App.dictionary.get('tourRelated.Booking.Referral.Validations.SystemError');//tt
			
			
		},
		timeoutSaveUtil: new TimeoutUtil(),
		promotionCodeTextChange: function (e) {
			this.offersErrorMessagesRegion.close();
		},
		savePromotionCode: function (e) {
			e.preventDefault();
			var outerScope = this;
			outerScope.offersErrorMessagesRegion.close();
			outerScope.offersThankYouMessagesRegion.close();

			var systemErrorMessage = "Sorry there was an error.";
			var $promoCodeObj = $(this.ui.$txtPromotionCode);
			
			var promoCode = $promoCodeObj.length > 0 ? $promoCodeObj.val() : '';

			var $memberBenefitCodeObj = $(this.ui.$txtMemberBenefitCode);
			var memberBenefitCode = $memberBenefitCodeObj.length > 0 ? $memberBenefitCodeObj.val() : '';
			var aarpMembershipId = '',
				aarpMemberLastName = '';

			
			if (ObjectUtil.isNullOrEmpty(promoCode) && ObjectUtil.isNullOrEmpty(memberBenefitCode))
			{
				this.offersErrorMessagesRegion.show(new ErrorView([outerScope.enterACodeText]));
				return;
			}


			if (!ObjectUtil.isNullOrEmpty(memberBenefitCode)  ) {

				if (memberBenefitCode.length < 3) {
					//outerScope.promoCodeInvalidTex
					//"Please enter a valid member benefit code."
					var message = this.promoCodeInvalidText.replace(/@@promoname@@/gi, this.memberBenefitCodeText);
					this.offersErrorMessagesRegion.show(new ErrorView([message]));
					return;
				}

				if (this.isAARPMemberCode(memberBenefitCode) == true) {
					aarpMemberLastName = this.getSelectedAARPMemberLastName();
					aarpMembershipId = $(this.ui.$txtAARPMembershipId).val();
					if (this.validateAARPInfo(aarpMembershipId, aarpMemberLastName) == false) {
						//aarp validation error
						return;
					}
				}
			} 

			this.offersErrorMessagesRegion.close();

			if (!ObjectUtil.isNullOrEmpty(promoCode)) {

				if (promoCode.length < 4 || (promoCode.toLowerCase().indexOf("aarp") != -1)) {
					var message = this.promoCodeInvalidText.replace(/@@promoname@@/gi, this.sourceOfferCodeText);
					this.offersErrorMessagesRegion.show(new ErrorView([message]));
					///promo code error
					return;
				} 
			}

			if (this.isAARPMemberCode(memberBenefitCode) == true) {
				this.changeSubmitButtonState(true);
			}

			BookingService.summaryAndPayment_ApplyPromoCodeDiscount(promoCode, memberBenefitCode, aarpMembershipId, aarpMemberLastName)
				.done(function (response) {
					outerScope.changeSubmitButtonState(false);
					outerScope.offersErrorMessagesRegion.close();
					var thankYouMessages = [];
					var errorMessages = [];
					var bookingResponse = JSON.parse(response.d);
					if (bookingResponse == null) {


						outerScope.offersErrorMessagesRegion.show(new ErrorView([systemErrorMessage]));
						console.log("Error saving source/offer:" + promoCode);
						return;
					}
					var promoCodeErrorFound = false,
						memberBenefitCodeErrorFound = false;

					if (!ObjectUtil.isNullOrEmpty(promoCode)) {
						if (ObjectUtil.isNullOrEmpty(bookingResponse.addPromotionCodeResponse) || ObjectUtil.isNullOrEmpty(bookingResponse.addPromotionCodeResponse.offerResponseCode)) {
							
							//Sorry could not add your source/offer code due to system error;
							var msg = outerScope.getAddOfferResponseMessage(outerScope.sourceOfferCodeText, 0);
							errorMessages.push(msg);
							promoCodeErrorFound = true;
						} else {
							console.log("Add Source/Offer message:" + bookingResponse.addPromotionCodeResponse.message);
							if (bookingResponse.addPromotionCodeResponse.offerApplied === false || bookingResponse.addPromotionCodeResponse.success === false) {
								var message = outerScope.getAddOfferResponseMessage(outerScope.sourceOfferCodeText, bookingResponse.addPromotionCodeResponse.offerResponseCode);
								errorMessages.push(message);
								promoCodeErrorFound = true;
							} else {
								
								var thankyou = outerScope.thankYouText.replace(/@@promoname@@/gi, outerScope.sourceOfferCodeText);
								thankYouMessages.push(thankyou);
							}
						}
					}

					if (!ObjectUtil.isNullOrEmpty(memberBenefitCode)) {
						if (ObjectUtil.isNullOrEmpty(bookingResponse.addMemberBenefitCodeResponse) || ObjectUtil.isNullOrEmpty(bookingResponse.addMemberBenefitCodeResponse.offerResponseCode)) {
                               //"Sorry could not add your member benefit code due to system error"
							var msg= outerScope.getAddOfferResponseMessage(outerScope.memberBenefitCodeText, 0);
							errorMessages.push(msg);
							memberBenefitCodeErrorFound = true;
						} else {

								console.log("Add Member benefit message:" + bookingResponse.addMemberBenefitCodeResponse.message);
							if (bookingResponse.addMemberBenefitCodeResponse.offerApplied === false || bookingResponse.addMemberBenefitCodeResponse.success === false) {
								var message = outerScope.getAddOfferResponseMessage(outerScope.memberBenefitCodeText,bookingResponse.addMemberBenefitCodeResponse.offerResponseCode);
								errorMessages.push(message);
								memberBenefitCodeErrorFound = true;
							} else {

								var thankyou = outerScope.thankYouText.replace(/@@promoname@@/gi, outerScope.memberBenefitCodeText);
								thankYouMessages.push(thankyou);
							}
						}
					}
				
					if (memberBenefitCodeErrorFound == false && promoCodeErrorFound == false) {
						outerScope.offersErrorMessagesRegion.close();
						App.Booking.Steps['summaryStep'].updateBookingInfo(response);
						App.Booking.Steps['summaryStep'].calculateStepPrice();
                       //all codes have been accepted
						var thankYouMessage = outerScope.thankYouAllCodesAcceptedText;
						outerScope.offersThankYouMessagesRegion.show(new SuccessView([thankYouMessage]));
                        $("#ddlHowDidYouHear").prop("disabled", true);
                        DataLayerUtil.SpecialOffers();
					} else {

						//clear errors
						outerScope.offersThankYouMessagesRegion.close();
						outerScope.offersErrorMessagesRegion.close();

						if (thankYouMessages.length > 0) {
							App.Booking.Steps['summaryStep'].updateBookingInfo(response);
							App.Booking.Steps['summaryStep'].calculateStepPrice();
							$("#ddlHowDidYouHear").prop("disabled", true);
                            outerScope.offersThankYouMessagesRegion.show(new SuccessView([thankYouMessages]));
                            DataLayerUtil.SpecialOffers();

						} 

						if (errorMessages.length > 0) {
							outerScope.offersErrorMessagesRegion.show(new ErrorView(errorMessages));
						} 
					}
				})
				.fail(function () {
					outerScope.offersErrorMessagesRegion.show(new ErrorView([systemErrorMessage]));
					outerScope.changeSubmitButtonState(false);
					console.log("error saving special offers:" + promoCode);
				});

			//clear form error messages
			$('.messagesRegion').html('');
		
		},
		saveReferralSource: function () {
			var $target = $("#ddlHowDidYouHear");

			//if we already have a promoCode in text field ignore drop down value
			if ($("#ddlHowDidYouHear").is(":disabled")) {
				console.log('Referral source ignored. We already have a promo code');
				return;
			}
			//get referralSourceCode from drop down
			var referralSourceCode = $target.find('option:selected').data('code');
			if (ObjectUtil.isNullOrEmpty(referralSourceCode)) {
				console.log('referral source has no code!!!');
				return;
			}

			BookingService.summaryAndPayment_ApplyDiscount(referralSourceCode)
			.done(function (response) {
				App.Booking.Steps['summaryStep'].updateBookingInfo(response);
				console.log("Referral source code saved.");
			})
			.fail(function () {

				console.log("Error referral code code.");
			});
		},
		changeSubmitButtonState: function (disable) {
			$('#btnSubmitPromoCode').prop("disabled", disable);
			disable ? $("body").addClass("loading") : $("body").removeClass("loading");

		},
		getAddOfferResponseMessage: function (promotionname, responseCode) {

			switch (responseCode) {

				case 0:
					{
						// "unknown error";
						return this.systemErrorText.replace(/@@promoname@@/gi, promotionname);
					}
				case 1:
					{
						// "Code already entered";
						return this.promoCodeAlreadyEnteredText.replace(/@@promoname@@/gi, promotionname);
					}
				case 2:
					{
						//"The code you entered is invalid"
						return this.promoCodeInvalidText.replace(/@@promoname@@/gi, promotionname);
					}

				case 3:
					{
						// "Code entered would give equal or lower discount than current code";
						return this.promoCodeGreaterOrLessText.replace(/@@promoname@@/gi, promotionname);
					}

				case 4:
					{
						// "No valid offers for this tour associated with this code";
						return this.promoCodeNoTourOffersText.replace(/@@promoname@@/gi, promotionname);
					}
				case 5:
					{
						// "Offer code was applied";
						return this.promoCodeAppliedText.replace(/@@promoname@@/gi, promotionname);
					}

				case 7:
					{
						// "Offer code was applied";
						return this.promoCodeAlreadyEnteredText.replace(/@@promoname@@/gi, promotionname);
					}
				
				default:
					{
						// "unknown error";
						return this.systemErrorText.replace(/@@promoname@@/gi, promotionname);
					}
			}
		},
		txtMemberBenefitCodeChange: function (e) {
			
			var outerScope = this;
			var promoCode = $(this.ui.$txtMemberBenefitCode).val();

			//if (!ObjectUtil.isNullOrEmpty(promoCode)) {
			var aarpMembershipSection = $('#aarpMembershipSection');
			if (promoCode.toLowerCase().indexOf("aarp") != -1) {

				outerScope.setTravelersDropDown();
					aarpMembershipSection.show();
					
				} else {
					aarpMembershipSection.hide();
					
				}
			//}
		},
		setTravelersDropDown: function () {
			console.log("setTravelersDropDown called");
			var travelers = [];
			App.Booking.travelers.each(function (traveler) {
				travelers.push({ id: traveler.get('lastName'), name: traveler.get('firstName') });
			});
			
			var $travelersDD = this.$el.find('#aarpMembers.old_select');
			TaxonomyDomUtil.setCustomOptions(travelers, $travelersDD);
			$travelersDD.trigger('update');
		},
		getSelectedAARPMemberLastName:function() {
			
			var $aarpMembersSelection = $("#aarpMembers");

			//get lastname from drop down
			var lastName = $aarpMembersSelection.find('option:selected').data('id');
			if (ObjectUtil.isNullOrEmpty(lastName)) {
				return '';
			}

			return lastName;
		},
		validateAARPInfo: function (aarpMembershipId, selectedLastName)
		{
			this.offersErrorMessagesRegion.close();
			var memberBenefitsErrorMessages = [];
				
				if (ObjectUtil.isNullOrEmpty(aarpMembershipId)) {
					memberBenefitsErrorMessages.push("Please enter AARP Membership ID");
				}

				if (ObjectUtil.isNullOrEmpty(selectedLastName)) {
					memberBenefitsErrorMessages.push("Please select AARP passenger");
				}

			if (memberBenefitsErrorMessages.length > 0) {
				this.offersErrorMessagesRegion.show(new ErrorView(memberBenefitsErrorMessages));
				return false;
			} 
				return true;
			
		},
		isAARPMemberCode:function(code) {
		if (code.toLowerCase().indexOf("aarp") != -1) {
			return true;
		} else {
			return false;
		}
	}
	});
	return ReferralSourceLayout;
});