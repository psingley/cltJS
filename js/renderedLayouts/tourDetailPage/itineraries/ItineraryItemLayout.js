define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'views/tourDetailPage/itineraries/ItineraryDayListView',
	'views/tourDetailPage/itineraries/ItineraryDescriptionListView',
	'views/tourDetailPage/itineraries/ItineraryDayByDayListView',
    'event.aggregator',
    'util/objectUtil'
], function ($, _, Backbone, Marionette, App, ItineraryDayListView, ItineraryDescriptionListView, ItineraryDayByDayListView, EventAggregator, ObjectUtil) {
    var ItineraryItemLayout = Backbone.Marionette.Layout.extend({
    	el: '.tour-itinerary',
		regions: {
			dayView: ".day-carousel--slider",
			descriptionView: ".day-accordion-wrap",
			mapView: ".itinerary-map",
			dayByDayView: "#fullItinerary"
		},
		initialize: function () {
			var viewContext = this;

            if (!ObjectUtil.isNullOrEmpty($('#itineraryAgentInfo').data("is-logged-in"))) {
                this.setAgentItineraryPrintView($('#itineraryAgentInfo').data("is-logged-in").toLowerCase() === "true");
            }			

			EventAggregator.on("setAgentItineraryPrintView", function (isLoggedIn, loginData) {
				viewContext.setAgentItineraryPrintView(isLoggedIn, loginData);
			});

			//check clientbase before appending
			var isClientBase = $('#clientBase').val();
			if (isClientBase.toLowerCase() == "false") {
				$('head').append('<script data-pid="1092047" data-ids="147912" data-lang="en" data-app="vfmGalleryReflections" data-theme="default" data-id="vfmviewer" src="https://deeljyev3ncap.cloudfront.net/galleries/player/loader.min.js" type="text/javascript" charset="UTF-8"><\/script>');
			}
			/**
			* @event tourDetailsRequestComplete
			*/
			EventAggregator.on('tourDetailsRequestComplete',
				function (tourDetailsModel) {
					if (tourDetailsModel.tourItinerary != null & tourDetailsModel.tourItinerary.length > 0) {
						viewContext.showItineraryCarousel(tourDetailsModel.tourItinerary);
						/* mobile itinerary header classes */
						if ($('.year-selector-main').find('.callToBookButton').length) {
							$('.year-selector-main').find('.mobile-copy, .col-xs-4, .col-xs-8').addClass('call-to-book-active');
							if ($('.col-xs-8.call-to-book-active').children.length > 2) {
								$('.col-xs-8.call-to-book-active').addClass('three-year-buttons');
								$('.year-selector-main').find('.mobile-copy').addClass('three-year-buttons');
							}
						}
					} else {
						$('.tour-itinerary').hide();
					}
				});

			/*Day Accordion*/
			$('.day-accordion-wrap').on('click',
				'.day-accordion-tab',
				function () {
					var $parent = $(this).parent();
					$parent.toggleClass('accordion-open');
					if ($parent.hasClass('accordion-open')) {
						$('html, body').animate({
								scrollTop: $parent.offset().top
							},
							500);
					}
				});

			/* Additional Info */
			var $additionalInfo = $('.before-you-go'),
       $headerItinBtn =  $('.viewItinBtn'),
			 $notesInfoBtn = $additionalInfo.find('[data-button="more-info"]'),
			 $dayByDayItinBtn = $additionalInfo.find('[data-button="day-list-info"]'),
			 $notesInfo = $('.notes-accordion'),
			 $daysInfo = $('.itinDayByDay'),
			 $notesClose = $notesInfo.find('.accordion-close-btn'),
			 $daysClose = $daysInfo.find('.accordion-close-btn'),
			 $printItinerary = $additionalInfo.find('[data-button="print-itinerary"]');

			$printItinerary.on('click',
				function () {
					window.print();
				});

			if ($additionalInfo.hasClass('is-open')) {
				$additionalInfo.removeClass('is-open');
			}
			$notesInfoBtn.on('click',
				function () {
					viewContext._togglingFunction($daysInfo, $notesInfo);
				});
			$notesClose.on('click',
				function () {
					viewContext._animateToggle($notesInfo, $additionalInfo);
				});

			$dayByDayItinBtn.on('click',
				function () {
					viewContext._togglingFunction($notesInfo, $daysInfo);
				});

      $headerItinBtn.on('click',
      function () {
        $('html, body').animate({scrollTop: $(".before-you-go").offset().top + (-140)}, 1000);
        $daysInfo.addClass('is-open');
      });

			$daysClose.on('click',
				function () {
					viewContext._animateToggle($daysInfo, $additionalInfo);
				});

		},
		showItineraryCarousel: function (itineraries) {
			$('.tour-itinerary').show();
			this.dayView.show(
				new ItineraryDayListView(
					{
						collection: itineraries
					})
			);
			this.descriptionView.show(
				new ItineraryDescriptionListView({
					collection: itineraries
				})
			);
			this.dayByDayView.show(
				new ItineraryDayByDayListView({
					collection: itineraries
				})
			);
		},
		_animateToggle: function ($togglingElement, $infoSection) {
			$togglingElement.removeClass('is-open');
			$('html, body').animate({
				scrollTop: $infoSection.offset().top - 250
			},
				 0);
		},
		_togglingFunction: function ($closingInfo, $openedInfo) {
			if ($closingInfo.hasClass('is-open')) {
				$closingInfo.removeClass('is-open');
			}
			$openedInfo.toggleClass('is-open');
		},

		setAgentPrintText: function($parentEl, dataset, removeText) {
			// Write each data attribute's text to its respective element
			for (var dataAttr in dataset) {
				var $infoEl = $parentEl.find('.' + dataAttr.toLowerCase());
				if (dataset[dataAttr] != '') {
					$infoEl.show().text(dataset[dataAttr]);
				} else {
					$infoEl.hide();
				}
			}
		},

		setAgentItineraryPrintView: function(isLoggedIn, loginData) {
            var $itineraryAgentInfo = $('#itineraryAgentInfo'),
                userDataSet = null,
                itineraryAgentInfoData = document.getElementById('itineraryAgentInfoData');
            if (!ObjectUtil.isNullOrEmpty(itineraryAgentInfoData)) {
                userDataSet = itineraryAgentInfoData.dataset;
            }
			/* User data comes from SSOService JSON if logging in on tour detail page
			User data comes from TourDetailContent and is written to DOM if already logged in */
			if (isLoggedIn === true) {
				$itineraryAgentInfo.show().css({ 'display': 'flex' });
				if (loginData != undefined) {
					userDataSet = loginData;
				}
				this.setAgentPrintText($itineraryAgentInfo, userDataSet)
			} else {
				// Clear agent data from jquery cache and from data attributes/elements
				$itineraryAgentInfo.hide().removeData().find('.agent-info').empty();
				for (var data in userDataSet) {
					userDataSet[data] = '';
				}
			}
		}
	});
    // Our module now returns our view
    return ItineraryItemLayout;
});
