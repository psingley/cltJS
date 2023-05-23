define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'app',
		'util/objectUtil',
		'models/tourDetailPage/ColletteGivesYouMore/ColletteGivesYouMoreImageModel',
		'text!templates/tourDetailPage/ColletteGivesYouMore/colletteGivesYouMoreImageTemplate.html'
	],
	function($, _, Backbone, Marionette, App, ObjectUtil, ColletteGivesYouMoreImageModel, colletteGivesYouMoreImageTemplate) {
		var colleteGivesYouMoreImageView = Backbone.Marionette.ItemView.extend({
			model: ColletteGivesYouMoreImageModel,
			template: Backbone.Marionette.TemplateCache.get(colletteGivesYouMoreImageTemplate),
			initialize: function() {
			},
			templateHelpers: function() {
				var outerScope = this;
				var placeholder = this.model.get('placeholder');
				return {

					placeholder: placeholder,

					getImageUrl: function() {
						var imageUrl = outerScope.model.get("imageUrl");
						if (ObjectUtil.isNullOrEmpty(imageUrl)) {
							return '';
						}
						return imageUrl;
					},
					getAltTag: function() {
						var altTag = outerScope.model.get("altTag");
						if (ObjectUtil.isNullOrEmpty(altTag)) {
							return '';
						}
						return altTag;
					},
					getDescription: function () {
					    var description = outerScope.model.get("description");
					    if (ObjectUtil.isNullOrEmpty(description)) {
					        return '';
					    }
					    return description;
					},
					getCapsText: function() {
						var capsText = outerScope.model.get("capsText");
						if (ObjectUtil.isNullOrEmpty(capsText)) {
							return '';
						}
						return capsText;
					}
				}
			}
		});
		// Our module now returns our view
		return colleteGivesYouMoreImageView;
	});