define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'views/tourDetailPage/tourDates/TourDateView',
    'collections/tourDetailPage/tourDates/TourDateCollection',
	'text!templates/tourDetailPage/tourDates/tourDateYearTemplate.html'
], function ($, _, Backbone, Marionette, App, EventAggregator, TourDateView, TourDateCollection, TourDateYearTemplate) {
        var TourDateYearListView = Backbone.Marionette.CompositeView.extend({
            collection: TourDateCollection,
            template: Backbone.Marionette.TemplateCache.get(TourDateYearTemplate),
            itemView: TourDateView,
            itemViewContainer: 'div',
            initialize: function (input) {
                this.model = input.model;
                this.collection = input.model.get("dates");
            },
            templateHelpers: function () {
                var outerScope = this;
                return {
                    year: outerScope.model.get("year")
                };
            },
            onShow: function () {
                $(".tours-list .tours-list-year").first().addClass("is-active");

                document.getElementById("newTourDetails").setAttribute("data-packagedate", document.querySelector(".tour-banner .banner-data .banner-data-item .date").innerHTML);

		}
	});
	// Our module now returns our view
	return TourDateYearListView;
});