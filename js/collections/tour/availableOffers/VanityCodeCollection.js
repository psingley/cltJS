// Filename: models/project
define([
'underscore',
'backbone',
'moment',
'models/tour/availableOffers/VanityCodeModel'
], function (_, Backbone, moment, VanityCodeModel) {
	var VanityCodeCollection = Backbone.Collection.extend({
		defaults: {
			model: VanityCodeModel
		},
		initialize: function () {
			this.sort_key = 'endDate';
		},
		comparator: function (item) {
			return -item.get(this.sort_key);
		},
		sortByField: function (fieldName) {
			this.sort_key = fieldName;
			this.sort();
		}
	});
	// Return the model for the module
	return VanityCodeCollection;
});