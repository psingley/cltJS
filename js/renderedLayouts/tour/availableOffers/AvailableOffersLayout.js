define([
'jquery',
'underscore',
'backbone',
'marionette',
'app',
'collections/tour/availableOffers/AvailableOffersCollection',
'text!templates/tour/availableOffers/availableOffersLayout.html',
'views/tour/availableOffers/EarlyBookingItemView',
'views/tour/availableOffers/SeasonalOfferItemView',
'views/tour/availableOffers/HotDealItemView'
], function ($, _, Backbone, Marionette, App, AvailableOffersCollection, AvailableOffersLayoutTemplate, EarlyBookingItemView, SeasonalOfferItemView, HotDealItemView) {
	var AvailableOffersLayout = Backbone.Marionette.Layout.extend({
		template: Backbone.Marionette.TemplateCache.get(AvailableOffersLayoutTemplate),
		templateHelpers: function() {
			return {
				availableOffersText: App.dictionary.get('tourRelated.FreeFormText.AvailableOffers'),
				currencyClass: App.siteSettings.currencyClass
			};
		},
		regions: {
			availableOffersComponent: "#available_offers_section_container",
			earlyBookingSection: "#earlyBookingBonus",
			additionalOffersSection: "#additionalOffersSection",
			hotDealsSection: "#hotDealsSection",
			seasonalOffersSection: "#seasonalOffersSection"
		},
		onShow: function () {
			if (this.collection != null && this.collection.length > 0) {
				this.showEarlyBooking(this.collection);
				this.showHotDeal(this.collection);
				this.showSeasonalOffer(this.collection);
			}
		},
		showEarlyBooking: function (collection) {
			var offerType = $('#available_offers_section_container').attr('data-earlyBookingType');
			if (offerType) {
				var earlyBookingOffers = collection.filterCurrentByOfferType(offerType);

				if (earlyBookingOffers.length > 0) {
					earlyBookingOffers.sortByField('endDate');

					this.earlyBookingSection.show(new EarlyBookingItemView({ model: earlyBookingOffers.first() }));
					this.showShowEarlyBookingRegion();
					this.showComponent();
				}
			}
		},
		showHotDeal: function (collection) {
			var offerType = $('#available_offers_section_container').attr('data-hotDealType');
			if (offerType) {
				var hotDeals = collection.filterCurrentByOfferType(offerType);

				if (hotDeals.length > 0) {
					this.hotDealsSection.show(new HotDealItemView({ model: hotDeals.first() }));
					this.showAdditionalOffersRegion();
					this.showComponent();
				}
			}
		},
		showSeasonalOffer: function (collection) {
			var offerType = $('#available_offers_section_container').attr('data-seasonalType');
			if (offerType) {
				var seasonalOffers = collection.filterCurrentByOfferType(offerType);

				if (seasonalOffers.length > 0) {
					this.seasonalOffersSection.show(new SeasonalOfferItemView({ model: seasonalOffers.first() }));
					this.showAdditionalOffersRegion();
					this.showComponent();
				}
			}
		},
		showShowEarlyBookingRegion: function () {
			$(this.regions.earlyBookingSection).show();
		},
		showAdditionalOffersRegion: function () {
			$(this.regions.additionalOffersSection).show();
		},
		showComponent: function () {
			$(this.regions.availableOffersComponent).show();
		}
	});
	// Our module now returns our view
	return AvailableOffersLayout;
});