// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/tour/availableOffers/OfferDateRangeModel'
], function (_, Backbone, OfferDateRangeModel) {
    var OfferDateRangeCollection = Backbone.Collection.extend({
        defaults: {
            model: OfferDateRangeModel
        },
        initialize: function () {
            this.sort_key = 'endDate';
        },
        comparator: function (item) {
            return -item.get(this.sort_key);
        }
    });
    // Return the model for the module
	return OfferDateRangeCollection;
});