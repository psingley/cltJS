define([
		'underscore',
		'backbone',
		'models/grid/VideoResultModel'
	], function (_, Backbone, VideoResultModel) {
		var VideoResultCollection = Backbone.Collection.extend({
			defaults: {
				model: VideoResultModel
			},
			initialize: function () {
			}
		});
		// Return the model for the module
		return VideoResultCollection;
	});