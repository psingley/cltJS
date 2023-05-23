define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'app',
		'util/objectUtil',
		'util/tourDetailUtil',
		'models/tourDetailPage/prePost/PrePostModel',
		'text!templates/tourDetailPage/prePost/prePostTemplate.html'
],
	function ($,
		_,
		Backbone,
		Marionette,
		App,
		ObjectUtil,
		TourDetailUtil,
		PrePostModel,
		prePostTemplate) {
		var PrePostItemView = Backbone.Marionette.ItemView.extend({
			model: PrePostModel,
			template: Backbone.Marionette.TemplateCache.get(prePostTemplate),
			initialize: function() {},
			templateHelpers: function () {
				var serviceOrder = this.model.get('serviceOrder'),
						title = this.model.get('title'),
						nightText = App.dictionary.get('tourRelated.FreeFormText.Night'),
						serviceType = this.model.get('serviceType'),
						serviceTypeDetail = this.model.get('serviceTypeDetail');
						description = this.model.get('description');
						serviceTypeNamePrice = this.model.serviceTypeNamePrice,
						image = this.model.get("image");

				var count = 1;
				if (serviceOrder.name == 'Post') {
					count = count + 1;
				}

				var price;
                var ppText = App.dictionary.get('tourRelated.FreeFormText.PerNight');
                var fromText = App.dictionary.get('tourRelated.FreeFormText.From');
				var formattedTitle = serviceOrder.name + ' ' + nightText + ': ' + title;
				var buttonText = serviceOrder.name + '-night';
				
				if (!serviceTypeNamePrice) {
					price = this.model.getLowestDoublePrice() * 2;
					if (price == 0) {
						serviceTypeNamePrice = serviceTypeDetail.name;
					} else {
						if (typeof price !== 'string') {
							price = price.toString();
						}
                        price = price.formatPriceTourOptions();
                        serviceTypeNamePrice = serviceTypeDetail.name + " double pricing - " + fromText + " " + price + " " + ppText;
					}
				}

				return {
					serviceTypeNamePrice: serviceTypeNamePrice,
					formattedTitle: formattedTitle,
					getImageUrl: function () {
						if (ObjectUtil.isNullOrEmpty(image) || ObjectUtil.isNullOrEmpty(image.url)) {
							return 'https://i.gocollette.com/placeholders/hotel-holder.jpg';
						}
						//return image.url;
						var url = image.url.replace("http://resources.gocollette.com", "https://resources.gocollette.com"); //.replace("http://www.cfmedia.vfmleonardo.com", "https://deeljyev3ncap.cloudfront.net");
                        return url;
					},
					getAltTag: function () {
						if (ObjectUtil.isNullOrEmpty(image) || ObjectUtil.isNullOrEmpty(image.altTag)) {
							return '';
						}
						return image.altTag;
					},
					serviceTypeDetailName: serviceTypeDetail,
					buttonText: buttonText,
					description: description,
					count: count,
					closeText: App.dictionary.get('common.Buttons.Close')
				}
			}

		});

		return PrePostItemView;
	});