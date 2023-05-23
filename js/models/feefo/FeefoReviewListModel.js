define([
	'jquery',
	'underscore',
	'backbone',
	'models/feefo/FeefoReviewModel',
	'collections/feefo/FeefoCollection'
], function ($, _, Backbone, FeefoReviewModel, FeefoCollection) {
	var FeefoReviewListModel = Backbone.Model.extend({
		defaults: {
			summary: '',
			showError: true,
			mode: '',
			limit: '',
			productId: '',
			reviews: FeefoCollection,
			skippedCount: 0,
			orderby: '',
			sort: ''
		},
		initialize: function () {
			var outerscope = this;

			outerscope.mode = outerscope.get('mode');
			outerscope.limit = outerscope.get('page_size');
			outerscope.summary = outerscope.get('summary');
			outerscope.productId = outerscope.get('productId');
			outerscope.skippedCount = outerscope.get('skippedCount');
			outerscope.orderby = outerscope.get('orderby');
			outerscope.sort = outerscope.get('sort');

			var reviewsCollection = outerscope.get('reviews');
			outerscope.reviews = new FeefoCollection(
				_(reviewsCollection).map(function(review){
					var feefoReviewModel = new FeefoReviewModel(review);
					feefoReviewModel.mode = outerscope.mode;
					return feefoReviewModel;
				})
			);

			//only sort the reviews if reviews returned is more than the limit
			if (outerscope.limit < outerscope.reviews.models.length) {
                //Hard-Code for Southern-Italy-and-Sicily
			    if (outerscope.productId == '39') {
			        var length = outerscope.reviews.models.length;
			        for (var i = 0; i < outerscope.limit && length > 0; i++) {
			            if (outerscope.reviews.models[i].get('arating') < 5) {
			                for (var j = i + 1; j < outerscope.reviews.length; j++) {
			                    if (outerscope.reviews.models[j].get('arating') > 4) {
			                        var model = outerscope.reviews.models[j];
			                        outerscope.reviews.models[j] = outerscope.reviews.models[i];
			                        outerscope.reviews.models[i] = model;
			                        break;
			                    }
			                }
			            }
			        }
			    }
			    for (var i = 0; i < outerscope.limit && outerscope.reviews.models.length > 0; i++) {
					if (outerscope.reviews.models[i].get('arating') < 3) {
						for (var j = i + 1; j < outerscope.reviews.length; j++) {
							if (outerscope.reviews.models[j].get('arating') > 3) {
								var model = outerscope.reviews.models[j];
								outerscope.reviews.models[j] = outerscope.reviews.models[i];
								outerscope.reviews.models[i] = model;
								break;
							}
						}
					}
				}
			}
		},
		addReviews: function (newReviewListModel) {
			this.mode = newReviewListModel.get('mode');
			this.limit = newReviewListModel.get('page_size');
			this.summary = newReviewListModel.get('summary');
			this.set('summary', newReviewListModel.get('summary'));

			this.reviews.add(newReviewListModel.reviews.models);

			var reviews = this.get('reviews').concat(newReviewListModel.get('reviews'));
			this.set('reviews', reviews);
			this.skippedCount += newReviewListModel.get('skippedCount');
		}
	});
	// Return the model for the module
	return FeefoReviewListModel;
});