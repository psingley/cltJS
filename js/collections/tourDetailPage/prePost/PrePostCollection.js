define([
	'underscore',
	'backbone',
	'models/tourDetailPage/prePost/PrePostModel'
], function(_, Backbone, PrePostModel) {
	var PrePostCollection = Backbone.Collection.extend({
		model: PrePostModel
	});
	return PrePostCollection;
})