define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'moment',
	'app',
	'util/DateUtil',
	'util/TourDetailUtil',
	'util/OffersUtil',
    'util/ObjectUtil',
	'event.aggregator',
	'text!templates/tour/tourDates/tourDateTemplateCompact.html',
	'models/tour/tourDates/TourDateModel',
	'models/tour/availableOffers/AvailableOffersModel'
], function ($, _, Backbone, Marionette, moment, App, DateUtil, TourDetailUtil,
	OffersUtil, ObjectUtil, EventAggregator, TourDateTemplate, TourDateModel, AvailableOffersModel) {
	var TourDateView = Backbone.Marionette.ItemView.extend({
		model: TourDateModel,
		tagName: "li",
		template: Backbone.Marionette.TemplateCache.get(TourDateTemplate),
		events: {
			'click a[data-itinerary]': 'showItinerary'
		},
		initialize: function () {
			this.validateDiscount();
		},
		validateDiscount: function () {
			if (this.model.get("discount") == null) {
				return;
			}
			if (!OffersUtil.isOfferValid(this.model.get("discount"))) {
				this.model.set("discount", null);
			}
		},

		showItinerary: function (event) {
			var self = this;			
			if (App.TourDetails.DetailsExist) {
				var tourId = "{" + self.model.get("tourId").toUpperCase() + "}";
				var defaultFlightParameters = { tourId: tourId, itineraryNeoId: self.model.get("packageNeoId"), itineraryId: self.model.get("id") };
				EventAggregator.trigger('showItineraryFromDepartures', defaultFlightParameters);
			} else {				
				console.log("Tour details request doesn't complete. Please wait");
			}
			//EventAggregator.trigger("", params);
		},

		onRender: function () {
			var outerscope = this;
			var classStr = "date";
			var discount = this.model.get("discount");
			if (this.model.get("isSoldOut")) {
				classStr += " muted";
			}
			if (discount != null) {
				classStr += " " + discount.offerWebsiteType.tourDateRowCssClass;
				outerscope.setDisclaimerText(discount);
			}
			this.$el.attr("class", classStr);
		},
		setDisclaimerText: function (discount) {
			var offer = new AvailableOffersModel(discount);

			var vanityCode = offer.vanityCode();
			if (vanityCode) {
				vanityCode = "\"" + vanityCode + "\" ";
			}

			var offerType = offer.get('offerWebsiteType');
			var disclaimerTemplate = OffersUtil.getOfferDisclaimer(offerType.id);

			var vanityStartDate = offer.vanityStartDate();
			var vanityFirstDate = moment(vanityStartDate).format(App.siteSettings.dateFormat);

			var vanityEndDate = offer.vanityEndDate();
			var vanityLastDate = moment(vanityEndDate).format(App.siteSettings.dateFormat);
			if (disclaimerTemplate) {
				disclaimerTemplate = disclaimerTemplate.replace("@@offercode@@", vanityCode);
				disclaimerTemplate = disclaimerTemplate.replace("@@offerstartdate@@", vanityFirstDate);
				disclaimerTemplate = disclaimerTemplate.replace("@@offerenddate@@", vanityLastDate);
			}
			if (offerType.name == "Seasonal Offer") {
				$("#seasonal-disclaimer").text(disclaimerTemplate);
			}
			if (offerType.name == "Early Booking Bonus") {
				$("#ebb-disclaimer").text(disclaimerTemplate);
			}
		},
		templateHelpers: function () {
			var outerScope = this;
			var startDate = this.model.get("startDate");
			var endDate = this.model.get("endDate");
			var discount = this.model.get("discount");
			var discountExists = discount != undefined && discount.offerRate > 0;
			var isHotDealDate = discountExists && OffersUtil.isHotDeal(discount);
			var isEBB = discountExists && OffersUtil.isEBB(discount);
			var isSeasonalOfferDate = discountExists && OffersUtil.isSeasonal(discount);
			var aaaDiscount = this.model.get("aaaDiscount");
			return {
				isHotDealDate: isHotDealDate,
				isBooking: App.isBooking,
				isCaa: App.siteSettings.siteLanguage === "en-TT",
				isBookingEngineAvailable: App.siteSettings.isBookingEngineAvailable,
				startDateHidden: startDate,
				endDateHidden: endDate,
				dateText: DateUtil.getMomentDateType(startDate).format('ll') + ' - ' + DateUtil.getMomentDateType(endDate).format('ll'),

				soldOut: outerScope.model.get("isSoldOut"),
				call: outerScope.model.get("callForDetails"),
				hideBookNow: outerScope.model.get("hideBookNow"),
				guaranteed: outerScope.model.get("guaranteedDate"),
				seatsRemainingText: TourDetailUtil.getSeatsLeftText(outerScope.model.get("numberOfSeatsRemaining")),

				soldOutText: App.dictionary.get("tourRelated.Booking.SoldOut"),
				bookNowText: App.dictionary.get("tourRelated.Buttons.BookNow"),
				viewItineraryText: App.dictionary.get("tourRelated.Buttons.ViewItinerary"),
				selectedItineraryText: App.dictionary.get("tourRelated.Buttons.SelectedItinerary"),
				guaranteedText: App.dictionary.get("tourRelated.FreeFormText.Guaranteed"),

				showAlert: discountExists && (isHotDealDate),
				showAlertSubtle: discountExists && (isSeasonalOfferDate || isEBB),
				itineraryText: App.dictionary.get("TourRelated.TourDetails.Buttons.InteraryButton", "Itinerary"),
				bookText: App.dictionary.get("TourRelated.TourDetails.Buttons.BookButton", "Book"),
				isAgent: function () {
					if ($('body').data('isagent') === undefined) {
						return false;
					} else {
						return ($('body').data('isagent').toLowerCase() === "true");
					}
				},
				showGuaranteedForConsumers: function () {
					return App.siteSettings.showGuaranteedToConsumers;
				},
				callText: function () {
					var phone = $('.phone_booking .desktop a').text();
					if (phone) {
						var callForDetails = App.dictionary.get("tourRelated.FreeFormText.CallForDetails", "Call {0} for details");
						var phoneLink = '<a href="tel:' + phone + '">' + phone + '</a>';

						return callForDetails.replace("{0}", phoneLink);
					}
					return "";
				},
				badgeCssClass: function () {
					if (discountExists) {
						return discount.offerWebsiteType.badgeCssClass;
					}
					return "";
				},
				modalWindowName: function () {
					if (isHotDealDate) {
						return "hot-deal-modal";
					}

					if (App.siteSettings.useSpecialOfferModalInDatePicker) {
						return "special-offers-modal";
					}

					if (isSeasonalOfferDate) {
						return "seasonal-offer-modal";
					}
					return "";
				},
				badgeStyle: function () {
					if (isHotDealDate) {
						return "cursor:default";
					}
					return "";
				},
				offerTypeName: function () {
					if (discountExists) {
						return discount.offerWebsiteType.name;
					}
					return "";
				},
				badgeIconCssClass: function () {
					if (discountExists) {
						return discount.offerWebsiteType.badgeIconCssClass;
					}
					return "";
				},
				alertSubtleText: function () {
					if (isSeasonalOfferDate || isEBB) {
						return App.dictionary.get("tourRelated.FreeFormText.OfferExpires") + " " + OffersUtil.getOfferExpirationDate(discount);
					}
					return "";
				},
				showCrossedOut: function () {
					// We show crossed out only if an offer is automatically applied
					// Hot Deals, AAA only
					// Season discounts as well - TMB: Ticket Number 165787
					if (discountExists && (isHotDealDate || isSeasonalOfferDate || isEBB)) {
						return true;
					}

					if (aaaDiscount != undefined && aaaDiscount.offerRate > 0) {
						return true;
					}

					return false;
				},
				priceText: function () {
					var price = outerScope.model.get("price");

					if (discountExists && (isHotDealDate || isEBB || isSeasonalOfferDate)) {
						price -= discount.offerRate;
					}

					if (aaaDiscount != undefined) {
						price -= aaaDiscount.offerRate;
					}

					return TourDetailUtil.getPriceText(price);
				},
				crossedOutPriceText: function () {
					var price = outerScope.model.get("price");

					if (aaaDiscount != undefined) {
						return TourDetailUtil.getPriceText(price) + " " + App.dictionary.get('tourRelated.FreeFormText.WithOutAAA');
					}
					return TourDetailUtil.getPriceText(price);
				},
				isClientBaseBooking: function () {
				    var clientBaseData = $('#clientBaseData').val();
				    if (!ObjectUtil.isNullOrEmpty(clientBaseData)) {
				        return true;
				    }
				    return false;
				}
			}
		}
	});
	// Our module now returns our view
	return TourDateView;
});
