// Filename: collections/projects
define([
    'underscore',
    'backbone',
    // Pull in the Model module from above
    'models/search/searchOptions/ParameterModel',
	'util/uriUtil'
], function (_, Backbone, ParameterModel, UriUtil) {
	var ParameterCollection = Backbone.Collection.extend({
		defaults: {
			model: ParameterModel
		},
		serializableObject: function (searchOptions) {
			var serializableObject = {};
			this.each(function(parameter) {
				var key = parameter.get('id');
				if (key && parameter.get('values') && parameter.get('values').length) {
					var value = parameter.get('values').join(',');
					if (value !== "") {
						serializableObject[key] = value;
					}
				}
			});

			serializableObject.currentPage = searchOptions.get('currentPage');
			serializableObject.sortDirection = searchOptions.get('sortDirection');
			serializableObject.sortBy = searchOptions.get('sortBy');

			return serializableObject;
		}
	});
	// You don't usually return a collection instantiated
	return ParameterCollection;
});