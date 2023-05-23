// Filename: models/project
define([
'underscore',
'backbone',
'models/tour/cruiseComponents/CruiseComponentModel'
], function (_, Backbone, CruiseComponentModel) {
	var CruiseComponentCollection = Backbone.Collection.extend({
		model: CruiseComponentModel
	});
	// Return the model for the module
	return CruiseComponentCollection;
});