/**
* The base result view class for showing search results
* @class ResultView
* @extend Backbone.Marionette.ItemView
*/
define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'app',
		'models/grid/VideoResultModel',
		'util/objectUtil',
		'text!templates/grid/videoItemTemplate.html'
	], function ($, _, Backbone, Marionette, App, VideoResultModel, ObjectUtil, videoItemTemplate) {
		var VideoResultView = Backbone.Marionette.ItemView.extend({
			model: VideoResultModel,
			template: Backbone.Marionette.TemplateCache.get(videoItemTemplate),

			initialize: function () {
			},
			templateHelpers: function () {
				return {
					videoId: this.model.get("videoId"),
					videoDescription: this.model.get("videoDescription"),
					videoTitle: this.model.get("videoTitle"),
					thumbnailImageUrl: this.model.get("thumbnailImageUrl"),
					viewPath: this.model.get("viewPath"),
					videoDateAdded: this.model.get("videoDateAdded"),
					videoSummary: this.model.get("videoSummary"),
					categories: this.model.get("categories"),
					countries: this.model.get("countries"),
					continents: this.model.get("continents"),
					addedOnText: App.dictionary.get('common.Page_Components.Added_On'),
					buttonText: function () {
					    return App.dictionary.get('common.Page_Components.View_Video');
					}
				};
			},
			onRender: function () {
				//This is used to prevent the element from being wrapped in a <div> tag by default
				this.$el = this.$el.children();
				this.$el.unwrap();
				this.setElement(this.$el);
			}
		});
		return VideoResultView;
	});