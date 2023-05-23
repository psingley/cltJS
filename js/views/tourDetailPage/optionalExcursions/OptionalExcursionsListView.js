define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'app',
		'event.aggregator',
		'views/tourDetailPage/optionalExcursions/OptionalExcursionsItemView',
		'collections/tourDetailPage/optionalExcursions/OptionalExcursionsCollection'
	],
	function($,
		_,
		Backbone,
		Marionette,
		App,
		EventAggregator,
		OptionalExcursionsItemView,
		OptionalExcursionsCollection) {
		var TourOptionalExcursionsListView = Backbone.Marionette.CollectionView.extend({
			collection: OptionalExcursionsCollection,
			itemView: OptionalExcursionsItemView,
			initialize: function() {},
			onShow: function() {

				$('#tour-optional-excursions-section-container').show();

				//to remove extra divs added by backbone while rendering view
				this.$el = this.$el.children();
				this.$el.unwrap();

				$.fn.showMoreAccordionComponent = function() {
					return this.each(function() {
						var $accordion = $(this);
						var $list = $accordion.find('.show-more-accordion-list');
						var $items = $list.children();
						var $controls = $accordion.find('.show-more-accordion-controls');
						var $open = $accordion.find('[data-button="show-more"]');
						var $showingText = $controls.find('#showing-text');

						if ($controls.hasClass('hide')) {
							$controls.removeClass('hide');
						}

						if ($controls.hasClass('fade')) {
							$controls.removeClass('fade');
						}

						if ($list.hasClass('is-open')) {
							$list.removeClass('is-open');
							$list.css('max-height','');
						}

						// if 4 items or less hide the controls and don't do any accordion functionality
						if ($items.length <= 4) {
							// load all the images
							$accordion.find('[data-background]')
								.each(function() {
									$(this).css('background-image', 'url("' + $(this).attr('data-background') + '")');
								});
							// hide the controls
							$controls.addClass('hide');

						} else { // else only load the visible images and activate the show more button

							if ($showingText) {
								$showingText.html('Showing 3 of ' + $items.length);
							}
							$accordion.find('[data-background]')
								.slice(0, 3)
								.each(function() {
									$(this).css('background-image', 'url("' + $(this).attr('data-background') + '")');
								});

							//to get 4th image of excursions and set that as background image when there is overlay box
							var fourth = $accordion.find('[data-background]').slice(3, 4);
							var u = fourth.attr('data-background');
							$controls.find('.accordion-banner').attr('data-background', u);


							$controls.find('[data-background]')
								.each(function() {
									$(this).css('background-image', 'url("' + $(this).attr('data-background') + '")');
								});

							// hide the extra blades
							$items.slice(3)
								.each(function() {
									$(this).css('display', 'none');
								});

							// show more click
							$open.on('click',
								function() {

									// set the max-height for a transition
									var height = $list.height();
									console.log('closed height is ' + height);
									$list.css('max-height', height);

									// load the other images
									$accordion.find('[data-background]')
										.slice(3)
										.each(function() {
											$(this).css('background-image', 'url("' + $(this).attr('data-background') + '")');
										});

									// show the extra blades
									$items.slice(3)
										.each(function() {
											$(this).css('display', 'block');
										});

									// expand the content then hide the controls
									$list.addClass('is-open');
									$controls.addClass('fade');
									setTimeout(function() {
											$list.css('max-height', 30000);
										},
										5);
									setTimeout(function() {
											$controls.addClass('hide');
											console.log('opened height is ' + $list.height());
										},
										500);
								});
						}
					});
				};

				$.fn.fullAccordionComponent = function() {
					return this.each(function() {

						var $accordian = $(this);
						var $open = $accordian.find('[data-button="see-more"]');
						var $close = $accordian.find('.accordion-close-btn');
						var $span = $accordian.find('[data-span="see-more"]');

						$open.on('click',
							function() {
								if ($accordian.hasClass('is-open')) {
									$accordian.removeClass('is-open');
									$span.removeClass('up');
									$span.addClass('down');
									return;
								}
								$accordian.addClass('is-open');
								$span.removeClass('down');
								$span.addClass('up');
								$('html, body')
									.animate({
											scrollTop: $accordian.offset().top
										},
										500);
							});
						$close.on('click',
							function() {
								$accordian.removeClass('is-open');
								$span.removeClass('up');
								$span.addClass('down');
							});
					});
				};

				$('.show-more-accordion').showMoreAccordionComponent();

				$('.full-accordion').fullAccordionComponent();

			}
		});
		// Our module now returns our view
		return TourOptionalExcursionsListView;
	});