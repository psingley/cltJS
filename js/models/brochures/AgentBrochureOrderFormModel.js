define([
	'jquery',
	'underscore',
	'backbone'
], function ($, _, Backbone) {
	var AgentBrochureOrderFormModel = Backbone.Model.extend({
		defaults: {
			countryId: "",
			countryName: "",
			stateId: "",
			stateName: "",
			city: "",
			address: "",
			address2: "",
			zipcode: "",
			stateHidden:false
		}
	});
	// Return the model for the module
	return AgentBrochureOrderFormModel;
});