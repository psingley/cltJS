define([
	'jquery',
	'underscore',
	'backbone',
	'models/feefo/FeefoServiceModel',
	'models/feefo/FeefoProductModel'
], function ($, _, Backbone, FeefoServiceModel, FeefoProductModel) {
	var FeefoReviewModel = Backbone.Model.extend({
		defaults: {
			url: '',
			last_updated_date: '',
			service: null,
			product: null,
			mode: '',
			arating: 5
		},
		initialize: function () {
			this.set('service', new FeefoServiceModel(this.get('service')));

			// some models doesn't contain any product, don't show such reviews
			var products = this.get('products');
			this.set('product', new FeefoProductModel(products[0]));

			var rating = (parseInt(this.get('product').get('rating')) + parseInt(this.get('service').get('rating'))) / 2;
			this.set('arating', Math.ceil(rating));
		}
	});
	// Return the model for the module
	return FeefoReviewModel;
});