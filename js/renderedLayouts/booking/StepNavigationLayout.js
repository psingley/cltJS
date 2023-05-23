define([
    'jquery',
    'underscore',
    'backbone',
    'event.aggregator',
    'util/booking/bookingUtil',
    'util/uriUtil',
    'util/objectUtil',
    'util/travelerUtil',
    'app'
], function ($, _, Backbone, EventAggregator, BookingUtil, UriUtil, ObjectUtil, TravelerUtil, App) {
    var StepNavigationLayout = Backbone.Marionette.Layout.extend({
        el: "#step_navigation",
        events: {
            'click .stepNav a': 'changeStep',
            'click .hide-commission': 'changeHideCommissionState'
        },
		initialize: function() {
			var tooltipIcons = $(".tooltip-icon");
			if (tooltipIcons.length > 0) {
				tooltipIcons.hover(
					function() {
						$($(this).attr("data-tooltip")).fadeIn(150);
					},
					function() {
						$($(this).attr("data-tooltip")).fadeOut(150);
					}
				);
			}
            this.initHideCommissionState();
		},
        changeStep: function (e) {
            e.preventDefault();
            //we need to get the li parent of the link
            var step = $(e.target).closest('.stepNav');
            var stepNumber = step.data('step');

            //make sure this item isn't already selected
            var submitted = this.checkStepSubmitted(stepNumber);
            if (!submitted) {
                return;
            }

            if (!step.hasClass('selected') && submitted) {
                if (BookingUtil.validateStep(stepNumber)) {
                    UriUtil.setHash('step/' + stepNumber);
                }
            }
        },
        checkStepSubmitted: function(stepNumber){
            var $stepEl = this.$el.find('.selected');
            if($stepEl.length == 0){
                console.log('there is no step currently selected');
                return false;
            }

            var currentStepNumber = $stepEl.data('step');
            //if we are going backwards
            if (parseInt(currentStepNumber) >= stepNumber) {
                return true;
            }

            var $stepIdEl = $stepEl.find('a');
            var sectionId = $stepIdEl.data('sectionid');

            for(var step in App.Booking.Steps){
                var currentStep = App.Booking.Steps[step];
                if(currentStep.section.id === sectionId){
                    return currentStep.submitted;
                }
            }

            console.log('could not find step layout to see if it has been submitted');
            return false;
        },
        showHideCommission: function() {
            var commission = $('#commission');
            if(BookingUtil.isCommissionHidden()) {
                commission.prev().hide();
                commission.hide();
            } else {
                commission.prev().show();
                commission.show();
            }
        },
        changeHideCommissionState: function() {
            var hide_commission = $('.hide-commission');
            if (BookingUtil.isCommissionHidden()) {
                hide_commission.text(App.dictionary.get('tourRelated.Booking.HideCommissions'));
                BookingUtil.setHideCommissionCookie(false);
                hide_commission.attr('commission-hidden', false);
            } else {
                hide_commission.text(App.dictionary.get('tourRelated.Booking.ShowCommissions'));
                BookingUtil.setHideCommissionCookie(true);
                hide_commission.attr('commission-hidden', true);
            }
            EventAggregator.trigger('hideCommissionCheckboxStateChanged');
            this.showHideCommission();
        },
        //set commission-hidden attribute from cookie, send event to SummaryStepLayout
        initHideCommissionState: function() {
            var hide_commission = $('.hide-commission');
            if(hide_commission !== undefined) {
                var commissionCookie = BookingUtil.getHideCommissionCookie();

                if(ObjectUtil.isNullOrEmpty(commissionCookie)) {
                    commissionCookie = hide_commission.attr('commission-hidden');
                    BookingUtil.setHideCommissionCookie(commissionCookie);
                } else {
                    hide_commission.attr('commission-hidden', commissionCookie);
                }

                if(commissionCookie === 'true') {
                    hide_commission.text(App.dictionary.get('tourRelated.Booking.ShowCommissions', 'Show Commissions'));
                } else {
                    hide_commission.text(App.dictionary.get('tourRelated.Booking.HideCommissions', 'Hide Commissions'));
                }

                this.showHideCommission();

                EventAggregator.trigger('hideCommissionCheckboxStateChanged');
            }
        }
    });

    return StepNavigationLayout;
});