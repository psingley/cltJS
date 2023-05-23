define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'app',
		'collections/tourDetailPage/itineraries/ItineraryItemCollection',
		'views/tourDetailPage/itineraries/ItineraryDayItemView',
		'tiny-slider'
	],
	function($,
		_,
		Backbone,
		Marionette,
		App,
		ItineraryItemCollection,
		ItineraryDayItemView,
		TinySlider) {
		var ItineraryDayListView = Backbone.Marionette.CollectionView.extend({
			collection: ItineraryItemCollection,
			itemView: ItineraryDayItemView,
			initialize: function() {},
			onShow: function() {

				//to remove extra divs added by backbone while rendering view
				var divTags = $(".day-carousel--slider .day");
				if (divTags.parent().is("div"))
					divTags.unwrap();
				if (divTags.parent().is("div"))
					divTags.unwrap();

				var outerscope = this;

				$.fn.itineraryController = function() {
					return this.each(function() {

						var $tour = $(this);

						var $carousel = $tour.find('.day-carousel');
						var $slider = $carousel.find('.day-carousel--slider');
						var $left = $carousel.find('[data-slide="prev"]');
						var $right = $carousel.find('[data-slide="next"]');
						var $dayAccordionWrap = $tour.find('.day-accordion-wrap');

						var slider;
						/* Day Carousel */
						if (outerscope.collection.length > 5) {
							slider = tns({
								container: $slider[0],
								items: 6,
								nav: false,
								controls: false
							});
						} else {
							slider = tns({
								container: $slider[0],
								items: outerscope.collection.length,
								nav: false,
								controls: false
							});
						}

						$left.on('click',
							function(e) {
								slider.goTo('prev');
								e.preventDefault();
							});

						$right.on('click',
							function(e) {
								slider.goTo('next');
								e.preventDefault();
							});

						if (window.innerWidth > '768' && outerscope.collection.length < 7) {
							$('.day-carousel--arrows').hide();
						}

						/*var dayAccordion = $('.day');
						_.each(dayAccordion,
							function(day) {
								var val = $(day).data();
								if (val.day == "1" || val.day == "1 - 2") {
									$(day).addClass("day-selected");
								}
							});
*/
						$slider.on('click',
							'.day',
							function() {
								var $day = $(this);
								if (!$day.hasClass('day-selected')) {
									$slider.find('.day-selected').removeClass('day-selected');
									$day.addClass('day-selected');
									$dayAccordionWrap.find('.day-selected').removeClass('day-selected');
									$dayAccordionWrap.find('[data-day="' + $day.attr('data-day') + '"]').addClass('day-selected');
								}
							});
					});
				};
				$('.tour-itinerary').itineraryController();
			}
		});

		return ItineraryDayListView;
	});