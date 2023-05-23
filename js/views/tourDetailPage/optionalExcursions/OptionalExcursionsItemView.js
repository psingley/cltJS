define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'app',
		'models/tourDetailPage/optionalExcursions/OptionalExcursionsModel',
		'text!templates/tourDetailPage/optionalExcursions/optionalExcursionsTemplate.html',
		'util/objectUtil',
		'util/htmlUtil'
],
	function ($,
		_,
		Backbone,
		Marionette,
		App,
		OptionalExcursionsModel,
		optionalExcursionTemplate,
		ObjectUtil,
		HtmlUtil) {
		var TourOptionalExcursionsItemView = Backbone.Marionette.ItemView.extend({
			model: OptionalExcursionsModel,
			template: Backbone.Marionette.TemplateCache.get(optionalExcursionTemplate),
			className: 'full-accordion',
			templateHelpers: function () {
				var outerScope = this;

				var city = this.model.get('city'),
					cityText = ObjectUtil.isNullOrEmpty(city) ? '' : city.name,
					comments = this.model.get('comments'),
					notes = this.model.get('notes'),
					showNotes = !ObjectUtil.isNullOrEmpty(notes),
					showComments = !ObjectUtil.isNullOrEmpty(comments);

				var fullExcursionOnlyAvailable = this.getFullExcursionOnlyAvailable();

				return {
					seeMoreText: App.dictionary.get('tourRelated.Buttons.SeeMore'),
					closeText: App.dictionary.get('common.Buttons.Close'),
					title: HtmlUtil.htmlDecode(this.model.get("title")),
					price: this.getPrice(),
					cityText: cityText,
					durationText: this.getDurationText(),
					transportationIncluded: this.model.get('transportationIncluded'),
					transportationIncludedLabel: App.dictionary.get('tourRelated.TourDetails.TransportationIncluded'),
					comments: comments,
					notes: notes,
					showComments: showComments,
					showNotes: showNotes,
					getImageUrl: function () {
						var image = outerScope.model.get("image");
						if (ObjectUtil.isNullOrEmpty(image) || ObjectUtil.isNullOrEmpty(image.url)) {
							return '';
						}
						return image.url;
					},
                    fullExcursionOnlyAvailable: fullExcursionOnlyAvailable,
                    ppText: function () { 
                        return App.siteSettings.siteId == App.siteIds.Marriott ? App.dictionary.get('tourRelated.FreeFormText.PerPerson') : App.dictionary.get('tourRelated.FreeFormText.PP');
                    }
				};
			},
			getDurationText: function () {
				var duration = this.model.get('duration'),
					hourText = App.dictionary.get('common.Calendar.Hour'),
					hoursText = App.dictionary.get('common.Calendar.Hours'),
					durationText = App.dictionary.get('tourRelated.Booking.Duration');

				var hour = duration <= 1 ? hourText : hoursText;

				return durationText + ': ' + duration + ' ' + hour;
			},
			getPrice: function () {
				var price = this.model.getLowestSinglePrice();
				if (typeof price !== 'string') {
					price = price.toString();
				}
				if (!ObjectUtil.isNullOrEmpty(price)) {
                    price = price.formatPriceTourOptions();
				}
				return price;
			},
			getFullExcursionOnlyAvailable: function () {
				var parentTourLayoutTitle = this.model.get("parentTourLayoutTitle");
				if (parentTourLayoutTitle) {
					return App.dictionary.get('tourRelated.FreeFormText.ExcursionOnlyAvailableWith') + " " + parentTourLayoutTitle;
				}
				return "";
			}
		});
		return TourOptionalExcursionsItemView;
	});