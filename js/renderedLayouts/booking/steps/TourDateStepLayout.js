define([
'jquery',
'underscore',
'backbone',
'marionette',
'event.aggregator',
'app',
'util/objectUtil',
'util/animationUtil',
'services/bookingService',
'util/booking/bookingUtil',
'views/validation/ErrorView',
'collections/booking/tourCustomizations/BookingPackageUpgradeCollection',
'renderedLayouts/booking/steps/BaseStepLayout',
'util/uriUtil',
'services/tourService',
'util/tourDetailUtil',
'util/dateUtil',
'goalsUtil',
'util/dataLayerUtil',
'renderedLayouts/tour/tourDates/TourDatesLayout'
], function ($, _, Backbone, Marionette, EventAggregator, App, ObjectUtil, AnimationUtil, BookingService, BookingUtil, ErrorView, PackageUpgradeCollection, BaseStepLayout, UriUtil, TourService, TourDetailUtil, DateUtil, goalsUtil, dataLayerUtil, TourDatesLayout) {

	var animationDelay = 2000;
	var loaderStartTime = new Date();

	var TourDateStepLayout = BaseStepLayout.extend({
		el: '.bookingTourDates',
		events: {
			'click .header': 'toggleDatesAccordion',
			'click .button_next': 'submitStep',
			'click .date-group': 'changeDateRow',
			'click .date-group [data-toggle="modal"]': 'showModal',
            'mouseup input[name=date]:radio': 'changeDateRadio'
		},
		ui: {
			'$buttonNext': '.button_next'
		},
		initialize: function () {
			this.constructor.__super__.initialize.apply(this);
			var outerScope = this;

			var $header = this.$el.find('.header');
			$header.html('Tour Dates');

			var $header_link = $header.find("a.arrow_down"),
			$expanded = $header.closest(".section").find('#tourDatesRegion');

			if (!ObjectUtil.isNullOrEmpty(App.Booking.cookie) && !ObjectUtil.isNullOrEmpty(App.Booking.cookie.packageDateId)) {
				var $packageDate = this.$el.find('input[value="' + App.Booking.cookie.packageDateId + '"]');

				if ($packageDate.length > 0) {
					$packageDate.prop("checked", true);
				}
			}
			else {
				UriUtil.setHash('step/1');
			}

			var $selectedDate = this.$el.find('input[name=date]:checked');

			if ($selectedDate.length > 0) {
				//$expanded.hide();
				//$header_link.addClass("close");
				this.dateChosen($selectedDate, this.ui.$buttonNext);
			}

			EventAggregator.on('getTourDatesSettingsComplete', function () {
				//Call to to web service to get the package date info.
				TourService.getDatePackages(App.siteSettings.currentItemId)
				EventAggregator.on("tourDatesRequestComplete", function (tourDatesCollection) {
					var tourDatesLayout = new TourDatesLayout({ el: '#calendar_display' });

					var packageDateSpecified = UriUtil.getParameterByName("packagedate");
					tourDatesLayout.buildTourDateSelectors(tourDatesCollection);
					if (App.Booking.cookie != undefined && App.Booking.cookie.packageDateId != "") {
						outerScope.autoSelectDate(App.Booking.cookie.packageDateId);
					}
					else {
						outerScope.autoSelectDate(packageDateSpecified);
					}
				});
			});

			EventAggregator.on('getRoomTypeComplete', function () {
				AnimationUtil.endItineraryAnimation();
			});

			TourService.getTourDatesSettings();
		},
        changeDateRow: function(e){
            if (e.target && e.target.type !== 'radio') {
                var $selectedDate = $(e.currentTarget).find("input[name=date]:radio");
                if ($selectedDate) {
                    var radio = $selectedDate[0];
                    // proceed with the request only if date is valid for booking
                    // if selected is sold out date - don't do anything
                    if (!radio.disabled && !radio.checked) {
                        this.changeDate($selectedDate,false);
                    }
                }
            }
        },
        changeDateRadio: function (e) {
            var $selectedDate = $(e.target);
            if ($selectedDate) {
                this.changeDate($selectedDate, true);
            }

            dataLayerUtil.PushTourDate('Changed Date');
   
        
        },
		changeDate: function($selectedDate, disableRadio){
            if (this.confirmationRequired) {
            	if (disableRadio) {
                    $selectedDate[0].disabled = true;
				}
                $selectedDate.trigger("confirmShow");
            }
            else {
                $selectedDate.prop("checked", true);
                this.dateChosen($selectedDate, this.$el.find('.button_next'));
            }
        
		},
		showModal: function(e) {
			e.stopPropagation();
			$($(e.currentTarget).data("target")).modal();
		},
		//Auto-selects the first available date and updates the booking overview
		autoSelectDate: function (packageDate) {
			var count = 0;
            var $selectedDate;
			if (packageDate != "") {
                $selectedDate = this.$el.find('input[name=date][value="' + packageDate + '"]');
			}
			else {
				$selectedDate = this.$el.find(".radio_col").eq(count).children().first();
               
				//If the target date is muted, try the next one
				while ($selectedDate.parent().parent().hasClass("muted") || $selectedDate.is(':disabled')) {
					$selectedDate = this.$el.find(".radio_col").eq(++count).children().first();
                }
			}
			$selectedDate.prop("checked", true);

            //push to dataLayer
         

            dataLayerUtil.PushTourDate('Auto Date');

   


            BookingUtil.adjustBookingOverviewOnSelect($selectedDate);
            if (packageDate != "" && $selectedDate.length == 1) {
                this.dateChosen($selectedDate, this.$el.find("a.button_next"));
              
            }
           
		},
		toggleDatesAccordion: function (e) {
			e.preventDefault();

			var $header = this.$el.find('.header');
			var $header_link = $header.find("a.arrow_down"),
			$expanded = $header.closest(".section").find('#tourDatesRegion');

			if ($expanded.is(":visible")) {
				$('html, body').animate({ scrollTop: $header.offset().top }, function () {
					$expanded.slideUp();
					$header_link.addClass("close");
				});
			} else {
				var position = $header.closest('.section').offset().top;

				$('body, html').animate({ 'scrollTop': position },
				function () {
					$expanded.slideDown();
					$header_link.removeClass("close");
				});
			}
		},
		submitStep: function (e) {
			e.preventDefault();

			var $selectedDate = this.$el.find('input[name=date]:checked');

			if (this.validateStep()) {
				this.dateChosen($selectedDate, e);
			}
		},
		dateChosen: function ($selectedDate, e) {
			var outerScope = this;
			var selectedDateId = $selectedDate.val();
			//if they have chosen a new date
			if (App.Booking.packageDateId != selectedDateId) {
				$('.searchAirMessagesRegion').hide();
                App.Booking.hideFlightSchedule = true;
				App.Booking.packageDateId = selectedDateId;
				//delete all orphaned travellers (to pass step validation)
				App.Booking.orphanedTravelers = new Backbone.Collection();

				BookingService.tourDateForm_Complete(selectedDateId, App.Booking.cartId)
					.done(function (response) {
						var cartId = JSON.parse(response.d);
						App.Booking.cartId = cartId;

						var cartNumber = $('#cartNumber');
						if (cartNumber.length > 0 && !ObjectUtil.isNullOrEmpty(cartId)) {
							var strCartId = cartId.toString();
							var formattedCart = strCartId.substr(0, 2) + '-' + strCartId.substr(2, 3) + '-' + strCartId.substr(5);
							cartNumber.find('text').html(formattedCart);
							cartNumber.show();
							$('#cartNumberText').show();
                            $('.totals.highlight').show(350);
                        }

                       

						//submit Goal for tour Date Form Completed
						goalsUtil.bookingEngineSelectDates();

						//if creating the cart is successful lets get the booking with the cart id and package date
                        BookingService.getBooking(App.Booking.cartId, App.Booking.packageDateId);


                        outerScope.confirmationRequired = true;
						//set up event handling for if they try to change the date later
						outerScope.$el.confirmOn({
							questionText: App.dictionary.get('tourRelated.Booking.TourDateInfo.Question'),
							textYes: App.dictionary.get('tourRelated.Booking.TourDateInfo.Yes'),
							textNo: App.dictionary.get('tourRelated.Booking.TourDateInfo.No')
						}, 'confirmShow', function (e, confirmed) {
                            var radio = $(e.target);
                            radio[0].disabled = false;
							if (confirmed) { // Clicked yes
                                radio.prop("checked", true);
								App.Booking.tourDatesSubmitted = false;
                                EventAggregator.trigger('numberOfRoomsUpdate');
								//set steps back to lock state
								var $stepNavListElement = $('#step_navigation');

								var nextSteps = $stepNavListElement.children('li').filter(function () {
									return $(this).data('step') > 2;
								});

								$(nextSteps).find('i').addClass('fa-lock');
								$(nextSteps).find('i').removeClass('fa-unlock');

								outerScope.submitted = true;

								App.Booking.assignedPackageUpgrades = new PackageUpgradeCollection();
								EventAggregator.trigger('submitTourDateComplete', $selectedDate);
								outerScope.submitStep(e);
								return true;

							} else { // Clicked no
								e.preventDefault();
							}
						});

                        EventAggregator.trigger('submitTourDateComplete', $selectedDate);
                        outerScope.goToNextStepWithLoading(outerScope.ui.$buttonNext);
						outerScope.submitted = true;
					})
				.fail(function () {
					outerScope.messagesRegion.show(new ErrorView(['There was an issue selecting this date']));
				});
            } else {
                console.log('Quantity: ' + App.Booking.travelers.length);
                BookingUtil.goToNextStep(e);
			}
		},
		unsubscribeFromEvent: function(eventName) {
			this.delegateEvents(
				_(this.events).omit(eventName)
			);
		},

		goToNextStepWithLoading: function (e) {
			AnimationUtil.startItineraryAnimationWithMetrics(loaderStartTime);
			var waitTime = animationDelay - (Date.now() - loaderStartTime);
			waitTime = waitTime > 0 ? waitTime : 0;
			setTimeout(function () {
				BookingUtil.goToNextStep(e);
			}, waitTime);
		},
	});

	return TourDateStepLayout;
});