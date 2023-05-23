/**
 * Base class used for all step renderedLayouts
 *
 * @class BaseStepLayout
 * @extends Backbone.Marionette.Layout
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'views/validation/WarningView',
    'views/validation/ErrorView',
    'views/validation/SuccessView',
    'util/booking/bookingUtil',
	'util/htmlUtil',
    'util/objectUtil'
], function ($, _, Backbone, Marionette, App, EventAggregator, WarningView, ErrorView, SuccessView, BookingUtil, HtmlUtil, ObjectUtil) {
    var BaseStepLayout = Backbone.Marionette.Layout.extend({
        regions: {
            'messagesRegion': '.stepMessagesRegion'
        },
        events: {
            'click .button_next': 'submitStep'
        },
        initialize: function () {
            this.getStepDiv();
            this.getSection();
            this.submitted = false;
            this.stepPrice = 0;
            let chec = document.querySelector(".hotelType input");

        },
        validateStepWithoutAnimation: function () {
        	var $section = this.$el.closest('.step');
        	var step = $section.data('step');
        	var nextStepNumber = parseInt(step) + 1;

        	if (!BookingUtil.validateStep(nextStepNumber)) {
                this.messagesRegion.reset();
        		this.messagesRegion.show(new ErrorView(this.section.messages));
        		this.messagesRegion.$el.show();
        		return false;
        	} else {
        		this.messagesRegion.close();

        		this.submitted = true;
        		return true;
        	}
        },
        /**
         * Checks to see if the current step is valid along
         * with the steps before it
         *
         * @method validateStep
         * @returns {boolean}
         */
        validateStep: function () {
            var $section = this.$el.closest('.step');
            var step = $section.data('step');
            var nextStepNumber = parseInt(step) + 1;

            var travelerViews = this.section.travelerViews;

            if (!BookingUtil.validateStep(nextStepNumber)) {
                if (this.section.messages.length !== 0) {
                    this.messagesRegion.reset();
                    this.messagesRegion.show(new ErrorView(this.section.messages));
                    this.messagesRegion.$el.show();
                }
                return false;
            } else {
            	this.messagesRegion.close();

                _.each(travelerViews, function (travelerView) {
                    travelerView.travelerMessagesRegion.close();
                });

                $('html, body').animate({ scrollTop: $('.bookingEngineSidebar').offset().top }, 'fast');

	            this.submitted = true;
                return true;
            }
        },
        /**
         * Gets the section defined in the step validator class
         *
         * @method getSection
         * @returns {*}
         */
        getSection: function () {
            if (ObjectUtil.isNullOrEmpty(this.section)) {
                var $step = this.$el.closest('.step');
                var sectionId = $step.data('section-id');

                this.section = _.find(App.Booking.stepValidator.sections, function (section) {
                    return section.id == sectionId;
                });
            }
            return this.section;
        },
        /**
         * Sets the submission status back to false for this particular step
         *
         * @method updateSubmissionStatus
         */
        updateSubmissionStatus: function () {
            console.log('setting submission status to false for step ' + this.constructor.name);
            this.submitted = false;
        },
        /**
         * Gets the closest parent step div
         *
         * @method getStepDiv
         * @returns {*}
         */
        getStepDiv: function () {
            if (ObjectUtil.isNullOrEmpty(this.$step)) {
                this.$step = this.$el.closest('.step');
            }
            return this.$step;
        },
        /**
         * Updates booking info in sidenav
         *
         * @method updateBookingInfo
         * @param response
         */
        updateBookingInfo: function (response) {

            try {
                var bookingResponse = JSON.parse(response.d);
                var summaryFields = bookingResponse.summaryFields;
                App.Booking.depositAmount = summaryFields.depositAmount;
                if (bookingResponse.passengerWasAutoInit)
                    App.Booking.passengerAutoInit = true;

                if (!ObjectUtil.isNullOrEmpty(bookingResponse.cartDetailItems)) {
                    App.Booking.cartDetailItems.setCartDetailItems(bookingResponse.cartDetailItems);

                    BookingUtil.setSummaryTotal();
                    BookingUtil.setCommissionTotal();
                    App.Booking.Steps['summaryStep'].calculateStepPrice();
                }

                BookingUtil.setSummaryFields(summaryFields, bookingResponse.totalCommissionLocal);
                BookingUtil.adjustBookingOverview(bookingResponse);

                EventAggregator.trigger('updateBookingInfoComplete', bookingResponse);
            } catch (e) {
                console.log("error in updateBookingInfo response=" + response);
            }
        }
    });
    return BaseStepLayout;
});