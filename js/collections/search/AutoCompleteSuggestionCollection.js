// Filename: collections/projects
define([
    'underscore',
    'backbone',
    // Pull in the Model module from above
    'models/search/SuggestionModel'
], function (_, Backbone, SuggestionModel) {
	var AutoCompleteSuggestionCollection = Backbone.Collection.extend({
		defaults: {
			model: SuggestionModel
		}
	});
	return AutoCompleteSuggestionCollection;
});