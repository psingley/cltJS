define([
	'underscore',
	'backbone',
	'models/tourDetailPage/ColletteGivesYouMore/ColletteGivesYouMoreImageModel'
], function (_, Backbone, ColletteGivesYouModeImageModel) {
	var ColletteGivesYouMoreImageCollection = Backbone.Collection.extend({
		model: ColletteGivesYouModeImageModel
	});
	return ColletteGivesYouMoreImageCollection;
})