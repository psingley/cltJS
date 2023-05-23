define([
'jquery',
'underscore',
'backbone',
'marionette',
'moment',
'app',
'util/objectUtil',
'util/OffersUtil',
'models/tour/availableOffers/AvailableOffersModel',
'text!templates/tour/availableOffers/earlyBookingTemplate.html',
'util/htmlUtil'
], function ($, _, Backbone, Marionette, moment, App, ObjectUtil, OffersUtil, AvailableOffersModel, earlyBookingTemplate, HtmlUtil) {
	var EarlyBookingView = Backbone.Marionette.ItemView.extend({
		model: AvailableOffersModel,
		template: Backbone.Marionette.TemplateCache.get(earlyBookingTemplate),
		templateHelpers: function () {
			return {
				earlyBookingBonus: this.model,
				daysThreshold: 14,
				expiresTodayText: App.dictionary.get('tourRelated.FreeFormText.ExpiresToday'),
				offerDetailsText: App.dictionary.get('tourRelated.FreeFormText.OfferDetails'),
				bookEarlyAndSaveText: App.dictionary.get('tourRelated.FreeFormText.BookEarlyAndSave'),
				whenYouBookByText: App.dictionary.get('tourRelated.FreeFormText.WhenYouBookBy'),
				useOfferCodeText: App.dictionary.get('tourRelated.FreeFormText.UseOfferCode'),
				perPersonText: App.dictionary.get('tourRelated.FreeFormText.PerPerson'),
				currencySymbol: App.siteSettings.currencySymbol,
				daysLeft: function () {
					var daysUntilExpire = moment(this.earlyBookingBonus.vanityEndDate()).diff(moment(), 'days') + 1;
					return daysUntilExpire;
				},
				daysLeftText: function () {
					var daysUntilExpire = moment(this.earlyBookingBonus.vanityEndDate()).diff(moment(), 'days') + 1;
					if (daysUntilExpire > 1) {
						return App.dictionary.get('tourRelated.FreeFormText.DaysLeft');
					}
					return App.dictionary.get('tourRelated.FreeFormText.DayLeft');
				},
				formattedOfferRate: function () {
					return this.offerRate.toLocaleString();
				},
				expireDate: function () {
					var vanityEndDate = this.earlyBookingBonus.vanityEndDate();
					var vanityLastDate = moment(vanityEndDate).format(App.siteSettings.dateFormat);

					return vanityLastDate;
				},
				startDate: function () {
					var vanityStartDate = this.earlyBookingBonus.vanityStartDate();
					var vanityFirstDate = moment(vanityStartDate).format(App.siteSettings.dateFormat);

					return vanityFirstDate;
				},
				earlyBookingSummary: function () {
					return $("#earlyBookingSummary").val();
				}
			};
		},
		onRender: function () {
			//This is used to prevent the element from being wrapped in a <div> tag by default
			this.$el = this.$el.children();
			this.$el.unwrap();
			this.setElement(this.$el);

			this.applyDisclaimerDates();
		},
		applyDisclaimerDates: function () {
			var vanityCode = this.model.vanityCode();
			if (vanityCode) {
				vanityCode = "\"" + vanityCode + "\" ";
			}

			var offerType = this.model.get('offerWebsiteType');
			var disclaimerTemplate = OffersUtil.getOfferDisclaimer(offerType.id);

			var vanityStartDate = this.model.vanityStartDate();
			var vanityFirstDate = moment(vanityStartDate).format(App.siteSettings.dateFormat);

			var vanityEndDate = this.model.vanityEndDate();
			var vanityLastDate = moment(vanityEndDate).format(App.siteSettings.dateFormat);

			disclaimerTemplate = disclaimerTemplate.replace("@@offercode@@", vanityCode);
			disclaimerTemplate = disclaimerTemplate.replace("@@offerstartdate@@", vanityFirstDate);
			disclaimerTemplate = disclaimerTemplate.replace("@@offerenddate@@", vanityLastDate);

			$("#ebb-disclaimer").text(disclaimerTemplate);
		}
	});
	// Our module now returns our view
	return EarlyBookingView;
});