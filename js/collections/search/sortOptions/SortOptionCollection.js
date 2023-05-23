// Filename: collections/projects
define([
    'underscore',
    'backbone',
    // Pull in the Model module from above
    'models/search/sortOptions/SortOptionModel'
], function (_, Backbone, SortOptionModel) {
	var SortOptionCollection = Backbone.Collection.extend({
		defaults: {
			model: SortOptionModel
		}
	});
	// You don't usually return a collection instantiated
	return SortOptionCollection;
});