define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'app',
	'event.aggregator',
	'views/tourDetailPage/tourExtensions/TourExtensionView',
	'collections/tourDetailPage/tourExtensions/TourExtensionCollection',
	'tiny-slider', 'modernizr'
],
	function ($,
		_,
		Backbone,
		Marionette,
		App,
		EventAggregator,
		TourExtensionView,
		TourExtensionCollection,
		TinySlider,
		Modernizr) {
		var TourExtensionListView = Backbone.Marionette.CollectionView.extend({
			collection: TourExtensionCollection,
			itemView: TourExtensionView,
			initialize: function () {
				//atam not working
				//var $button = $(this);
				//var $detailsButton = $button.find('[data-button="details"]');
				//$detailsButton.unbind('click');
				//$detailsButton.bind('click');
			},
			onShow: function () {

				//to remove extra divs added by backbone while rendering view
				var divTag = $(".carousel-accordion--img");
				if (divTag.parent().parent().is("div"))
					divTag.parent().unwrap();

				$('#tour_detail_extensions_section_container').show();

				var totalExt = this.collection.length;

				if (totalExt == 1) {
					$('.carousel-accordion--arrows').hide();
				}
				else if (totalExt < 4 && window.innerWidth > '768') {
					$('.carousel-accordion--arrows').hide();
				} else {
					$('.carousel-accordion--arrows').show();
				}

				//Carousel function provided by ETS
				$.fn.carouselAccordion = function (totalExt) {

					return this.each(function () {

						var $cA = $(this);
						var $carousel = $cA.find('.carousel-accordion--carousel');
						var $accordion = $cA.find('.carousel-accordion--accordion');
						var $close = $accordion.find('.accordion-close-btn');
						var $left = $cA.find('[data-slide="prev"]');
						var $right = $cA.find('[data-slide="next"]');
						var $span = $accordion.find('[data-span="extension-details"]');



						//when date switched close the accordion details
						if ($accordion.hasClass('is-open')) {
							$accordion.removeClass('is-open');
						}

						if (totalExt > 1) {
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
								function (e) {
									slider.goTo('prev');
									e.preventDefault();
								});

							$right.on('click',
								function (e) {
									slider.goTo('next');
									e.preventDefault();
								});
						}
						else if (totalExt == 1) {
							var isContainSlider = $carousel[0].classList.contains('tns-slider');
							if (isContainSlider) {
								/* To remove 2 parent DIV tags added by slider, unwrap() called 2 times*/
								$carousel.unwrap();
								$carousel.unwrap();

								_.each($carousel[0].classList, function (className) {
									if (className.includes('tns-')) {
										$carousel.removeClass(className);
									}
								});
								$carousel.removeAttr('id');
								$carousel.removeAttr('style');
							}
						}


						$accordion.on('click',
							'[data-button="please-note"]',
							function (e) {

								if ($('.please-note-accordion').hasClass('is-open')) {
									$('.please-note-accordion').removeClass('is-open');
									$('.please-note').addClass('btn-primary');
									$('.please-note').find('span').removeClass('fa-angle-up');
									$('.please-note').find('span').addClass('fa-angle-down');
								}
								else {
									$('.please-note-accordion').addClass('is-open');
									$('.please-note').removeClass('btn-primary');
									$('.please-note').find('span').addClass('fa-angle-up');
									$('.please-note').find('span').removeClass('fa-angle-down');
								}

							});

						$carousel.on('click',
							'[data-button="details"]',
							function (e) {

								var $carouselHasIsActive = $carousel.hasClass('.is-active')

								//please notes are open then close it
								if ($('.please-note-accordion').hasClass('is-open')) {
									$('.please-note-accordion').removeClass('is-open');
									$('.please-note').addClass('btn-primary');
									$('.please-note').find('span').removeClass('fa-angle-up');
									$('.please-note').find('span').addClass('fa-angle-down');
								}

								if ($(this).hasClass('is-active') == false) {
									var $buttonActive = $carousel.find('.is-active');
									$buttonActive.removeClass('is-active');
									var $activeSpan = $buttonActive.find('[data-span="extension-details"]');
									$activeSpan.removeClass('up');
									$activeSpan.addClass('down');
									if ($accordion.hasClass('is-open')) {
										$accordion.removeClass('is-open');
									}
								}

								var $button = $(this);


								/*
								if ($button != $buttonActive) {
									//return to start state
									$buttonActive.removeClass('is-active');
									var $activeSpan = $buttonActive.find('[data-span="extension-details"]');
									$activeSpan.removeClass('up');
									$activeSpan.addClass('down');
									if ($accordion.hasClass('is-open')) {
										$accordion.removeClass('is-open');
									}
								}
								*/
								//$carousel.find('.is-active').removeClass('is-active');

								var $span = $button.find('[data-span="extension-details"]');
								$button.addClass('is-active');
								var $parent = $button.parent();
								var $title = $parent.find('.carousel-accordion--title');
								var $text = $parent.find('.carousel-accordion--text');


								//show "Notes" button
								var $notes = $parent.find('.carousel-accordion--note');
								var $highlights = $parent.find('.detailhighlights');
								$accordion.find('.row').html($highlights.html());
								$accordion.find('h5').html($title.html());
								$accordion.find('p').html($text.html());

								//styling notes
								var brExp = /<br\s*\/?>/i;
								var notesList = $notes.html().split(brExp);
								notesList.shift();
								var notesHtml = "<ul><li>" + notesList.join("</li><li>") + "</li></ul>";
								var pleaseNote = $accordion.find('#please-note');
								pleaseNote.html(notesHtml);

								var totalTitles = $carousel.find('.carousel-accordion--title');
								_.each(totalTitles, function (title) {
									if ($(title).html() == $title.html())
										$(title).parent().find('.btn').addClass('is-active');
								});
								if ($accordion.hasClass('is-open')) {
									$accordion.removeClass('is-open');
									$carousel.find('.is-active').removeClass('is-active');
									$span.removeClass('up');
									$span.addClass('down');
									e.stopImmediatePropagation();
									return;
								}
								$accordion.addClass('is-open');
								$span.removeClass('down');
								$span.addClass('up');

								e.stopImmediatePropagation();
							});

						$close.on('click',
							function () {
								var $buttonActive = $carousel.find('.is-active');
								$accordion.removeClass('is-open');
								$buttonActive.removeClass('is-active');
								var $activeSpan = $buttonActive.find('[data-span="extension-details"]');
								$activeSpan.removeClass('up');
								$activeSpan.addClass('down');
							});
					});
				};

				$('#extension-carousel').carouselAccordion(totalExt);
			}
		});
		// Our module now returns our view
		return TourExtensionListView;
	});