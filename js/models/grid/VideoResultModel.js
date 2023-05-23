// Filename: models/project
define([
		'jquery',
		'underscore',
		'backbone'
	], function ($, _, Backbone) {
		/**
		* @class The model for a video list item
		*/
		var VideoResultModel = Backbone.Model.extend({
			defaults: {
				videoId: '',
				videoTitle: '',
				videoDescription: '',
				videoSummary: '',
				thumbnailImageUrl: '',
				videoURL: '',
				videoDate: '',
				linkPath: '',
				embedUrl: '',
				categories: '',
				buttonText: '',
				addedOnText: '',
			},
			initialize: function () {
			}
		});
		// Return the model for the module
		return VideoResultModel;
	});