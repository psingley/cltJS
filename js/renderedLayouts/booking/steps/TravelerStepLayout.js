define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'renderedLayouts/booking/steps/BaseStepLayout',
    'services/bookingService',
    'util/booking/bookingUtil',
    'util/booking/travelerFormUtil',
    'views/validation/ErrorView',
    'event.aggregator',
    'views/booking/travelerInformation/TravelerListView',
    'util/objectUtil',
    'util/dataLayerUtil',
    'util/travelerUtil',
    'goalsUtil'
], function ($, _, Backbone, Marionette, App, BaseStepLayout, BookingService, BookingUtil, TravelerFormUtil, ErrorView, EventAggregator, TravelerListView, ObjectUtil, DataLayerUtil, TravelerUtil, goalsUtil) {
    var TravelerStepLayout = BaseStepLayout.extend({
        el: '#TravelerInfo',
        regions: {
            'messagesRegion': '.stepMessagesRegion',
            'travelerInformationRegion': '#travelerInformationContent'
        },
        events: {
            'click .button_next': 'submitStep'
        },
        initialize: function () {
            var outerScope = this;
            TravelerStepLayout.__super__.initialize.apply(this);
            App.Booking.travelerListView = new Backbone.ChildViewContainer();

            EventAggregator.on('getBookingComplete', function () {
                outerScope.renderTravellerList();
            });

            EventAggregator.on('roomingAndTravelersStepComplete', function () {
                outerScope.onRoomingAndTravelersStepComplete();
            });
            TravelerUtil.FillPartialTraveler();
        },
        requiredFields: ['#lblFirstName', '#lblLastName', '#lblGender', '#lblDOB', '#lblPhone', '#lblEmail', '#lblConfirmEmail', '#lblCountry', '#lblAddress', '#lblCity', '#lblZip','#lblState'],
        validateForAgent: false,
        renderTravellerList: function () {
            this.travelerInformationRegion.show(new TravelerListView({
                collection: App.Booking.travelers
            }));
            //pre-populate step 5 form with first last and email where applicable from step 2
            TravelerUtil.FillPartialTraveler();
        },
        onRoomingAndTravelersStepComplete: function () {
            this.updateSubmissionStatus();
        },
        validateTravelers: function (outerScope) {
			//get all invalid traveler views
            var invalidTravelerViews = outerScope.getSection().travelerViews;
			//iterate through them and output validation messages
			_.each(invalidTravelerViews, function (travelerView) {
                var messages = travelerView.model.validate();
                var errorView = new ErrorView(messages);
                travelerView.travelerMessagesRegion.show(errorView);
                console.log(messages);
                let inputs = document.getElementById('travelerInformationContent').querySelectorAll('.req');
                inputs.forEach((c) => {
                    let target = c.name ? c.name : "";
                    let classname = c.className ? c.className : "";
               
                    TravelerUtil.ValidationStation(target, classname);
                });
            });
            document.querySelector('.errorMessages').style.display = 'none';
            
		},
        submitStep: function (e) {
            e.preventDefault();
            let mobileErrorText = document.querySelector('.nextStep6').parentNode.parentNode.parentNode.querySelector('.mobile.errorText');
  
     
            var outerScope = this;
                if (mobileErrorText.textContent === "" && this.validateStep()) {
                BookingService.travelerInformationForm_Complete()
                    .done(function (response) {
                        App.Booking.Steps['summaryStep'].paymentForm.setTravelersDropDown();
                        App.Booking.Steps['summaryStep'].paymentForm.updateAmountDue();
                        DataLayerUtil.PaymentDataLayer('Traveler Information Form Complete');
                        TravelerUtil.AddNewContacts("input[name='firstName']", "input[name='firstName']", "input[name='lastName']", ".form-group .email");
                        BookingUtil.goToNextStep(e);

                        //submit goal for travelers's information form compelted
                        goalsUtil.bookingEngineAddTravelerInfo();
                    })
                    .fail(function () {
                        var submissionErrorText = App.dictionary.get('tourRelated.Booking.TravelerInfo.SubmissionError');
                        outerScope.messagesRegion.show(new ErrorView([submissionErrorText]));
                    });
            } else {
                //get all invalid traveler views
                this.validateTravelers(outerScope);
                $('html').animate({
                    scrollTop: 700
                }, 600);
                document.querySelector('div.stepMessagesRegion').style.display = 'none';
            }
        }
    });
    return TravelerStepLayout;
});