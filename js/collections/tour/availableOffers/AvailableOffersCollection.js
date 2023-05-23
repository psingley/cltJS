// Filename: models/project
define([
	'underscore',
	'backbone',
	'util/dateUtil',
	'util/objectUtil',
	'models/tour/availableOffers/AvailableOffersModel'
], function (_, Backbone, DateUtil, ObjectUtil, AvailableOffersModel) {
	var AvailableOffersCollection = Backbone.Collection.extend({
		defaults: {
			model: AvailableOffersModel
		},
		initialize: function () {
			this.sort_key = 'offerRate';
		},
		comparator: function (item) {
			return -item.get(this.sort_key);
		},
		sortByField: function (fieldName) {
			this.sort_key = fieldName;
			this.sort();
		},
		filterCurrentByOfferType: function (offerWebsiteType) {
			var filtered = this.filter(function(offer){
				var offerType = offer.get("offerWebsiteType");
				if (ObjectUtil.isNullOrEmpty(offerType))
				{
					return false;
				}

				return offerType.id.toUpperCase() === offerWebsiteType.toUpperCase() &&
					_.any(offer.get("offerDateRanges"), function(dates){
						return DateUtil.validToday(dates.startDate, dates.endDate);
					})
					&& (!offerType.vanityCodeRequired
					|| _.any(offer.get("vanityCodes"), function(vanityCode){
						return DateUtil.validToday(vanityCode.startDate, vanityCode.endDate);
					}));
			});

			var uniqueByNeoId = _.uniq(filtered, function(x) {
				return x.neoId;
			});

			return new AvailableOffersCollection(uniqueByNeoId);
		}
	});
	// Return the model for the module
	return AvailableOffersCollection;
});