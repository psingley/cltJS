// Filename: models/project
define([
'underscore',
'backbone',
'util/dateUtil'
], function (_, Backbone, DateUtil) {
	var BlogModel = Backbone.Model.extend({
		defaults: {
			id: '',
			title: "title",
			author: "author",
			summary: "summary",
			date: "",
			imageUrl: "",
			tags: "",
			url: ""
		},
		initialize: function (result) {
			if (result) {
				var imageObj = JSON.parse(result.image);
				if (imageObj) {
					this.set({ imageUrl: imageObj.url, imageUrlAlt: imageObj.altTag });
				}
			}
		}
	});
	// Return the model for the module
	return BlogModel;
});