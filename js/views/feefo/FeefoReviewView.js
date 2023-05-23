define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'app',
	'moment',
	'util/objectUtil',
	'models/feefo/FeefoReviewModel',
	'text!templates/feefo/feefoProductAndServiceTemplate.html',
	'text!templates/feefo/feefoServiceTemplate.html',
	'text!templates/feefo/feefoProductTemplate.html'
], function($, _, Backbone, Marionette,App, moment, ObjectUtil, FeefoReviewModel, feefoProductAndServiceTemplate, feefoServiceTemplate, feefoProductTemplate){
	var FeefoReviewView = Backbone.Marionette.ItemView.extend({
		model: FeefoReviewModel,
		tagName: "li",
		className: "review",
		ui: {
			'$serviceMedia': '.service-media',
			'$productMedia': '.product-media'
		},
		getTemplate: function () {
			if (this.model.mode === "all") {
				var product = this.model.get('product');
				if (!ObjectUtil.isNullOrEmpty(product)) {
					return Backbone.Marionette.TemplateCache.get(feefoProductAndServiceTemplate);
				}
				return Backbone.Marionette.TemplateCache.get(feefoProductTemplate);
			}
			if (this.model.mode === "product" || this.model.mode === "productonly") {
				return Backbone.Marionette.TemplateCache.get(feefoProductTemplate);
			}
			if (this.model.mode === "service") {
				return Backbone.Marionette.TemplateCache.get(feefoServiceTemplate);
			}

			return Backbone.Marionette.TemplateCache.get(feefoServiceTemplate);
		},

		templateHelpers: function () {
			var outerScope = this;
			var product = this.model.get('product');
			var service = this.model.get('service');

			return {
				service: App.dictionary.get('tourRelated.FeefoReviews.Service', 'Service'),
				tour: App.dictionary.get('tourRelated.FeefoReviews.Tour','Tour'),
				bad: App.dictionary.get('tourRelated.FeefoReviews.Bad', 'Bad'),
				poor: App.dictionary.get('tourRelated.FeefoReviews.Poor','Poor'),
				good: App.dictionary.get('tourRelated.FeefoReviews.Good','Good'),
				excellent: App.dictionary.get('tourRelated.FeefoReviews.Excellent', 'Excellent'),
				colletteSupport: App.dictionary.get('tourRelated.FeefoReviews.Collette Support', 'Collette Support'),
				title: service.get('title'),
				serviceRating: service.get('rating'),
				productRating: product ? product.get('rating') : '0',
				merchantServiceComment: service.get('merchant_comment'),
				merchantProductComment: product ? product.get('merchant_comment') : '',
				productComment: product ? outerScope.replaceNewLines(product.get('review')) : '',
				serviceComment: outerScope.replaceNewLines(service.get('review')),
				serviceMedia: service.get('media') ? service.get('media') : null,
				productMedia: product && product.get('media') ? product.get('media') : null,
				serviceId: service.get('id'),
				productId: product ? product.get('id') : '',

				getDateFormatted: function () {
					return moment(outerScope.model.get('last_updated_date')).format(App.siteSettings.dateFormat);
				},

				showMerchantServiceComment: function () {
					return !ObjectUtil.isNullOrEmpty(service.get('merchant_comment'));
				},

				showMerchantProductComment: function () {
					return !ObjectUtil.isNullOrEmpty(product)
						&& product.get('merchant_comment');
				}
			}
		},
		replaceNewLines: function(string) {
			if(!ObjectUtil.isNullOrEmpty(string)) {
				string = string.replace(/\n/g, "<br/>");
			}

			return string;
		}
	});
// Our module now returns our view
	return FeefoReviewView;
});