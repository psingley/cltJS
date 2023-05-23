// Filename: models/facetItems
define([
'jquery',
'underscore',
'backbone',
'collections/tour/availableOffers/OfferDateRangeCollection',
'collections/tour/availableOffers/VanityCodeCollection',
'util/dateUtil'
], function ($, _, Backbone, OfferDateRangeCollection, VanityCodeCollection, DateUtil) {
	var AvailableOffersModel = Backbone.Model.extend({
		defaults: {
			offerCode: '',
			offerRate: 0,
			offerDescription: '',
			offerWebsiteType: '',
			offerDateRanges: OfferDateRangeCollection,
			vanityCodes: VanityCodeCollection
		},
		initialize: function () {
			this.offerDates = new OfferDateRangeCollection();
			this.vanityCodes = new VanityCodeCollection();
		},
		getVanityCode: function () {
			var vanityCodes = this.get("vanityCodes");
			if (!vanityCodes || vanityCodes.length < 1) {
				return undefined;
			}

			var currentVanityCode = _.find(vanityCodes, function(vanityCode) {
				return DateUtil.validToday(vanityCode.startDate, vanityCode.endDate);
			});

			if(!currentVanityCode){
				return vanityCodes[0];
			}
			
			return currentVanityCode;
		},
		vanityCode: function () {
			var vanityCode = this.getVanityCode();
			return vanityCode ? vanityCode.vanityCode : "";
		},
		vanityEndDate: function () {
			var vanityCode = this.getVanityCode();
			return vanityCode ? vanityCode.endDate : "";
		},
		vanityStartDate: function () {
			var vanityCode = this.getVanityCode();
			return vanityCode ? vanityCode.startDate : "";
		}
	});
	// Return the model for the module
	return AvailableOffersModel;
});
