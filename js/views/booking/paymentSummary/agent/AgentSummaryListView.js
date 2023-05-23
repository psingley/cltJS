define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'views/booking/paymentSummary/agent/AgentSummaryView',
    'app',
    'collections/booking/tourCustomizations/CartDetailItemCollection',
    'event.aggregator',
    'text!templates/booking/paymentSummary/summaryAgentDetailListTemplate.html',
    'views/booking/paymentSummary/SummaryListView'
], function ($, _, Backbone, Marionette, AgentSummaryView, App, CartDetailItemCollection, EventAggregator, summaryAgentDetailListTemplate, SummaryListView) {
    var AgentSummaryListView = SummaryListView.extend({
        collection: CartDetailItemCollection,
        itemView: AgentSummaryView,
        template: Backbone.Marionette.TemplateCache.get(summaryAgentDetailListTemplate),
        tagName: 'div',
        className: 'booking'
    });
    // Our module now returns our view
    return AgentSummaryListView;
});

