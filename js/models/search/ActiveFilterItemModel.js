define([
'underscore',
'backbone'
], function (_, Backbone) {
	var ActiveFilterItemModel = Backbone.Model.extend({
		defaults: {
			fieldname: '',
			filtername: '',
			filtertitle: ''
		}
	});
	return ActiveFilterItemModel;
});