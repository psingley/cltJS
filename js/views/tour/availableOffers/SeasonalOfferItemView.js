define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'moment',
    'app',
    'util/objectUtil',
    'util/offersUtil',
    'models/tour/availableOffers/AvailableOffersModel',
    'text!templates/tour/availableOffers/seasonalOfferTemplate.html',
    'util/htmlUtil',
'collections/tour/availableOffers/VanityCodeCollection'
], function ($, _, Backbone, Marionette, moment, App, ObjectUtil, OffersUtil, AvailableOffersModel, seasonalOfferTemplate, HtmlUtil, VanityCodeCollection) {
	var SeasonalOfferItemView = Backbone.Marionette.ItemView.extend({
		model: AvailableOffersModel,
		tagName: "div",
		className: "col-sm-6",
		template: Backbone.Marionette.TemplateCache.get(seasonalOfferTemplate),
		templateHelpers: function() {
			return {
				seasonalOffer: this.model,
				seasonalOfferText: App.dictionary.get('tourRelated.FreeFormText.SeasonalOffer'),
				useOfferCodeText: App.dictionary.get('tourRelated.FreeFormText.UseOfferCode'),
				seasonalOfferSummary: function () {
					return $("#seasonalOfferSummary").val();
				},
				expireDate: function () {
					var vanityEndDate = this.seasonalOffer.vanityEndDate();
					var vanityLastDate = moment(vanityEndDate).format(App.siteSettings.dateFormat);

					return vanityLastDate;
				},
				startDate: function () {
					var vanityStartDate = this.seasonalOffer.vanityStartDate();
					var vanityFirstDate = moment(vanityStartDate).format(App.siteSettings.dateFormat);

					return vanityFirstDate;
				}
			}
		},
		onRender: function () {
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

			$("#seasonal-disclaimer").text(disclaimerTemplate);
		}
	});
// Our module now returns our view
return SeasonalOfferItemView;
});