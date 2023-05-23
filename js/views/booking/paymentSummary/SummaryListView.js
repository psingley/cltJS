define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'views/booking/paymentSummary/SummaryView',
    'app',
    'collections/booking/tourCustomizations/CartDetailItemCollection',
    'event.aggregator',
    'text!templates/booking/paymentSummary/summaryDetailListTemplate.html',
    'util/booking/bookingUtil'
], function ($, _, Backbone, Marionette, SummaryView, App, CartDetailItemCollection, EventAggregator, summaryDetailListTemplate, BookingUtil) {
    var SummaryListView = Backbone.Marionette.CompositeView.extend({
        collection: CartDetailItemCollection,
        itemView: SummaryView,
        template: Backbone.Marionette.TemplateCache.get(summaryDetailListTemplate),
        tagName: 'table',
        className: 'booking',
        itemViewOptions: function (model, index) {
        	return {
        		rowIndex: index
        	}
        },
        templateHelpers: function () {
            return {
                dateText: App.dictionary.get('tourRelated.Booking.Date'),
                quantityText: App.dictionary.get('tourRelated.Booking.SummaryPayment.Qty'),
                unitsText: App.dictionary.get('tourRelated.Booking.SummaryPayment.Units'),
                commissionText: App.dictionary.get('tourRelated.Booking.SummaryPayment.Commission'),
                rateText: App.dictionary.get('tourRelated.Booking.SummaryPayment.Rate'),
                totalText: App.dictionary.get('tourRelated.Booking.SummaryPayment.Labels.Total'),
                deleteText: App.dictionary.get('tourRelated.Booking.SummaryPayment.Delete'),
                commissionsAreShown: function() {
                    return BookingUtil.getHideCommissionCookie() !== 'true';
                }
            }
        }
    });
    // Our module now returns our view
    return SummaryListView;
});

