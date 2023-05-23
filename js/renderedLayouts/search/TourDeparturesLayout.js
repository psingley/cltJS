define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'moment',
	'app',
	'event.aggregator',
	'extensions/marionette/views/RenderedLayout',
	'util/uriUtil',
	'util/tourDetailUtil',
	'util/objectUtil',
	'util/dateUtil',
	'util/offersUtil',
	'services/tourService',
	'views/tour/tourDates/compact/TourYearsContentListView',
	'views/tour/tourDates/yearTabs/YearTabCompactListView',
	'collections/tour/tourDates/TourDateCollection',
	'collections/tour/tourDates/TourDatesByYearCollection',		
	'models/tour/tourDates/TourDatesByYearModel',
	'text!templates/search/tourDetails/TourDeparturesTemplate.html',
	'collections/tour/tourDates/TourDatesByMonthCollection',
	'models/tour/tourDates/TourDatesByMonthModel'
], function ($, _, Backbone, Marionette, moment, App, EventAggregator, RenderedLayout, UriUtil, TourDetailUtil, ObjectUtil, DateUtil, OffersUtil, TourService,
	TourYearsContentListView, YearTabCompactListView, TourDateCollection,
	TourDatesByYearCollection, TourDatesByYearModel,
	DepartureTmpl, TourDatesByMonthCollection, TourDatesByMonthModel) {
	
	var TourDeparturesLayout = Backbone.Marionette.Layout.extend({
		events: {
		},
		ui: {

		},
		template: Backbone.Marionette.TemplateCache.get(DepartureTmpl),
		regions: {
			tabHeaders: ".date-group div[data-yearsHeader]",
			tabContent: ".date-group div[data-content]"
		},
		
		initialize: function () {
			//this.buildTourDateSelectors(this.collection);
		},

		buildTourDateSelectors: function (tourDatesCollection) {
			var outerScope = this;
			var pickFromCount = tourDatesCollection.length;
			
			//TourDetailUtil.generatePickFromText(pickFromCount);			
		},

		getYearsCollection: function (tourDatesCollection, tourId, discountMessage) {
			var result = new TourDatesByYearCollection();
			var discountData = this.getBiggestDiscount(tourDatesCollection);
		    //discountData.vanity.length == 0 to determine if it is a hot deal then it is already applied.
			if (discountData.vanity == null || discountData.vanity.length == 0){
				discountMessage = null;
			}
			else {
				discountMessage = discountMessage.replace("$code", discountData.vanity.vanityCode);
				discountMessage = discountMessage.replace("$value", App.siteSettings.currencySymbol + discountData.discount.offerRate);
				discountMessage = discountMessage.replace("$date", moment(discountData.vanity.endDate).format(App.siteSettings.dateFormat));
			}

			$.each(tourDatesCollection, function (idx, item) {
				$.each(item.packages, function (idx, item) {
					item.tourId = tourId;
				});
				result.add(new TourDatesByYearModel({
					year: item.year,
					tourId: tourId,
					discountMessage : discountMessage,
					datesByMonth: new TourDatesByYearCollection(new TourDatesByMonthModel({
						year: item.year,
						tourId: tourId,
						discountMessage: discountMessage,
						dates: new TourDateCollection(item.packages)
					}))
				}));
			});
			return result;
		},
		onShow: function () {
			var outerScope = this;
			var tourId = this.options.tourId;
			var discountMessage = this.options.discountMessage;
			var datesByYears = this.getYearsCollection(this.options.mycoll, tourId, discountMessage);
			this.tabHeaders.show(new YearTabCompactListView({ collection: datesByYears, tourId: tourId }));
			this.tabContent.show(new TourYearsContentListView({ collection: datesByYears, tourId: tourId }));
			$(this.tabHeaders.el).find("li[role]:not('.active') a").each(function() {
				$(this).attr("aria-expanded", "false");
				var id = $(this).attr("href");
				$(id).removeClass("active");
			});

			$('[data-target="#special-offers-modal"]').click(function(){
				App.OffersModal.updateDisclaimer(outerScope.getBiggestDiscount(outerScope.options.mycoll).vanity);
			})
		},
		getBiggestDiscount: function(tourDatesCollection){
			if (this.biggestDiscount == null) {
				var discount = null;
				var vanityToShow = null;
				$.each(tourDatesCollection, function (idx, item) {
					$.each(item.packages, function (idx, item) {
						if (item.discount != null && OffersUtil.isOfferValid(item.discount)) {
							if (discount == null || item.discount.offerRate > discount.offerRate) {
								var vanity = OffersUtil.getCurrentVanityCodeObject(item.discount);
								if (vanity != null) {
									discount = item.discount;
									vanityToShow = vanity;
								}
							}
						}
					});
				});
				this.biggestDiscount = {
					discount: discount,
					vanity: vanityToShow
				}
			}
			return this.biggestDiscount;
		},
		templateHelpers: function() {
			return {
				caption: App.dictionary.get("TourRelated.TourDetails.Captions.Departures", "Departures")
			}
		}
	});
	return TourDeparturesLayout;
});