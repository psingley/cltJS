define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'renderedLayouts/booking/steps/SummaryStepLayout',
    'util/booking/bookingUtil',
    'event.aggregator',
    'views/booking/paymentSummary/agent/AgentSummaryListView',
    'renderedLayouts/booking/paymentSummary/agent/AgentPaymentFormLayout'
], function ($, _, Backbone, Marionette, App, SummaryStepLayout, BookingUtil, EventAggregator, AgentSummaryListView, AgentPaymentFormLayout) {
    var AgentSummaryStepLayout = SummaryStepLayout.extend({
        onGetBookingComplete: function () {
            var outerScope = this;
            outerScope.summaryDetailsRegion.show(new AgentSummaryListView({collection: App.Booking.cartDetailItems}));
            BookingUtil.setSummaryTotal();
        },
        initialize: function () {
            AgentSummaryStepLayout.__super__.initialize.apply(this);
            this.onGetBookingComplete();
            this.setAgentInformationLayout();
        },
        setAgentInformationLayout: function () {

        },
        setPaymentForm: function(){
            this.paymentForm = new AgentPaymentFormLayout();
        }
    });
    return AgentSummaryStepLayout;
});