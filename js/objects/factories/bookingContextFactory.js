define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'objects/booking/stepValidation/agentStepValidation',
    'objects/booking/StepValidation/consumerStepValidation',
    'objects/booking/context/agentBookingContext',
    'objects/booking/context/consumerBookingContext',
    'objects/booking/stepValidation/thomasCook/tcAgentStepValidation',
    'objects/booking/StepValidation/thomasCook/tcConsumerStepValidation',
    'objects/booking/context/thomasCook/tcAgentBookingContext',
    'objects/booking/context/thomasCook/tcConsumerBookingContext',
    'objects/booking/context/aaa/aaaAgentBookingContext',
    'objects/booking/context/aaa/aaaConsumerBookingContext',
    'objects/booking/context/ca/caAgentBookingContext',
	'objects/booking/context/ca/caConsumerBookingContext'
], function ($, _, Backbone, Marionette, App, AgentStepValidation, ConsumerStepValidation, AgentBookingContext, ConsumerBookingContext, TCAgentStepValidation, TCConsumerStepValidation, TCAgentBookingContext, TCConsumerBookingContext, AAAAgentBookingContext, AAAConsumerBookingContext, CAAgentBookingContext, CAConsumerBookingContext) {

    var bookingContextFactory = (function () {

        /**
         * Gets the correct booking context based on the site id
         *
         * @class bookingContextFactory
         * @param options
         */
        var constructor = function (options) {

            /**
             * @method getColletteBookingContext
             * returns void
             */
            var getColletteBookingContext = function () {
                if (options.bookingType === 'agent') {
                    App.Booking.stepValidator = new AgentStepValidation();
                    App.Booking.context = new AgentBookingContext();
                } else if (options.bookingType === 'consumer') {
                    App.Booking.stepValidator = new ConsumerStepValidation();
                    App.Booking.context = new ConsumerBookingContext();
                }
            };

            var getCanColletteBookingContext = function () {
                if (options.bookingType === 'agent') {
                    App.Booking.stepValidator = new AgentStepValidation();
                    App.Booking.context = new CAAgentBookingContext();
                } else if (options.bookingType === 'consumer') {
                    App.Booking.stepValidator = new ConsumerStepValidation();
                    App.Booking.context = new CAConsumerBookingContext();
                }
            };

            /**
             * @method getThomasCookBookingContext
             * returns void
             */
            var getThomasCookBookingContext = function () {
                if (options.bookingType === 'agent') {
                    App.Booking.stepValidator = new TCAgentStepValidation();
                    App.Booking.context = new TCAgentBookingContext();
                } else if (options.bookingType === 'consumer') {
                    App.Booking.stepValidator = new TCConsumerStepValidation();
                    App.Booking.context = new TCConsumerBookingContext();
                }
            };

            /**
             * @method getAAABookingContext
             * returns void
             */
            var getAAABookingContext = function () {
                if (options.bookingType === 'agent') {
                    App.Booking.stepValidator = new AgentStepValidation();
                    App.Booking.context = new AAAAgentBookingContext();
                } else if (options.bookingType === 'consumer') {
                    App.Booking.stepValidator = new ConsumerStepValidation();
                    App.Booking.context = new AAAConsumerBookingContext();
                }
			};

			var getIntervalBookingContext = function () {
				if (options.bookingType === 'agent') {
					App.Booking.stepValidator = new AgentStepValidation();
					App.Booking.context = new AgentBookingContext();
				} else if (options.bookingType === 'consumer') {
					App.Booking.stepValidator = new ConsumerStepValidation();
					App.Booking.context = new ConsumerBookingContext();
				}
			};

            //make sure that Collette US is last
            if (options.siteId === App.siteIds.ThomasCook) {
                getThomasCookBookingContext();
                console.log('Thomas Cook booking context called');
            } else if (options.siteId === App.siteIds.Collette && App.siteSettings.siteLanguage === "en-GB") {
                getThomasCookBookingContext();
                console.log('Collette UK booking context called');
            }
            else if (options.siteId === App.siteIds.AAA) {
                getAAABookingContext();
                console.log('AAA booking context called');
            }
            else if (options.siteId === App.siteIds.Collette && App.siteSettings.siteLanguage === "en-CA") {
                getCanColletteBookingContext();
                console.log('CAN booking context called');
			}
			else if (options.siteId === App.siteIds.Interval) {
				getIntervalBookingContext();
				console.log('Interval booking context called');
			}
            else {
                getColletteBookingContext();
                console.log('Collette US booking context called');
            }
        };

        return constructor;
    })();
    return bookingContextFactory;
});