// Filename: models/facetItems
define([
	'jquery',
	'underscore',
	'backbone',
	'util/DateUtil',
], function ($, _, Backbone, DateUtil) {
	var TourDateItemModel = Backbone.Model.extend({
		defaults: {
			tourId: '',
			neoId: '',
			startDate: '',
			endDate: ''
		},		
		initialize: function (item) {
			this.set("dateView", DateUtil.getMomentDateType(this.get("startDate")).format('ll') + ' - ' + DateUtil.getMomentDateType(this.get("endDate")).format('ll'));
		}
	});
	// Return the model for the module
	return TourDateItemModel;
});