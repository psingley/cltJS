define([
		"app",
		'jquery',
		'underscore',
		'marionette',
		'backbone',
		'tiny-slider',
		'modernizr'
],
function(App, $, _, Marionette, Backbone, TinySlider, Modernizr) {
	App.module("RiverCruisesCarousel",
		function() {
			this.startWithParent = false;
			this.addInitializer(function() {
				$('#rivercruise-carousel').carouselAccordion();
			});

			var totalItems = $('.rc-image').length;
			if (totalItems <= 3) {
				$(".rivercruises--arrows").hide();
			}
			//Carousel function provided by ETS
			$.fn.carouselAccordion = function() {

				return this.each(function() {
					var $cA = $(this);
					var $carousel = $cA.find('.carousel-riverboat--carousel');
					var $left = $cA.find('[data-slide="prev"]');
					var $right = $cA.find('[data-slide="next"]');

					//add mobile hide/show arrows
					var slider = tns({
						container: $carousel[0],
						items: 1,
						nav: false,
						controls: false,
						responsive: {
							768: {
								items: 3
							},
							480: {
								items: 2
							},
							0: {
								items: 1
							}
						}
					});

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
				});
			}
		});
	});