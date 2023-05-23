// Filename: models/project
define([
    'underscore',
    'backbone',
	'util/dateUtil',
	'util/offersUtil',
	'util/objectUtil',
    'models/tourDetailPage/availableOffers/availableOffersModel'
], function (_, Backbone, DateUtil, OffersUtil, ObjectUtil, AvailableOffersModel) {
	var AvailableOfferCollection = Backbone.Collection.extend({
		defaults: {
			model: AvailableOffersModel
		},
		initialize: function () {
			this.sort_key = 'rate';
		},
		comparator: function (item) {
			return -item.get(this.sort_key);
		},
		sortByField: function (fieldName) {
			this.sort_key = fieldName;
			this.sort();
		},
		singleOffersOfEachType: function (){
			var outerScope = this;
			var result = [];
			_.each(outerScope.models, function(offer) {
				if(outerScope._offerIsValid(offer)) {
					result.push(offer);
				}
			});

			var grouped = _.groupBy(result, function(o) {
				var hashCode = '';
				var vanityCode = _.uniq(o.get('vanityCodes'), function(x) {
									if (DateUtil.validToday(x.startDate,x.endDate)) {
										return x.vanityCode;
									}
								});
				if (!ObjectUtil.isNullOrEmpty(vanityCode) && vanityCode.length > 0) {
					_.each(vanityCode, function (vc) {
								hashCode += vc.startDate + vc.endDate + vc.vanityCode;
						});
				}
				return hashCode;
			});

			var offerType = [];
			_.each(grouped, function(groupedOffers) {
				if (groupedOffers) {
					for (var i = 0; i < groupedOffers.length; i++){
						var offer = groupedOffers[i];
							offerType.push(offer);
							return;
					}
				}
			});

			return new AvailableOfferCollection(_.uniq(offerType, function (x) {
				return x.get('neoId');
			}));

			//return new AvailableOfferCollection(_.uniq(result, function (x) {
			//	return _.any(x.get('vanityCodes'), function (vanityCode) {
			//		return DateUtil.validToday(vanityCode.startDate, vanityCode.endDate);
			//	});
			//}));

		},
		filterCurrentByOfferType: function (offerWebsiteType) {
			var outerScope = this;
			var filtered = this.filter(function (offer) {
				var offerType = offer.get("offerWebsiteType");
				if (ObjectUtil.isNullOrEmpty(offerType)) {
					return false;
				}

				return offerType.id.toUpperCase() === offerWebsiteType.toUpperCase() && outerScope._offerIsValid(offer);
			});

			var uniqueByNeoId = _.uniq(filtered, function (x) {
				return x.neoId;
			});

			return new AvailableOfferCollection(uniqueByNeoId);
		},
		_offerIsValid: function (offer){
			var dates = offer.get("offerDateRanges");
			var offerType = offer.get("offerWebsiteType");
			var vanityCodes = offer.get("vanityCodes");
			return _.any(dates, function (dates) {
					return DateUtil.validToday(dates.startDate, dates.endDate);
			})
				&& (!offerType.vanityCodeRequired
					|| _.any(vanityCodes, function (vanityCode) {
						return DateUtil.validToday(vanityCode.startDate, vanityCode.endDate);
					}));
		}
    });
    // Return the model for the module
    return AvailableOfferCollection;
});