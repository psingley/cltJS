define([
'jquery',
'underscore',
'backbone',
'marionette',
'event.aggregator',
'app',
'services/searchService',
'helpers/TourDetailsLoadingHelper',
'views/search/tourDetails/ItineraryItemView',
'collections/tour/itineraries/ItineraryItemCollection',
'text!templates/search/tourDetails/TourItineraryTemplate.html'
], function ($, _, Backbone, Marionette, EventAggregator, App, SearchService, TourDetailsLoadingHelper, ItineraryItemView, ItineraryItemCollection, ViewTemplate) {
		var TourItineraryView = Backbone.Marionette.CompositeView.extend({
			template: Backbone.Marionette.TemplateCache.get(ViewTemplate),
			collection: ItineraryItemCollection,
			itemView: ItineraryItemView,
			tagName: "div",
			itemViewContainer: 'ol',
			initialize: function(input) {
				var self = this;
				this.model = input.model;
				this.collection = input.model.itineraryList;

				var defaultItineraryId = this.model.get("defaultItineraryId");
				var shownDates = this.model.get('packageDates');
				if (shownDates && shownDates.length > 0) {
					defaultItineraryId = shownDates[0];
				}

				if (defaultItineraryId && this.model.get("defaultNeoId")) {
					//init itinerary based on call from departure section
					var params = {
						"neoId": this.model.get("defaultNeoId"),
						"currentItemId": this.model.get("tourId"),
						"packageDateId": defaultItineraryId
					};
					this.callItineraryService(params, function (val) {
						//set combobox value
						self.ui.$internalyList.val(defaultItineraryId);
					});
				}

				var isModal = this.model.get('isModal');
				var tourDates = this.model.tourDatesByYear.models;
				var tourPackageDetail = [];
				
				var guidLowered = function(guid){
					return guid.replace('{', '').replace('}', '').toLowerCase();
				};
				
				var shownDatesLowered = _.map(shownDates, function(sd) {
					return guidLowered(sd);
				});

				if (isModal && shownDatesLowered && shownDatesLowered.length > 0) {
					_(tourDates).each(function (groupEl) {
						_(groupEl.get('tourDates').models).each(function (dateEl) {
							if (_.contains(shownDatesLowered, guidLowered(dateEl.get('tourId')))) {
								var tourDetail = { neoId: dateEl.get('neoId'), tourDateId: dateEl.get('tourId'), date: dateEl.get('dateView') };
								tourPackageDetail.push(tourDetail);
							}
						});
					});
					
					if (tourPackageDetail.length > 0) {
						var parameters = {
							"neoId": tourPackageDetail[0].neoId,
							"currentItemId": tourPackageDetail[0].tourDateId,
							"packageDateId": defaultItineraryId
						};
						self.callItineraryService(parameters);
					}
				}

				this.tourPackageDetail = tourPackageDetail;
			},
		ui: {
			'$bookBtn': '.padded a.btn',
			'$internalyList': '.section-description select'
		},
		events: {
			'change .section-description select': 'getItinerary',
			'click .padded a.btn': 'openTourDetails'
		},
		getItinerary: function (event) {
			console.log("getItinerary - start");
			var self = this;
			var options = $(event.target).find("option:selected");
			var params = { "neoId": (options).data("neoid"), "currentItemId": self.model.get("tourId"), "packageDateId": (options).data("tourid") };
			self.callItineraryService(params);
		},
		onShow: function () {
			var outerScope = this;
			var shownDates = this.model.get('packageDates');
			var returnedDates = this.ui.$internalyList.find('option').map(function () { return $(this).val(); });

			if (shownDates && shownDates.length > 0) {
				shownDates.every(function(date) {
					if ($.inArray(date, returnedDates) >= 0) {
						outerScope.ui.$internalyList.val(date);
						return false;
					}
					return true;
				});
			} else {
				this.ui.$internalyList.val(this.model.get("defaultItineraryId"));
			}
		},
		callItineraryService: function (params, successFunction) {
			var self = this;
			var sectionLoader = $(self.$el).closest(".itinerarymodal").find("#search-td-loader");

			TourDetailsLoadingHelper.startItineraryAnimation(sectionLoader);
			setTimeout(function () {
				var successFunctionEx = function (results) {
					var coll = new ItineraryItemCollection();
					coll.initFromArray(results);
					self.collection.reset(coll.models);
					if (successFunction) {
						successFunction(results);
					}
					params.itineraryCollection = results;
					EventAggregator.trigger("changedTourDate", params);
				};
				var completeFn = function () {
					console.log("getItinerary - done");
					TourDetailsLoadingHelper.endItineraryAnimation(sectionLoader);
				};
				SearchService.requestTouritineraryResults(params, successFunctionEx, completeFn);
			}, 1300);
		},

		openTourDetails: function (event) {
			event.preventDefault();
			var packageId = this.ui.$internalyList.val();
			var toururl = this.model.get('tourUrl');
			if (packageId && packageId != "") {
				window.open(toururl + "#packagedate/" + packageId, '_blank');
			} else if (this.model.get('isModal')) {
				window.open(toururl, '_blank');
			}
		},
		templateHelpers: function () {
			var outerScope = this;
			return {
				tourDates: function() {
					return outerScope.model.tourDatesByYear.models;
				},
				shownDates: function () {
					return outerScope.model.get('packageDates');
				},
				caption: App.dictionary.get("tourRelated.TourDetails.Captions.Itinerary", "Sample Itinerary"),
				bookCaption: App.dictionary.get("tourRelated.TourDetails.Captions.ItineraryBookCaption", "Book This Date"),
				tourDetailsCaption: App.dictionary.get("tourRelated.Buttons.ViewTourDetails", "View Tour Details"),
				tourDetailsCaptionMobile: App.dictionary.get("tourRelated.Buttons.ViewTourDetailsMobile", "View Details"),

				showDateSelector: function () {
					var showDateSelector = outerScope.model.get("showDateSelector");
					if (showDateSelector && showDateSelector.toLowerCase() === 'false') {
						return "display: none";
					}
					return "";
				},
				showTourDetails: function () {
					var showTourDetails = outerScope.model.get("showTourDetails");
					if (showTourDetails && showTourDetails.toLowerCase() === 'false') {
						return false;
					}
					return true;
				},
				isModal: outerScope.model.get('isModal'),
				tourPackageDetail:this.tourPackageDetail
			}
		}
	});

	return TourItineraryView;
});