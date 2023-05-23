define([
    'jquery',
    'underscore',
    'backbone',
    'models/booking/tourCustomizations/CartDetailItemModel',
    'app',
    'text!templates/booking/paymentSummary/summaryAgentDetailTemplate.html',
    'event.aggregator',
    'services/bookingService',
    'util/objectUtil',
    'views/booking/paymentSummary/SummaryView'
], function ($, _, Backbone, CartDetailItemModel, App, summaryAgentDetailTemplate, EventAggregator, BookingService, ObjectUtil, SummaryView) {
    var AgentSummaryView = SummaryView.extend({
        template: Backbone.Marionette.TemplateCache.get(summaryAgentDetailTemplate),
    });
    return AgentSummaryView;
});