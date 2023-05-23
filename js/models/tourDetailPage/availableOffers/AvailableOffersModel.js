// Filename: models/availableOffers
define([
		'jquery',
		'underscore',
		'backbone',
		'util/dateUtil'
	],
	function($, _, Backbon, DateUtil) {
		var AvailableOffersModel = Backbone.Model.extend({
			defaults: {
				offerCode: '',
				offerRate: 0,
				offerDescription: '',
				offerWebsiteType: ''
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
