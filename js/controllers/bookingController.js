define([
        'domReady',
        'app',
        'jquery',
        'backbone',
        'marionette',
        'event.aggregator',
        'util/objectUtil',
        'util/booking/bookingUtil',
        'util/uriUtil',
        'objects/factories/bookingContextFactory',
        'goalsUtil',
        'util/seoTaggingUtil',
        'util/travelerUtil'
],
    function (domReady, App, $, Backbone, Marionette, EventAggregator, ObjectUtil, BookingUtil, UriUtil, BookingContextFactory,
		goalsUtil, seoTaggingUtil, TravelerUtil) {
        return Backbone.Marionette.Controller.extend({
            initialize: function () {
                //get the booking context from the factory
                var bookingId = BookingUtil.getBookingEngineId();
                var siteId = App.siteSettings.siteId;

                var bookingContextFactory;
                switch (bookingId) {
                    case '{470A4ED8-8431-4A00-B14F-37C37D1D27B8}':
                        bookingContextFactory = new BookingContextFactory({ bookingType: 'consumer', siteId: siteId });
                        break;
                    case '{A2C73404-5207-4B1C-A17B-AA5473F056CE}':
                        bookingContextFactory = new BookingContextFactory({ bookingType: 'agent', siteId: siteId });
                        break;
                    default:
                        bookingContextFactory = new BookingContextFactory({ bookingType: 'consumer', siteId: siteId });
                }
            },
            getStep: function (number) {
                var lastValidStep = App.Booking.stepValidator.getLastValidStep();

                if (number > lastValidStep) {
                    UriUtil.setHash('step/' + lastValidStep);
                    return;
                }

                //sidebar div
                var $stepNavListElement = $('#step_navigation');
                //main wrapper div
                var $main = $('#main');

                //remove the selected and highlight classes from all of the elements
                $stepNavListElement
                    .children('ul > li')
                    .removeClass('selected')
                    .addClass('highlight');

                //hide all of the steps
                $('.step').hide();

                //move current step into outerscope for activation of modules
                //set to first step and change if needed
                var $currentStep = $('div[data-step="1"]');

                //if there is no number passed in go to the first step
                if (ObjectUtil.isNullOrEmpty(number)) {
                    var firstStepNav = $stepNavListElement.children('li[data-step="1"]')[0];
                    this.selectStep(firstStepNav);

                    //change the class on the page wrapper div to the corresponding step
                    $main.addClass('step1');
                    $currentStep.show();

                    BookingUtil.renderStepButtons();
                    this.stepGoogleTrackingEvent(1);
                } else {
                    //add the selected class to the current step
                    var currentStepNav = $stepNavListElement.children('li[data-step="' + number + '"]')[0];
                    this.selectStep(currentStepNav);

                    //change the class on the page wrapper div to the corresponding step
                    $main.removeClass();
                    $main.addClass('booking_engine step' + number);
                    $currentStep = $('div[data-step="' + number + '"]');
                    $currentStep.show();

                    //get all the previous steps and add the highlight class to them
                    var previousSteps = $stepNavListElement.children('li').filter(function () {
                        return $(this).data('step') < number;
                    });

                    $(previousSteps).removeClass('highlight');
                    $(previousSteps).find('i').removeClass('fa-lock').parents('li.stepNav');
                    $(previousSteps).find('i').addClass('fa-unlock');

                    BookingUtil.renderStepButtons();
                    this.stepGoogleTrackingEvent(number);
                    //add new contacts from step 2 to localStorage
                    if (number === "2") {
                        if (document.querySelectorAll('.aTraveler') && localStorage.getItem('newContacts')) {
                            TravelerUtil.FillPartialContact();
                        } 
                     }
                }

                this.bindHovers();
	            this.adjustBookingOverviewBeforeEnteringFlightsStep(number);
            },
            bindHovers: function () {
                var timer;
                delay = 700;

                var tooltipIcons = $(".stepNav .fa-lock").parents('.stepNav');

                //unbind first so we are not bind on top of each when changing steps
                tooltipIcons.off("mouseenter mouseleave");

                if (tooltipIcons.length > 0) {
                    tooltipIcons.hover(
						function () {
						    var tip = $($(this).find("i").attr("data-lock-tooltip"));
						    timer = setTimeout(function () {
						        tip.fadeIn(150);
						    }, delay);
						    tip.css("top", "203px;");
						},
						function () {
						    clearTimeout(timer);
						    var tip = $($(this).find("i").attr("data-lock-tooltip"));
						    tip.fadeOut(150);
						    tip.css("top", "203px;");
						}
					);
                }

                tooltipIcons = $(".stepNav .fa-unlock").parents('.stepNav');

                //unbind first so we are not bind on top of each when changing steps
                tooltipIcons.off("mouseenter mouseleave");

                if (tooltipIcons.length > 0) {
                    tooltipIcons = $(".stepNav .fa-unlock");
                    tooltipIcons.hover(

						function () {
						    var tip = $($(this).attr("data-unlock-tooltip"));
						    tip.fadeIn(150);
						    tip.css("top", "203px;");
						},
						function () {
						    var tip = $($(this).attr("data-unlock-tooltip"));
						    tip.fadeOut(150);
						    tip.css("top", "203px;");
						}
					);
                }
            },
            selectStep: function (selectedStepNav) {
                $(selectedStepNav).addClass('selected');
                $(selectedStepNav).removeClass('highlight');
                $(selectedStepNav).find('i').removeClass('fa-lock');
                $(selectedStepNav).find('i').addClass('fa-unlock');

                $('.fa-unlock').parents('li.stepNav').removeClass('highlight');
            },
            stepGoogleTrackingEvent: function (number) {
                window.dataLayer = window.dataLayer || [];
                if (seoTaggingUtil.useExternalScripts() === true) {
                    //google tag manager logging for completing step 5 and moving onto summary step
                    $('.nextStep6').click(function () {
                        try {
                            var numTravelers = $('#travelerInformationContent .section').length;
                            var price = Number($('#grandTotal').text().replace(/[^0-9.]+/g, ""));
                            dataLayer.push({
                                'event': 'gaEvent',
                                'eventCategory': 'Traveler Information',
                                'eventAction': 'Booking',
                                'eventLabel': 'Continue booking with flights - ' + numTravelers,
                                'eventValue': price
                            });
                        } catch (ex) {
                            console.log(ex);
                        }
                    });

                    try {
                        dataLayer.push({
                            'event': 'gaEvent',
                            'eventCategory': 'Step Reached',
                            'eventAction': 'Booking',
                            'eventLabel': 'Booking Step ' + number
                        });

                        console.log('tracked goal for step ' + number);
                    } catch (ex) {
                        console.log(ex);
                    }
                }
            },
					adjustBookingOverviewBeforeEnteringFlightsStep:  function(number) {
						//On entering flights step adjust booking overview view.
						if (parseInt(number) === 4) {
							BookingUtil.adjustBookingOverviewOffsetInfo(true);
						}else if (parseInt(number) < 4) {
							BookingUtil.adjustBookingOverviewOffsetInfo(false);
						}
					}
        });
    });