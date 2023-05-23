define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'event.aggregator',
    'moment',
    'app',
    'renderedLayouts/booking/paymentSummary/PaymentFormLayout',
    'views/validation/InfoView'
], function ($, _, Backbone, Marionette, EventAggregator, Moment, App, PaymentFormLayout, InfoView) {
    var AgentPaymentFormLayout = PaymentFormLayout.extend({
        regions: {
            messagesRegion: '#agentPaymentMessagesRegion'
        },
        events: function () {
            var events = {
                'click #OptOutOfPayment': 'togglePaymentSection'
            };

            return _.extend(events, PaymentFormLayout.prototype.events);
        },
        initialize: function () {
        	var outerScope = this;

			//hide an option to delay payment when an instant purchase air is chosen
			EventAggregator.on('flightIsChosen', function(isFlexible) {
				var cbxOptOutPayment = $('#OptOutOfPayment');
				if (cbxOptOutPayment.length > 0) {
					if (!isFlexible) {
						cbxOptOutPayment.closest('.pad').hide();
					} else {
						cbxOptOutPayment.closest('.pad').show();
					}
				}
			});

        	EventAggregator.on('updateBookingInfoComplete', function (booking) {
        		var cbxOptOutPayment = $('#OptOutOfPayment');
        		if (cbxOptOutPayment.length > 0) {
        			var departureDate = new Moment(booking.startDate);
        			var today = new Moment().startOf('day');

        			var daysUntilDepart = departureDate.diff(today, 'days', true);
        			if (daysUntilDepart < 60) {
        				cbxOptOutPayment.attr('disabled', true);
        				cbxOptOutPayment.parent().addClass("muted");
        				var message = App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.CannotOptOutPayment');
        				outerScope.messagesRegion.show(new InfoView([message]));
        			} else {
        				cbxOptOutPayment.attr('disabled', false);
        				cbxOptOutPayment.parent().removeClass("muted");
        				outerScope.messagesRegion.close();
        			}
        		}
        	});

        	EventAggregator.on('submitTourDateComplete', function () {
        		var $cartInput = outerScope.$el.find('#hCartId');
        		var $packageDateIdInput = outerScope.$el.find('#hPackageDateId');

        		$cartInput.val(App.Booking.cartId);
        		$packageDateIdInput.val(App.Booking.packageDateId);
        	});
        },
        togglePaymentSection: function () {

        	var paymentHeaderSection = this.$el.find('.passenger_payment_header');
        	var paymentAddressSection = this.$el.find('.passenger_payment_address');
        	var paymentChoiceSection = this.$el.find('.passenger_payment_choice');

        	var paymentSection = this.$el.find('#paymentForm');

            var cbxOptOutPayment = this.$el.find('#OptOutOfPayment');

            if (cbxOptOutPayment.is(':checked')) {
            	paymentHeaderSection.slideUp();
            	paymentChoiceSection.slideUp();
            	paymentAddressSection.slideUp();
            	paymentSection.slideUp();

            } else {
            	paymentHeaderSection.slideDown();
            	paymentChoiceSection.slideDown();
            	paymentAddressSection.slideDown();
            	paymentSection.slideDown();
            }
        },
        validateAddressForm: function() {
        	var errorMessages = [];
        	var cbxOptOutPayment = this.$el.find('#OptOutOfPayment');

        	//if we don't have the out out payment checkbox lets call the consumer validation
        	if (_.isEmpty(cbxOptOutPayment)) {
        		return AgentPaymentFormLayout.__super__.validateAddressForm.apply(this);
        	}

        	var optOut = cbxOptOutPayment.is(':checked');

        	//if they are not opting out do normal consumer validation
        	if (!optOut) {
        		return AgentPaymentFormLayout.__super__.validateAddressForm.apply(this);
        	}

        	return errorMessages;
        },
        validateBillingForm: function () {
            var errorMessages = [];
            var cbxOptOutPayment = this.$el.find('#OptOutOfPayment');
            var cbxAcceptUnchecked = this.$el.find('#Accept').not(':checked').length > 0;
            var hzdAcceptUnchecked = this.$el.find('#AcceptHazardousMaterials').not(':checked').length > 0;

            var requiredAcceptTerms = App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.AcceptTerms');
            var requiredHazardousMaterialsTerms = App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.AcceptHazardousMaterialsTerms');

            //if we don't have the opt out payment checkbox lets call the consumer validation
            //if they are not opting out do normal consumer validation
            if (_.isEmpty(cbxOptOutPayment) || !cbxOptOutPayment.is(':checked')) {
                return AgentPaymentFormLayout.__super__.validateBillingForm.apply(this);
            }

            //if they are opting out make sure available checkboxes are checked.
            if (cbxAcceptUnchecked) {
            	errorMessages.push(requiredAcceptTerms);
            }
            if (hzdAcceptUnchecked) {
            	errorMessages.push(requiredHazardousMaterialsTerms);
            }

            return errorMessages;
        }
    });
    return AgentPaymentFormLayout;
});