define([
    'underscore',
    'backbone',
	 'collections/tour/tourDates/TourDateCollection'
], function (_, Backbone, TourDateCollection) {
	var TourDeparturesModel = Backbone.Model.extend({
		defaults: {
			Year: 0,
			Packages: TourDateCollection
		}
		//constructor: function (option) {
		//	this.packages = new TourDateCollection(option.Packages);
		//	this.year = option.Year;
		//}
	});
	// Return the model for the module
	return TourDeparturesModel;
});
