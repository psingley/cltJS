define([
    'underscore',
    'backbone'
], function (_, Backbone) {
	var TourActivityLevelModel = Backbone.Model.extend({
		defaults: {			
			id :'',
			activityLevelTitle:'',
			title:'',
			description:'',
			summary:'',
			onImageUrl:'',
			ofImageUrl:'',
			travelTipsSummary:''			
		},
		initialize: function (option) {

		}
	});
	// Return the model for the module
	return TourActivityLevelModel;
});
