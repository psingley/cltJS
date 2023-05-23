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
	'text!templates/tourDetailPage/tourDates/tourDateTemplate.html',
	'models/tourDetailPage/tourDates/TourDateModel',
	'models/tour/availableOffers/AvailableOffersModel',
	'models/tourDetailPage/tourDates/TourDatesByYearModel',
	'event.aggregator',
	'util/ObjectUtil',
	'moment'
], function ($, _, Backbone, Marionette, moment, App, DateUtil, TourDetailUtil, OffersUtil, TourDateTemplate, TourDateModel, AvailableOffersModel, TourDatesByYearModel, EventAggregator, ObjectUtil, Moment) {
	var TourDateView = Backbone.Marionette.ItemView.extend({
		model: TourDatesByYearModel,
		template: Backbone.Marionette.TemplateCache.get(TourDateTemplate),
		className:"tour-banner",
        initialize: function () {},
		onShow:function() {
			var isSoldOut = this.model.get("isSoldOut");
            var packageDateId = this.model.get("id");

			var map = this.model.get('mapImage');
			if (map != null && map.url != null) {
				this.$el.attr('data-mapimageurl', map.url);
				this.$el.attr('data-mapimagealt', map.altTag);
            }

            this.$el.attr('data-packageneoid', this.model.get("packageNeoId"));
            this.$el.attr('data-packagendateneoid', this.model.get("neoId"));
           
            var newTourDetails = document.getElementById('newTourDetails');
            var nID = newTourDetails.getAttribute('data-tourSeriesId');
            this.$el.attr('data-neoId', nID);
      

			this.$el.attr('data-packagedateid', packageDateId);
			this.$el.attr('data-startDate', this.model.get("startDate"));
            this.$el.attr('data-endDate', this.model.get("endDate"));

			if (isSoldOut) {
				var div = this.$el;
				div.addClass('sold-out');
			}
            var events = this.model.get('events');
			if (events.length > 0) {
				if (events[0].title != null && events[0].title != '' && events[0].description != null && events[0].description != '') {
					this.$el.attr('data-eventstitle', events[0].title);
                    this.$el.attr('data-eventsdescription', events[0].description);
                  
				}
			}
			var discount = this.getDiscount();
			if (this.getDiscountExists()) {
				this.$el.attr('data-offersummary', this.getOfferText());
				var offerIconHtml = '';
				if (this.isHotDealDate()) {
					offerIconHtml =
						'<img src="https://i.gocollette.com/img/icons/fire-icon-gray-transparent.png" alt="Hot Deal Icon" />';
				} else {
					offerIconHtml = '<i class="' + discount.offerWebsiteType.badgeIconCssClass +'"></i>';
				}
				this.$el.attr('data-offerclasshtml', offerIconHtml);
				if (this.isSeasonalOfferDate() || this.isHotDealDate()) {
						this.$el.attr('data-offerdetails', discount.offerWebsiteType.summary);
				} else {
					this.$el.attr('data-offerdetails', discount.neoWebDescription);
				}
			}

			this.showMeals();
			this.showDayNights();
		},
		templateHelpers: function () {
			var outerScope = this;
			var startDate = this.model.get("startDate");
			var endDate = this.model.get("endDate");
			var discount = outerScope.getDiscount();
			var discountExists = outerScope.getDiscountExists();
			console.log("smallGroupTravel" + outerScope.model.get("smallGroupTravel"));
			return {
				dateText: DateUtil.getMomentDateType(startDate).format('ll') + ' - ' + DateUtil.getMomentDateType(endDate).format('ll'),
				soldOut: outerScope.model.get("isSoldOut"),
				call: outerScope.model.get("callForDetails"),
				guaranteed: outerScope.model.get("guaranteedDate"),
				seatsRemainingText: TourDetailUtil.getSeatsLeftText(outerScope.model.get("numberOfSeatsRemaining")),
				smallGroupTravel: outerScope.model.get("smallGroupTravel"),
				smallGroupTravelDescription: outerScope.model.get("smallGroupTravelDescription"),
				smallGroupTravelImageUrl: outerScope.model.get("smallGroupTravelImageUrl"),
				soldOutText: App.dictionary.get("tourRelated.Booking.SoldOut"),
				guaranteedText: App.dictionary.get("tourRelated.FreeFormText.Guaranteed"),
				isHotDeal: outerScope.isHotDealDate(),
				isSeasonalOffer: outerScope.isSeasonalOfferDate(),
				isPercentOffer: outerScope.isPercentOfferDate(),
				events: this.model.get("events"),
				callText: function () {
					var companyInfo = $("body").data("company");
					if (companyInfo && companyInfo.callCenterPhoneNumber) {
						var callForDetails = App.dictionary.get("tourRelated.FreeFormText.CallForDetails");
						var phoneLink = companyInfo.callCenterPhoneNumber;
						return callForDetails.replace("{0}", phoneLink);
					}
					return "";
				},
				isSeasonalOfferText: function () {
					var expirationDate = OffersUtil.getOfferExpirationDate(discount);
					if (outerScope.isSeasonalOfferDate() && !ObjectUtil.isNullOrEmpty(expirationDate)) {
						return App.dictionary.get("tourRelated.FreeFormText.OfferExpires") + " " + expirationDate;
					}
					return "";
				},
				showCrossedOut: function () {
					if (discountExists) {
						return true;
					}

					return false;
				},
				doublePriceText: function () {
					var price = outerScope.model.get("price");
					if (discountExists) {

						if (discount.doublePercentRate > 0) {
							price -= discount.doublePercentRate;
						} else {
							price -= discount.rate;
						}
						
					}

					return outerScope.getPriceText(price);
				},
				singlePriceText:function() {
					var singlePrice = outerScope.model.get("singlePrice");
					if (discountExists) {

						if (discount.singlePercentRate > 0) {
							singlePrice -= discount.singlePercentRate;
						} else {
							singlePrice -= discount.rate;
						}

					}

					return outerScope.getPriceText(singlePrice);
				},
				crossedOutDoublePriceText: function () {
					var price = outerScope.model.get("price");

					return outerScope.getPriceText(price);
				},
				crossedOutSinglePriceText: function () {
					var singlePrice = outerScope.model.get("singlePrice");

					return outerScope.getPriceText(singlePrice);
				},
				showOffer: this.getDiscountExists(),
				offerIcon: function() {
					if (discountExists) {
						return discount.offerWebsiteType.badgeIconCssClass;
					}
					return '';
				},
				offerText: function() {
					return outerScope.getOfferText();
				}
			}
		},
		showMeals: function() {
			var breakfast = this.model.get('totalBreakfast');
			var lunch = this.model.get('totalLunch');
			var dinner = this.model.get('totalDinner');

			if (breakfast > 0) {
				this.$el.attr('data-breakfast', breakfast);
			}

			if (lunch > 0) {
				this.$el.attr('data-lunch', lunch);
			}

			if (dinner > 0) {
				this.$el.attr('data-dinner', dinner);
			}
		},
		showDayNights: function() {
            var totalDays = this.model.get('totalDays');
			if (totalDays > 0) {
				this.$el.attr('data-days', totalDays);
			}
		},
		getPriceText: function (price) {
			if (App.siteSettings.toursUsePointsSystem) {
				return TourDetailUtil.formatNumberWithCommas(price) + App.siteSettings.pricePointSymbol;
			} else {
				return App.siteSettings.currencySymbol + TourDetailUtil.formatNumberWithCommas(price);
			}
		},
		getOfferText: function() {
			if (this.getDiscountExists()) {
				var text = '';
				var discount = this.getDiscount();

                if (discount.doublePercentRate > 0) {
                    var amount = discount.percentOff * 100;
                    text = 'Save ' + amount.toFixed() + '%';
				} else {
					text = 'Save ' + this.getPriceText(discount.rate);
				}
				/*if (this.isPercentOfferDate()) {
					text = saveUptoText + ' ' + discount.percentOff * 100 + '%';
				} else {
					text = saveUptoText + ' ' +  this.getPriceText(discount.rate);
				}*/
				return text;
			}
		},
		getDiscountExists: function() {
			var discount = this.getDiscount();
			var discountExists = discount != undefined && discount.rate > 0;
			return discountExists;
		},
		getDiscount:function() {
			return this.model.get('discount');
		},
		isHotDealDate:function() {
			return this.getDiscountExists() && OffersUtil.isHotDeal(this.getDiscount());
		},
		isSeasonalOfferDate: function() {
			return this.getDiscountExists() && OffersUtil.isSeasonal(this.getDiscount());
		},
		isPercentOfferDate: function() {
			return this.getDiscountExists() && OffersUtil.isPercentOff(this.getDiscount());
		}
	});
	// Our module now returns our view
     
	return TourDateView;
});