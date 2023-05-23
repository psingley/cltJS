/**
* This model contains logic for fetching
* search for the video-webinar components
* @extends Backbone.Model
* @class PerformVideoSearchModel
*/
define([
		'underscore',
		'backbone',
		'collections/grid/VideoResultCollection',
		'models/grid/VideoResultModel',
		'app'
	], function (_, Backbone, VideoResultCollection, VideoResultModel, App) {
		var PerformVideoSearchModel = Backbone.Model.extend({
			initialize: function () {
				this.allResultsCount = 0;
				this.results = new VideoResultCollection();
				this.allresults = new VideoResultCollection();
				this.on("change", this.fetchCollections);
			},
			url: function () {
				return '/Services/Search/SearchService.asmx/PerformVideoSearch';
			},
			parse: function (response) {
				var data = JSON.parse(response.d);
				return data;
			},
			fetchCollections: function () {
				this.results.set(
				_(this.get("results")).map(function (result) {
					return new VideoResultModel(result);
				})
				);
				this.allresults.set(
				_(this.get("allResults")).map(function (allresults) {
					return new VideoResultModel(allresults);
				})
				);

				this.allResultsCount = this.get("allResultsCount").length;
			}
		});
		return PerformVideoSearchModel;
	});