define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'event.aggregator',
    'app',
    'util/objectUtil',
    'views/booking/paymentSummary/SummaryListView',
    'renderedLayouts/booking/paymentSummary/PaymentFormLayout',
    'renderedLayouts/booking/steps/BaseStepLayout',
    'util/booking/bookingUtil',
    'renderedLayouts/booking/paymentSummary/ReferralSourceLayout'
], function ($, _, Backbone, Marionette, EventAggregator, App, ObjectUtil, SummaryListView, PaymentFormLayout, BaseStepLayout, BookingUtil, ReferralSourceLayout) {
    var SummaryStepLayout = BaseStepLayout.extend({
        el: '#SummaryandPayment',
        events: {
            'click #view_summary_details': 'toggleSummaryDetails'
        },
        regions: {
            'summaryDetailsRegion': '#summaryDetailsRegion'
        },
        initialize: function () {
            var outerScope = this;
            SummaryStepLayout.__super__.initialize.apply(this);

            this.setPaymentForm();
            this.setReferralSourceLayout();

            if(BookingUtil.isCommissionAvailable()) {
                this.showHideCommissionInfo();
                EventAggregator.on('hideCommissionCheckboxStateChanged', outerScope.showHideCommissionInfo);
            }

            EventAggregator.on('getBookingComplete', function () {
                outerScope.onGetBookingComplete();
            });

            EventAggregator.on('requestAirCallbackChanged', function(newValue){
                outerScope.$el.find("#requestAirCallback").val(newValue);
            });
        },
        onGetBookingComplete: function () {
            this.summaryDetailsRegion.show(new SummaryListView({collection: App.Booking.cartDetailItems}));
            BookingUtil.setSummaryTotal();
        	//TODO: Review if required - Calling flights price update
            App.Booking.Steps['flightStep'].calculateStepPrice();
        },
        setReferralSourceLayout: function () {
            this.referralSource = new ReferralSourceLayout();
        },
        setPaymentForm: function () {
            this.paymentForm = new PaymentFormLayout();
        },
        toggleSummaryDetails: function (e) {
            e.preventDefault();
            var $this = $(e.target),
                $expanded = $this.closest(".section").find(".expanded"),
                $header = $this.closest(".section").find(".header");

            if ($expanded.is(":visible")) {
                $('html, body').animate({scrollTop: $header.offset().top}, function () {
                    $expanded.slideUp();
                    $this.addClass("closed");
                    $this.text(App.dictionary.get("common.Buttons.ShowDetails", "Show Details"));
                });
            } else {
                $('html, body').animate({scrollTop: $header.offset().top}, function () {
                    $expanded.slideDown();
                    $this.removeClass("closed");
                    $this.text(App.dictionary.get('common.Buttons.CloseDetails', "Close Details"));
                });
            }
        },
        calculateStepPrice: function() {
            if (!ObjectUtil.isNullOrEmpty(App.Booking.cartDetailItems) && App.Booking.cartDetailItems.length > 0) {
                var prices = [];
                var total = 0;

                //filter by offerId, don't include offers that were already included on Rooms and Travelers step
                var offersToFilter = [];

                if (!ObjectUtil.isNullOrEmpty(App.Booking.discount) && App.Booking.discount.rate > 0) {
                	offersToFilter.push(App.Booking.discount.neoId);
                }
/*
                if (!ObjectUtil.isNullOrEmpty(App.Booking.hotDeal)) {
                    offersToFilter.push(App.Booking.hotDeal.neoId);
                }
                if (!ObjectUtil.isNullOrEmpty(App.Booking.earlyBookingBonus)) {
                    offersToFilter.push(App.Booking.earlyBookingBonus.neoId);
                }
                if (!ObjectUtil.isNullOrEmpty(App.Booking.seasonalOffer)) {
                    offersToFilter.push(App.Booking.seasonalOffer.neoId);
                }*/
                if (!ObjectUtil.isNullOrEmpty(App.Booking.aaaDiscount) && App.isAAASite) {
                    offersToFilter.push(App.Booking.aaaDiscount.neoId);
                }
                /*if (!ObjectUtil.isNullOrEmpty(App.Booking.percentageOffer)) {
                    offersToFilter.push(App.Booking.percentageOffer.neoId);
                }*/

                _.each(App.Booking.cartDetailItems.models, function (cartDetail) {
                    var price = cartDetail.get('price');
                    if (price < 0 && !_.contains(offersToFilter, cartDetail.get("offerId")))
                    {
                        prices.push(price);
                        total += price;
                    }
                });

                var stepPrice = BookingUtil.adjustStepPrice(this.getStepDiv(), prices);
                this.stepPrice = stepPrice;
                BookingUtil.adjustGrandTotal();
                this.paymentForm.updateAmountDue();
                if(total == 0) {
                    BookingUtil.hideStepPrice(this.getStepDiv());
                }
            }
        },
        showHideCommissionInfo: function() {
            var summaryTotal = $('#summaryTotalCommission');
            var summaryCommissionDivs = $('.commission');
            if(BookingUtil.isCommissionHidden()) {

                if (summaryTotal.length > 0){
                    summaryTotal.prev().hide();
                    summaryTotal.hide();
                }

                if(summaryCommissionDivs.length > 0) {
                    summaryCommissionDivs.hide();
                }
            } else {
                if (summaryTotal){
                    summaryTotal.prev().show();
                    summaryTotal.show();
                }

                if(summaryCommissionDivs.length > 0) {
                    summaryCommissionDivs.show();
                }
            }
        },
        hidePrice: function() {
            BookingUtil.hideStepPrice(this.getStepDiv());
        }

    });

    return SummaryStepLayout;
});